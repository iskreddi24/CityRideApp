import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import Vehicle from '../models/Vehicle.js'
import Complaint from '../models/Complaint.js'
import Booking from '../models/Booking.js'

const r = Router()

// --- VEHICLE APPROVALS ---
r.get('/vehicles/pending', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const list = await Vehicle.find({ status: 'Pending' }).populate('ownerId', 'name email').lean()
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

r.post('/vehicles/review', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { vehicleId, status = 'Approved' } = req.body || {}
    if (!vehicleId) return res.status(400).json({ error: 'vehicleId required' })
    await Vehicle.findByIdAndUpdate(vehicleId, { status })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

// --- COMPLAINT MANAGEMENT ---
r.get('/complaints', authRequired, requireRole('admin'), async (req, res) => {
  const { status } = req.query
  const q = status ? { status } : {}
  const list = await Complaint.find(q)
    .populate('userId', 'email name')
    .sort({ createdAt: -1 })
    .lean()

  res.json(list)
})

r.post('/complaints/update', authRequired, requireRole('admin'), async (req, res) => {
  const { complaintId, status } = req.body || {}
  if (!complaintId || !status)
    return res.status(400).json({ error: 'complaintId and status required' })

  await Complaint.findByIdAndUpdate(complaintId, { status, updatedAt: new Date() })
  res.json({ ok: true })
})

// --- BOOKING COMMISSIONS SUMMARY ---
r.get('/bookings', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('rideId', 'startPoint endPoint date')
      .populate('userId', 'email')
      .populate('ownerId', 'email')
      .lean()
    const totalCommission = bookings.reduce((sum, b) => sum + (b.adminCommission || 0), 0)
    res.json({ bookings, totalCommission })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

export default r


import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import Complaint from '../models/Complaint.js'

const r = Router()

r.post('/submit', authRequired, async (req,res)=>{
  const { rideId, reason, details, anonymous=false } = req.body || {}
  if (!rideId || !reason) return res.status(400).json({ error:'rideId and reason required' })
  const doc = await Complaint.create({ rideId, userId:req.user.id, reason, details: details||'', anonymous })
  res.json({ ok:true, id: doc._id })
})

export default r

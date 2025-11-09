import fs from 'fs'
import path from 'path'
import cloudinary from '../config/cloudinary.js'

import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

import Vehicle from '../models/Vehicle.js'

const r = Router()

r.get('/my', authRequired, async (req, res) => {
  const list = await Vehicle.find({ ownerId: req.user.id }).lean()
  res.json(list)
})


r.post('/', authRequired, upload.fields([
  { name: 'rcDoc', maxCount: 1 },
  { name: 'insuranceDoc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { model, plate, type = 'Car' } = req.body
    if (!model || !plate)
      return res.status(400).json({ error: 'model and plate required' })

    const rcDocUrl = req.files?.rcDoc ? `/uploads/${req.files.rcDoc[0].filename}` : null
    const insuranceDocUrl = req.files?.insuranceDoc ? `/uploads/${req.files.insuranceDoc[0].filename}` : null

    const existing = await Vehicle.findOne({ plate })
    if (existing) return res.status(409).json({ error: 'plate already registered' })

    const vehicle = await Vehicle.create({
      ownerId: req.user.id,
      model,
      plate,
      type,
      rcDocUrl,
      insuranceDocUrl,
    })

    res.json(vehicle)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'upload_failed' })
  }
})

r.delete('/:id', authRequired, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      status: { $in: ['Pending', 'Rejected'] },
    })

    if (!vehicle)
      return res.status(404).json({ error: 'not_found_or_not_deletable' })

    // --- Delete local files ---
    const deleteLocalFile = (url) => {
      if (url && url.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), url)
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
      }
    }

    deleteLocalFile(vehicle.rcDocUrl)
    deleteLocalFile(vehicle.insuranceDocUrl)

    // --- Delete Cloudinary files if exist ---
    const deleteCloudinaryFile = async (url) => {
      if (url?.includes('res.cloudinary.com')) {
        const parts = url.split('/')
        const publicId = parts.slice(-2).join('/').split('.')[0] // get "folder/file"
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (err) {
          console.warn('Cloudinary deletion failed:', err.message)
        }
      }
    }

    await deleteCloudinaryFile(vehicle.rcDocUrl)
    await deleteCloudinaryFile(vehicle.insuranceDocUrl)

    await vehicle.deleteOne()

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})



export default r

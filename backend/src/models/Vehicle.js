import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  model: { type: String, required: true },
  plate: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Car', 'Bike', 'Auto'], default: 'Car' },
  rcDocUrl: String, // uploaded RC proof (PDF / image)
  insuranceDocUrl: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Vehicle', schema)

// src/models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  resetTokenHash: String,
  resetTokenExp: Date
}, { timestamps: true })

export default mongoose.model('User', userSchema)

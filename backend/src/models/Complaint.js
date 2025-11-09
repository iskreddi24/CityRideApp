
import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref:'Ride' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  reason: String,
  details: String,
  status: { type:String, default:'Open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  anonymous: { type:Boolean, default:false }
})
export default mongoose.model('Complaint', schema)

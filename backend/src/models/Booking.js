import mongoose from "mongoose";

const schema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentId: String,
  paymentAmount: Number,
  adminCommission: Number,
  status: { type: String, enum: ["Confirmed", "Cancelled"], default: "Confirmed" },
  seatsBooked: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", schema);

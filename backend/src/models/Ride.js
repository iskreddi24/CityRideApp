import mongoose from "mongoose";

const schema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },

  pickupAddress: { type: String, required: true },
  dropAddress: { type: String, required: true },

  pickupLocation: {
    lat: { type: Number, default: 17.3850 },  
    lng: { type: Number, default: 78.4867 },
  },
  dropLocation: {
    lat: { type: Number, default: 17.3850 },
    lng: { type: Number, default: 78.4867 },
  },

  date: { type: String, required: true },
  time: { type: String, required: true },
  pricePerRide: { type: Number, required: true },
  availableSeats: { type: Number, default: 1 },
  status: { type: String, enum: ["Active", "Completed", "Cancelled"], default: "Active" },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ride", schema);

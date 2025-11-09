import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import Ride from "../models/Ride.js";

const r = Router();

/**
 * 🧾 GET /api/bookings/my
 * Fetch bookings for the logged-in user
 */
r.get("/my", authRequired, async (req, res) => {
  try {
    const list = await Booking.find({ userId: req.user.id })
      .populate("rideId")
      .lean();

    res.json(
      list.map((b) => ({
        ...b,
        ride: b.rideId
          ? {
              startPoint: b.rideId.startPoint,
              endPoint: b.rideId.endPoint,
              date: b.rideId.date,
              time: b.rideId.time,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error("💥 Error fetching user bookings:", err);
    res.status(500).json({ error: "failed_to_fetch_bookings" });
  }
});

/**
 * 💳 POST /api/bookings/confirm
 * Confirm booking after mock payment
 */
/**
 * 💳 POST /api/bookings/confirm
 * Confirm booking after payment and reduce available seats
 */
r.post("/confirm", authRequired, async (req, res) => {
  try {
    const { rideId, paymentId, seatsBooked = 1 } = req.body;
    if (!rideId || !paymentId)
      return res.status(400).json({ error: "rideId and paymentId required" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "ride_not_found" });

    if (ride.availableSeats < seatsBooked) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    // Create booking
    const booking = await Booking.create({
      rideId: ride._id,
      userId: req.user.id,
      ownerId: ride.ownerId,
      paymentId,
      paymentAmount: ride.pricePerRide * 100 * seatsBooked,
      adminCommission: Math.floor(ride.pricePerRide * 10),
      status: "Confirmed",
      seatsBooked,
    });

    // Decrease available seats
    ride.availableSeats -= seatsBooked;
    await ride.save();

    res.json({ ok: true, booking });
  } catch (err) {
    console.error("💥 Booking confirm error:", err);
    res.status(500).json({ error: "booking_confirm_failed" });
  }
});

/**
 * 👀 GET /api/bookings/owner
 * Fetch all bookings for rides owned by the logged-in owner
 */
r.get("/owner", authRequired, async (req, res) => {
  try {
    const list = await Booking.find({ ownerId: req.user.id })
      .populate("userId", "name email")
      .populate("rideId", "startPoint endPoint date time pricePerRide")
      .lean();

    res.json(
      list.map((b) => ({
        ride: b.rideId
          ? {
              startPoint: b.rideId.startPoint,
              endPoint: b.rideId.endPoint,
              date: b.rideId.date,
              time: b.rideId.time,
            }
          : null,
        user: b.userId
          ? {
              name: b.userId.name || "N/A",
              email: b.userId.email || "N/A",
            }
          : null,
        seatsBooked: b.seatsBooked || 1,
        amount: (b.paymentAmount || 0) / 100,
        status: b.status,
      }))
    );
  } catch (err) {
    console.error("💥 Owner booking fetch failed:", err);
    res.status(500).json({ error: "failed_to_fetch_owner_bookings" });
  }
});

export default r;

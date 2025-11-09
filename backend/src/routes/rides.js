import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import Ride from '../models/Ride.js'
import Booking from '../models/Booking.js'

const r = Router()

function isHyderabadPlace(text) {
  return /hyderabad|madhapur|gachibowli|ameerpet|hitec|secunderabad|kondapur|lb nagar/i.test(text || '')
}

r.get('/my', authRequired, async (req, res) => {
  try {
    const rides = await Ride.find({ ownerId: req.user.id })
      .populate('vehicleId')
      .sort({ createdAt: -1 })
      .lean()
    res.json(rides)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch rides' })
  }
})

// 🔹 2️⃣ Owner — Post new ride
// 🔹 2️⃣ Owner — Post new ride
r.post('/', authRequired, async (req, res) => {
  try {
    const {
      startPoint,
      endPoint,
      pickupAddress,
      dropAddress,
      date,
      time,
      pricePerRide,
      availableSeats,
      vehicleId,
      pickupLocation,
      dropLocation,
    } = req.body;

    // Validate required fields
    if (
      !startPoint ||
      !endPoint ||
      !pickupAddress ||
      !dropAddress ||
      !vehicleId
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ride = await Ride.create({
      ownerId: req.user.id,
      vehicleId,
      startPoint,
      endPoint,
      pickupAddress,
      dropAddress,
      pickupLocation: pickupLocation || { lat: 17.385, lng: 78.4867 },
      dropLocation: dropLocation || { lat: 17.385, lng: 78.4867 },
      date,
      time,
      pricePerRide,
      availableSeats,
    });

    res.status(201).json(ride);
  } catch (err) {
    console.error("❌ Ride creation failed:", err);
    res.status(500).json({ error: 'Failed to create ride' });
  }
});


// 🔹 3️⃣ Owner — Delete a ride
r.delete('/:id', authRequired, async (req, res) => {
  try {
    const ride = await Ride.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    })
    if (!ride) return res.status(404).json({ error: 'Ride not found' })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete ride' })
  }
})

// 🔹 4️⃣ User — Search rides (already working)
r.get('/search', authRequired, async (req, res) => {
  try {
    const { from = '', to = '', date, seats = 1 } = req.query
    if (!from || !to) return res.status(400).json({ error: 'from/to required' })

    if (!isHyderabadPlace(from) || !isHyderabadPlace(to)) return res.json([])

    const query = {
      startPoint: new RegExp(from, 'i'),
      endPoint: new RegExp(to, 'i'),
    }
    if (date) query.date = date

const rides = await Ride.find({ 
  ...query,
  availableSeats: { $gt: 0 } 
}).sort({ time: 1 }).limit(50).lean();

    const results = []
    for (const ride of rides) {
      const booked = await Booking.countDocuments({ rideId: ride._id })
      const seatsLeft = ride.availableSeats - booked
      if (seatsLeft >= parseInt(seats)) results.push({ ...ride, seatsLeft })
    }

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  }
})

export default r

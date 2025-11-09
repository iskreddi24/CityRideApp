import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import vehicleRoutes from './src/routes/vehicles.js'
import rideRoutes from './src/routes/rides.js'
import bookingRoutes from './src/routes/bookings.js'
import complaintRoutes from './src/routes/complaints.js'
import adminRoutes from './src/routes/admin.js'
import paymentRoutes from './src/routes/payments.js'
import reviewRoutes from "./src/routes/reviews.js";

dotenv.config() // ✅ only once

const app = express()
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }))

connectDB()

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/rides', rideRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/uploads', express.static('uploads'))
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log('🚀 API running on port', PORT))

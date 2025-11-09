
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { authRequired } from '../middleware/auth.js'

const r = Router()

r.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Missing fields' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)

    const userRole = email === process.env.ADMIN_EMAIL ? 'admin' : role || 'user'

    const user = await User.create({ name, email, passwordHash, role: userRole })

    res.json({
      message: 'Account created',
      user: { id: user._id, email: user.email, role: user.role }
    })
  } catch (e) {
    console.error('Signup error:', e)
    res.status(500).json({ error: 'Signup failed' })
  }
})


r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password)
      return res.status(400).json({ error: 'Missing credentials' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' })

    // compare with user.passwordHash (NOT user.password)
    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if (!ok)
      return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Login failed' })
  }
})


r.post('/forgot', async (req,res)=>{
  const { email } = req.body || {}
  const user = await User.findOne({ email })
  if (!user) return res.status(200).json({ ok:true }) // don't reveal existence
  const raw = crypto.randomBytes(24).toString('hex')
  const resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex')
  const ttl = parseInt(process.env.RESET_TOKEN_TTL_MINUTES||'30',10)
  user.resetTokenHash = resetTokenHash
  user.resetTokenExp = new Date(Date.now()+ttl*60000)
  await user.save()
  // Return the raw token to frontend for EmailJS email
  res.json({ token: raw })
})

r.post('/reset', async (req,res)=>{
  const { email, token, password } = req.body || {}
  const user = await User.findOne({ email })
  if (!user || !user.resetTokenHash || !user.resetTokenExp) return res.status(400).json({ error:'Invalid reset request' })
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  if (hash !== user.resetTokenHash || new Date() > user.resetTokenExp) return res.status(400).json({ error:'Token expired/invalid' })
  user.passwordHash = await bcrypt.hash(password,10)
  user.resetTokenHash = undefined; user.resetTokenExp = undefined
  await user.save()
  res.json({ ok:true })
})

r.get('/me', authRequired, async (req,res)=>{
  const user = await User.findById(req.user.id).lean()
  if (!user) return res.status(404).json({ error:'Not found' })
  res.json({ id:user._id, name:user.name, email:user.email, role:user.role })
})

r.post('/profile', authRequired, async (req,res)=>{
  const { name, role } = req.body || {}
  const u = await User.findById(req.user.id)
  if (!u) return res.status(404).json({ error:'Not found' })
  u.name = name ?? u.name
  // Admin elevation must be manual; ignore if user tries to set admin
  if (role && role !== 'admin') u.role = role
  await u.save()
  res.json({ ok:true })
})

r.post('/logout', (req,res)=> res.json({ ok:true }))

export default r

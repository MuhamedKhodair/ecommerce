const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const rateLimit = require('express-rate-limit')
const prisma = require('../config/prisma')
const { auth } = require('../middleware/auth')
const { sendMail } = require('../utils/mailer')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS)
}

function clearTokenCookie(res) {
  res.clearCookie('token', COOKIE_OPTIONS)
}

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, email, password } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    setTokenCookie(res, token)

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', loginLimiter, [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    setTokenCookie(res, token)

    const notifyEmail = process.env.NOTIFY_EMAIL
    if (notifyEmail) {
      const ip = req.ip || req.socket.remoteAddress
      const time = new Date().toLocaleString('en-GB', { timeZone: 'UTC' })
      sendMail({
        to: notifyEmail,
        subject: 'New login to ShopNext',
        html: `
          <p>A user just logged into ShopNext.</p>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
            <li><strong>IP:</strong> ${ip}</li>
            <li><strong>Time (UTC):</strong> ${time}</li>
          </ul>
        `,
      })
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
})

router.post('/logout', (req, res) => {
  clearTokenCookie(res)
  res.json({ message: 'Logged out' })
})

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user })
})

module.exports = router

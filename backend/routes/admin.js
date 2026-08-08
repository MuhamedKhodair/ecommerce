const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const prisma = require('../config/prisma')
const { auth, admin } = require('../middleware/auth')
const { sendError } = require('../utils/errors')
const { serializeProduct } = require('../utils/serialize')

const router = express.Router()

router.use(auth, admin)

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        include: { category: true },
      }),
    ])

    const parsedOrders = recentOrders.map(o => ({
      ...o,
      shippingAddress: typeof o.shippingAddress === 'string'
        ? JSON.parse(o.shippingAddress)
        : o.shippingAddress,
    }))

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders: parsedOrders,
      lowStockProducts: lowStockProducts.map(serializeProduct),
    })
  } catch (error) {
    return sendError(res, 'GET /admin/stats', error)
  }
})

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      }),
      prisma.user.count({ where }),
    ])
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    return sendError(res, 'GET /admin/users', error)
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    return sendError(res, 'GET /admin/users/:id', error)
  }
})

const safeSelect = { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }

router.post('/users', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, email, password, role } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'user' },
      select: safeSelect,
    })
    res.status(201).json(user)
  } catch (error) {
    return sendError(res, 'POST /admin/users', error, 400)
  }
})

router.put('/users/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!targetUser) return res.status(404).json({ message: 'User not found' })

    const isSelf = targetUser.id === req.user.id
    if (isSelf && req.body.role && req.body.role !== targetUser.role) {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    const data = {}
    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.email !== undefined) data.email = req.body.email
    if (req.body.role !== undefined) data.role = req.body.role
    if (req.body.password) data.password = await bcrypt.hash(req.body.password, 12)

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: safeSelect,
    })
    res.json(user)
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email already registered' })
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' })
    return sendError(res, 'PUT /admin/users/:id', error, 400)
  }
})

router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!targetUser) return res.status(404).json({ message: 'User not found' })

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json(user)
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' })
    return sendError(res, 'PUT /admin/users/:id/role', error)
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'User deleted' })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' })
    return sendError(res, 'DELETE /admin/users/:id', error)
  }
})

router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const where = {}
    if (status) where.status = status
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ])
    const parsed = orders.map(o => ({
      ...o,
      shippingAddress: typeof o.shippingAddress === 'string'
        ? JSON.parse(o.shippingAddress)
        : o.shippingAddress,
    }))
    res.json({ orders: parsed, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    return sendError(res, 'GET /admin/orders', error)
  }
})

router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: { items: true },
    })
    res.json(order)
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Order not found' })
    return sendError(res, 'PUT /admin/orders/:id/status', error)
  }
})

router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, stockFilter } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (category) where.category = { is: { name: category } }
    if (stockFilter === 'low') where.stock = { lte: 5 }
    if (stockFilter === 'out') where.stock = 0

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { category: true } }),
      prisma.product.count({ where }),
    ])
    res.json({ products: products.map(serializeProduct), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    return sendError(res, 'GET /admin/products', error)
  }
})

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(categories.map(c => ({ id: c.id, name: c.name })))
  } catch (error) {
    return sendError(res, 'GET /admin/categories', error)
  }
})

module.exports = router

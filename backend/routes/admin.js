const express = require('express')
const { body, validationResult } = require('express-validator')
const prisma = require('../config/prisma')
const { auth, admin } = require('../middleware/auth')

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
      lowStockProducts,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
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
    res.status(500).json({ message: error.message })
  }
})

router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, stockFilter } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) where.category = category
    if (stockFilter === 'low') where.stock = { lte: 5 }
    if (stockFilter === 'out') where.stock = 0

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ])
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    })
    res.json(products.map(p => p.category))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

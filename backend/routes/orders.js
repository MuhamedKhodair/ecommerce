const express = require('express')
const { body, validationResult } = require('express-validator')
const prisma = require('../config/prisma')
const { auth } = require('../middleware/auth')
const { sendError } = require('../utils/errors')

const router = express.Router()

const parseOrder = order => ({
  ...order,
  shippingAddress: typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress,
})

router.get('/', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders.map(parseOrder))
  } catch (error) {
    return sendError(res, 'GET /orders', error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(parseOrder(order))
  } catch (error) {
    return sendError(res, 'GET /orders/:id', error)
  }
})

router.put('/:id/status', auth, [
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
    })
    res.json(order)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' })
    }
    return sendError(res, 'PUT /orders/:id/status', error)
  }
})

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.name').trim().notEmpty().withMessage('Product name is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { items, shippingAddress, totalAmount } = req.body

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.product } })
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        })
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user?.id || null,
        items: {
          create: items.map(item => ({
            product: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        shippingAddress: JSON.stringify(shippingAddress),
        totalAmount,
      },
    })

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.product },
        data: { stock: { decrement: item.quantity } },
      })
    }

    res.status(201).json(parseOrder(order))
  } catch (error) {
    return sendError(res, 'POST /orders', error)
  }
})

module.exports = router

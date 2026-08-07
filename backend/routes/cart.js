const express = require('express')
const prisma = require('../config/prisma')
const { auth } = require('../middleware/auth')
const { sendError } = require('../utils/errors')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })
    res.json(cart || { items: [] })
  } catch (error) {
    return sendError(res, 'GET /cart', error)
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          items: { create: { product: productId, quantity: quantity || 1 } },
        },
        include: { items: true },
      })
      return res.json(cart)
    }

    const existingItem = cart.items.find(item => item.product === productId)
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, product: productId, quantity: quantity || 1 },
      })
    }

    cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    res.json(cart)
  } catch (error) {
    return sendError(res, 'POST /cart', error)
  }
})

router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const item = cart.items.find(item => item.product === req.params.productId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      })
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    res.json(updatedCart)
  } catch (error) {
    return sendError(res, 'PUT /cart/:productId', error)
  }
})

router.delete('/:productId', auth, async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const item = cart.items.find(item => item.product === req.params.productId)
    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    })

    res.json(updatedCart)
  } catch (error) {
    return sendError(res, 'DELETE /cart/:productId', error)
  }
})

module.exports = router

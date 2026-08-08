const express = require('express')
const { body, validationResult } = require('express-validator')
const prisma = require('../config/prisma')
const { auth, admin } = require('../middleware/auth')
const { sendError } = require('../utils/errors')
const { isUploadedImage, deleteUploadedImage } = require('../utils/uploads')
const { serializeProduct } = require('../utils/serialize')

const router = express.Router()

const isValidImage = value => !value || /^https?:\/\/.+/i.test(value) || isUploadedImage(value)

router.get('/', async (req, res) => {
  try {
    const { search, category, limit = 50, page = 1 } = req.query
    const where = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (category) where.category = { is: { name: category } }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Math.min(parseInt(limit), 100),
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ])

    res.json({
      products: products.map(serializeProduct),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    return sendError(res, 'GET /products', error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(serializeProduct(product))
  } catch (error) {
    return sendError(res, 'GET /products/:id', error)
  }
})

router.post('/', auth, admin, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('image').optional().trim().custom(isValidImage).withMessage('Image must be a valid URL or upload'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } })
    if (!category) {
      return res.status(400).json({ message: 'Category not found' })
    }
    const { categoryId, ...data } = req.body
    const product = await prisma.product.create({ data: { ...data, categoryId }, include: { category: true } })
    res.status(201).json(serializeProduct(product))
  } catch (error) {
    return sendError(res, 'POST /products', error, 400)
  }
})

router.put('/:id', auth, admin, [
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0.01 }),
  body('categoryId').optional().notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }),
  body('image').optional().trim().custom(isValidImage).withMessage('Image must be a valid URL or upload'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    const current = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!current) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } })
      if (!category) {
        return res.status(400).json({ message: 'Category not found' })
      }
    }
    const { categoryId, ...data } = req.body
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { ...data, ...(categoryId ? { categoryId } : {}) },
      include: { category: true },
    })
    if (req.body.image && req.body.image !== current.image) {
      deleteUploadedImage(current.image)
    }
    res.json(serializeProduct(product))
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' })
    }
    return sendError(res, 'PUT /products/:id', error, 400)
  }
})

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    await prisma.product.delete({ where: { id: req.params.id } })
    deleteUploadedImage(product.image)
    res.json({ message: 'Product deleted' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' })
    }
    return sendError(res, 'DELETE /products/:id', error)
  }
})

module.exports = router

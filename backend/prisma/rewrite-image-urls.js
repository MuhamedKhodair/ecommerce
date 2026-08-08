const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const OLD_BASE = 'http://79.76.98.10:5000/uploads/'
const ORIGIN = 'http://79.76.98.10:5000'

;(async () => {
  const products = await prisma.product.findMany({
    where: { image: { startsWith: OLD_BASE } },
    select: { id: true, image: true },
  })

  for (const product of products) {
    const relative = product.image.slice(ORIGIN.length)
    await prisma.product.update({
      where: { id: product.id },
      data: { image: relative },
    })
    console.log(`rewrite: ${product.id} ${product.image} -> ${relative}`)
  }

  console.log(`done: rewrote ${products.length} product images`)
})().then(
  () => prisma.$disconnect(),
  async err => {
    console.error('rewrite error:', err.message)
    await prisma.$disconnect()
    process.exit(1)
  }
)

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const products = [
  { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 149.99, category: 'Electronics', stock: 50, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
  { name: 'Organic Cotton T-Shirt', description: 'Comfortable 100% organic cotton t-shirt in classic fit.', price: 29.99, category: 'Clothing', stock: 100, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { name: 'Smart Watch Pro', description: 'Advanced smartwatch with health tracking, GPS, and 7-day battery.', price: 249.99, category: 'Electronics', stock: 30, image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72f9?w=400&h=400&fit=crop' },
  { name: 'Ceramic Coffee Mug', description: 'Handcrafted ceramic mug, 12oz capacity, microwave safe.', price: 19.99, category: 'Home', stock: 75, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop' },
  { name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat with carrying strap.', price: 39.99, category: 'Sports', stock: 60, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop' },
  { name: 'Leather Messenger Bag', description: 'Genuine leather messenger bag with padded laptop compartment.', price: 89.99, category: 'Clothing', stock: 25, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
  { name: 'Bluetooth Speaker', description: 'Portable waterproof speaker with 360-degree sound.', price: 59.99, category: 'Electronics', stock: 40, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
  { name: 'Cookbook: Healthy Recipes', description: '200+ healthy and delicious recipes for everyday cooking.', price: 24.99, category: 'Books', stock: 80, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop' },
  { name: 'Desk Lamp LED', description: 'Adjustable LED desk lamp with USB charging port.', price: 44.99, category: 'Home', stock: 45, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop' },
  { name: 'Running Shoes', description: 'Lightweight running shoes with responsive cushioning.', price: 119.99, category: 'Sports', stock: 35, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { name: 'Stainless Steel Water Bottle', description: 'Double-wall insulated, keeps drinks cold 24hrs or hot 12hrs.', price: 34.99, category: 'Home', stock: 90, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop' },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with silent clicks.', price: 25.99, category: 'Electronics', stock: 65, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
  { name: 'Denim Jacket', description: 'Classic denim jacket with modern fit.', price: 79.99, category: 'Clothing', stock: 20, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop' },
  { name: 'Resistance Bands Set', description: 'Set of 5 resistance bands with different tension levels.', price: 15.99, category: 'Sports', stock: 70, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop' },
  { name: 'Mystery Novel Collection', description: 'Bestselling mystery novels box set (5 books).', price: 49.99, category: 'Books', stock: 40, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop' },
]

async function seed() {
  try {
    await prisma.product.deleteMany()

    const categoryNames = [...new Set(products.map(p => p.category))]
    const categoryIds = {}
    for (const name of categoryNames) {
      const cat = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      categoryIds[name] = cat.id
    }

    await prisma.product.createMany({
      data: products.map(({ category, ...rest }) => ({ ...rest, categoryId: categoryIds[category] })),
    })
    console.log(`Seeded ${products.length} products across ${categoryNames.length} categories`)

    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@shopnext.com' } })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 12)
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@shopnext.com',
          password: hashedPassword,
          role: 'admin',
        },
      })
      console.log('Created admin user: admin@shopnext.com / Admin123!')
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Seed error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

seed()

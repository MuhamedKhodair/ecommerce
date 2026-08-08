const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function tableExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`
  )
  return rows.length > 0
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`)
  return rows.some(r => r.name === column)
}

async function ensureCategories() {
  if (!(await tableExists('Category'))) {
    console.log('migrate: creating Category table')
    await prisma.$executeRawUnsafe(
      `CREATE TABLE "Category" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )`
    )
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name")')
  }

  if (await columnExists('Product', 'category')) {
    console.log('migrate: backfilling categories from Product.category')
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO "Category" ("id", "name", "createdAt", "updatedAt")
       SELECT 'cat_' || lower(hex(randomblob(4))), "category", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       FROM (SELECT DISTINCT "category" FROM "Product")`
    )
  }
}

async function migrateProducts() {
  if (!(await columnExists('Product', 'categoryId'))) {
    console.log('migrate: adding Product.categoryId')
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT')
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET "categoryId" = (
         SELECT "id" FROM "Category" WHERE "Category"."name" = "Product"."category"
       )`
    )
  }

  if (await columnExists('Product', 'category')) {
    console.log('migrate: rebuilding Product to drop legacy category column')
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "new_Product"')
    await prisma.$executeRawUnsafe(
      `CREATE TABLE "new_Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" REAL NOT NULL,
        "image" TEXT NOT NULL DEFAULT '',
        "stock" INTEGER NOT NULL DEFAULT 0,
        "categoryId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`
    )
    await prisma.$executeRawUnsafe(
      `INSERT INTO "new_Product" ("id", "name", "description", "price", "image", "stock", "categoryId", "createdAt", "updatedAt")
       SELECT "id", "name", "description", "price", "image", "stock", "categoryId", "createdAt", "updatedAt"
       FROM "Product"`
    )
    await prisma.$executeRawUnsafe('DROP TABLE "Product"')
    await prisma.$executeRawUnsafe('ALTER TABLE "new_Product" RENAME TO "Product"')
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")')
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Product_name_description_idx" ON "Product"("name", "description")')
  }
}

;(async () => {
  if (!(await tableExists('Product'))) {
    console.log('migrate: Product table not present yet, nothing to migrate')
    return
  }
  await ensureCategories()
  await migrateProducts()
  console.log('migrate: done')
})().then(
  () => prisma.$disconnect(),
  async err => {
    console.error('migrate error:', err.message)
    await prisma.$disconnect()
    process.exit(1)
  }
)

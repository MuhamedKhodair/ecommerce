function serializeProduct(product) {
  if (!product) return product
  const { category, ...rest } = product
  return { ...rest, category: category ? category.name : null }
}

module.exports = { serializeProduct }

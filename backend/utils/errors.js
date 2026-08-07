function sendError(res, context, error, status = 500) {
  console.error(`[${context}]`, error)
  res.status(status).json({ message: 'Internal server error' })
}

module.exports = { sendError }

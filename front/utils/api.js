const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function request(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Request failed')
  }

  return res.json()
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/products${query ? `?${query}` : ''}`)
  },
  getProduct: id => request(`/api/products/${id}`),
  createProduct: data => request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: id => request(`/api/products/${id}`, { method: 'DELETE' }),
  createOrder: orderData => request('/api/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrder: id => request(`/api/orders/${id}`),
  getAdminStats: () => request('/api/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/admin/users${query ? `?${query}` : ''}`)
  },
  updateUserRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  createUser: data => request('/api/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: id => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/admin/orders${query ? `?${query}` : ''}`)
  },
  updateOrderStatus: (id, status) => request(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/admin/products${query ? `?${query}` : ''}`)
  },
  uploadImage: file => {
    const formData = new FormData()
    formData.append('image', file)
    return request('/api/upload', { method: 'POST', body: formData })
  },
}

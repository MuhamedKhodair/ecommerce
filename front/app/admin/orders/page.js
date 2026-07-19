'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'

const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      const data = await api.getAdminOrders(params)
      setOrders(data.orders)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Manage customer orders</p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setFilter('')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${!filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} &middot; ${order.totalAmount.toFixed(2)}
                  </p>
                  {order.shippingAddress && (
                    <p className="mt-1 text-xs text-gray-500">
                      Ship to: {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                  )}
                </div>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize ${statusColors[order.status]}`}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Items</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-900">{item.name} x{item.quantity}</span>
                      <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

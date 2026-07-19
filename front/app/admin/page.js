'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-center text-gray-500">Failed to load dashboard.</p>
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, href: '/admin/users', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Products', value: stats.totalProducts, href: '/admin/products', color: 'bg-green-50 text-green-700' },
    { label: 'Total Orders', value: stats.totalOrders, href: '/admin/orders', color: 'bg-purple-50 text-purple-700' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, href: '/admin/orders', color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of your store</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-2 inline-block rounded-full px-3 py-1 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Products</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">All products are well stocked.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

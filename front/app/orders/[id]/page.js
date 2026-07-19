'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-200" />
          <div className="mx-auto h-8 w-64 rounded bg-gray-200" />
          <div className="mx-auto h-48 rounded-2xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link href="/" className="btn-primary mt-6 inline-flex">Go home</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Order confirmed!</h1>
        <p className="mt-2 text-sm text-gray-500">Your order has been placed successfully.</p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="card divide-y divide-gray-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Order number</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Status</p>
              <p className="mt-1 text-sm font-medium capitalize text-emerald-600">{order.status}</p>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Items</p>
            <div className="mt-3 space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-900">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Shipping to</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.email}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.zip}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6">
            <p className="text-base font-semibold text-gray-900">Total</p>
            <p className="text-xl font-bold text-gray-900">${(order.totalAmount || order.total)?.toFixed(2)}</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/products" className="btn-primary inline-flex">
            Continue Shopping
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

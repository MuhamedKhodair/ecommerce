'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function Checkout() {
  const router = useRouter()
  const { cart, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Continue Shopping</Link>
      </div>
    )
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cart.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: form,
          totalAmount: totalPrice,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Order failed')
      }

      const order = await res.json()
      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex items-center justify-center gap-4">
        {['Cart', 'Shipping', 'Payment'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step > i ? 'bg-emerald-600 text-white' : step === i + 1 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > i ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`hidden text-sm font-medium sm:inline ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <div className={`hidden h-px w-12 sm:block ${step > i + 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="mt-12 lg:flex lg:gap-12">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-900">Full name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field mt-1.5" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field mt-1.5" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} required className="input-field mt-1.5" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-900">City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} required className="input-field mt-1.5" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">ZIP code</label>
                <input type="text" name="zip" value={form.zip} onChange={handleChange} required className="input-field mt-1.5" placeholder="10001" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/cart" className="btn-ghost text-sm text-gray-500 hover:text-gray-900">
                &larr; Back to cart
              </Link>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 lg:mt-0 lg:w-80">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {cart.slice(0, 3).map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[180px]">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {cart.length > 3 && (
                <p className="text-xs text-gray-400">+{cart.length - 3} more items</p>
              )}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">{totalPrice > 50 ? 'Free' : '$5.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">${(totalPrice * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>${(totalPrice + (totalPrice > 50 ? 0 : 5) + totalPrice * 0.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

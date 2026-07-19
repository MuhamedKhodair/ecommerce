'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import CartItem from '@/components/CartItem'

export default function Cart() {
  const { cart, totalPrice, clearCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-gray-500">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/products" className="btn-primary mt-8 inline-flex">
            Continue Shopping
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="btn-ghost text-sm text-gray-500 hover:text-red-500">
          Clear cart
        </button>
      </div>

      <div className="mt-8 lg:flex lg:gap-8">
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-8 lg:mt-0 lg:w-80">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-3">
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
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${(totalPrice + (totalPrice > 50 ? 0 : 5) + totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-ghost mt-3 w-full text-sm text-gray-500 hover:text-gray-900">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

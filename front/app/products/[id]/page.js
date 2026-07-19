'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="animate-pulse lg:flex lg:gap-12">
          <div className="aspect-square rounded-3xl bg-gray-200 lg:w-1/2" />
          <div className="mt-8 space-y-4 lg:mt-0 lg:w-1/2">
            <div className="h-4 w-20 rounded-full bg-gray-200" />
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-6 w-24 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block text-sm text-gray-600 underline hover:text-gray-900">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900 transition">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900 transition">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="lg:flex lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-3xl bg-gray-50 lg:w-1/2">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-24 w-24 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>

        <div className="mt-8 lg:mt-0 lg:w-1/2 lg:pt-4">
          <div className="badge">{product.category}</div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">${product.price?.toFixed(2)}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-600">{product.description}</p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">Quantity</span>
              <div className="flex items-center rounded-full border-2 border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`btn-primary w-full py-4 text-base ${
                added ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart
                </span>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=4`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const features = [
    { title: 'Free Shipping', description: 'On orders over $50', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { title: 'Easy Returns', description: '30-day return policy', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Secure Payment', description: '256-bit SSL encryption', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
    { title: '24/7 Support', description: 'Dedicated support team', icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155' },
  ]

  return (
    <div>
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium Products,{' '}
              <span className="text-gray-400">Curated for You</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Discover our handpicked collection of high-quality products. From cutting-edge electronics to timeless essentials — find everything you need.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products" className="btn-primary inline-flex">
                Shop Now
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/products" className="btn-outline border-white/20 text-white hover:border-white/40 hover:bg-white/10">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {features.map(feature => (
            <div key={feature.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <svg className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="mt-2 text-sm text-gray-500">Handpicked favorites from our collection.</p>
            </div>
            <Link href="/products" className="btn-ghost hidden sm:inline-flex">
              View All
              <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-2xl bg-gray-200" />
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-16 rounded-full bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-5 w-20 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
              : products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-3xl bg-gray-900">
          <div className="px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Join Our Community
              </h2>
              <p className="mt-4 text-base text-gray-400">
                Sign up for exclusive access to new arrivals, limited editions, and special offers.
              </p>
              <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={e => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field flex-1 border-white/20 bg-white/10 text-white placeholder:text-gray-500 focus:border-white/40"
                />
                <button type="submit" className="btn-primary shrink-0 bg-white text-gray-900 hover:bg-gray-100">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

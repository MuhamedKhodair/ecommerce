'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'

const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Sports', 'Books']

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setCategory(searchParams.get('category') || '')
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products?${params}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, category])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    updateParam('search', value)
  }

  const handleCategoryChange = (cat) => {
    const value = cat === 'All' ? '' : cat
    setCategory(value)
    updateParam('category', value)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Search</h3>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Categories</h3>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`rounded-full px-4 py-2 text-left text-sm font-medium transition ${
                      (cat === 'All' && !category) || category === cat
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
            {!loading && (
              <p className="text-sm text-gray-500">{products.length} result{products.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-gray-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-16 rounded-full bg-gray-200" />
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-5 w-20 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-16 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
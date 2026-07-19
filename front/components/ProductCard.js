import Link from 'next/link'

const categoryColors = {
  Electronics: 'bg-blue-50 text-blue-700',
  Clothing: 'bg-rose-50 text-rose-700',
  Home: 'bg-amber-50 text-amber-700',
  Sports: 'bg-emerald-50 text-emerald-700',
  Books: 'bg-violet-50 text-violet-700',
}

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card-hover overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[product.category] || 'bg-gray-100 text-gray-700'}`}>
              {product.category}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 transition group-hover:text-gray-600">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-semibold tracking-tight text-gray-900">
            ${product.price?.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  )
}

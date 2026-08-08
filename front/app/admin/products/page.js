'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import Image from 'next/image'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', stock: '', image: '' })
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])

  const loadCategories = async () => {
    try {
      const data = await api.getAdminCategories()
      setCategories(data)
    } catch (e) {
      // non-fatal; form falls back to text input
    }
  }

  useEffect(() => { loadCategories() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminProducts({ search })
      setProducts(data.products)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [search])

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', categoryId: '', stock: '', image: '' })
    setEditing(null)
    setShowForm(false)
    setError('')
    setFormError('')
    setUploading(false)
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      categoryId: product.categoryId || '',
      stock: String(product.stock),
      image: product.image || '',
    })
    setCategories(prev =>
      prev.some(c => c.id === product.categoryId)
        ? prev
        : [...prev, { id: product.categoryId, name: product.category }]
    )
    setEditing(product.id)
    setShowForm(true)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFormError('')
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      }
      if (editing) {
        await api.updateProduct(editing, payload)
      } else {
        await api.createProduct(payload)
      }
      resetForm()
      loadProducts()
    } catch (e) {
      setFormError(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.deleteProduct(id)
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFormError('')
    setUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      setForm(f => ({ ...f, image: url }))
    } catch (err) {
      setFormError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const categoryOptions = categories.filter(c => c && c.id)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-field mt-4 max-w-md"
      />

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              )}
              <input className="input-field" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <textarea className="input-field" placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="input-field" type="number" step="0.01" min="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input className="input-field" type="number" min="0" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              {categoryOptions.length > 0 ? (
                <select
                  className="input-field"
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input className="input-field" placeholder="Category" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required />
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                {form.image ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Product preview" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Image uploaded</p>
                      <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="text-xs font-medium text-red-600 hover:underline">
                        Remove image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-center text-sm text-gray-500 transition hover:border-gray-400 hover:text-gray-700">
                    {uploading ? 'Uploading...' : 'Click to upload an image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFile}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      ) : products.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No products found.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={product.image || '/placeholder.png'} alt="" fill className="object-cover" />
                    </div>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.stock === 0 ? 'bg-red-100 text-red-700' :
                      product.stock <= 5 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'ShopNext — Modern E-Commerce',
  description: 'Discover premium products curated for your lifestyle. Fast shipping, easy returns.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-100 bg-gray-50">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
                    <ul className="mt-4 space-y-3">
                      <li><a href="/products" className="text-sm text-gray-600 hover:text-gray-900 transition">All Products</a></li>
                      <li><a href="/products?category=Electronics" className="text-sm text-gray-600 hover:text-gray-900 transition">Electronics</a></li>
                      <li><a href="/products?category=Clothing" className="text-sm text-gray-600 hover:text-gray-900 transition">Clothing</a></li>
                      <li><a href="/products?category=Home" className="text-sm text-gray-600 hover:text-gray-900 transition">Home</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Support</h3>
                    <ul className="mt-4 space-y-3">
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Contact</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Shipping</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Returns</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                    <ul className="mt-4 space-y-3">
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">About</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Blog</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Careers</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Press</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
                    <ul className="mt-4 space-y-3">
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Privacy</a></li>
                      <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">Terms</a></li>
                    </ul>
                  </div>
                </div> */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                  <p className="text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} ShopNext. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}

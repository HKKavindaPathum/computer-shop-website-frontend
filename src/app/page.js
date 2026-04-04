'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prods, cats] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prods.slice(0, 8)); // Latest 8 products
      setCategories(cats);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Computer Shop</h1>
        <p className="text-xl mb-8 text-blue-100">
          හොඳම Computers, Parts & Accessories
        </p>
        <Link
          href="/products"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>
        {loading ? (
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-36 bg-gray-200 rounded-lg animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                href={`/products?category=${cat.category_id}`}
                className="bg-white border border-gray-200 px-6 py-3 rounded-full text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition font-medium shadow-sm"
              >
                {cat.category_name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.product_id}
                href={`/products/${product.product_id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group"
              >
                {/* Product Image */}
                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <span className="text-4xl">🖥️</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    {product.brand}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.product_name}
                  </h3>
                  <p className="text-blue-600 font-bold">
                    Rs. {product.price?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
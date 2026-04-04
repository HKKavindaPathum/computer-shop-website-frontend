'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prods, cats] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter products
  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category_id == selectedCategory;
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (e, product) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.productId == product.product_id);
    if (index === -1) {
      cart.push({ productId: product.product_id, name: product.product_name, price: product.price, image: product.image_url, qty: 1 });
    } else {
      cart[index].qty += 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('✅ Cart එකට දැම්මා!');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Products</h1>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-600'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory == cat.category_id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-600'}`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">Products නෑ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.product_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group">
                <Link href={`/products/${product.product_id}`}>
                  {/* Image */}
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

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.product_name}
                    </h3>
                    <p className="text-blue-600 font-bold mb-3">
                      Rs. {product.price?.toLocaleString()}
                    </p>
                  </div>
                </Link>

                {/* Add to Cart */}
                <div className="px-4 pb-4">
                  {product.stock_quantity > 0 ? (
                    <button
                      onClick={(e) => addToCart(e, product)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button disabled className="w-full bg-gray-200 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
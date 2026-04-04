'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query);

  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      const filtered = data.filter(p =>
        p.product_name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand?.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase())
      );
      setProducts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const addToCart = (e, product) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.productId == product.product_id);
    if (index === -1) {
      cart.push({
        productId: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.image_url,
        qty: 1
      });
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* Results Header */}
        {query && (
          <p className="text-gray-500 mb-6">
            {loading ? 'Searching...' : `"${query}" සඳහා ${products.length} results`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse"/>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && query && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg text-gray-500 mb-2">Results නෑ</p>
            <p className="text-gray-400 text-sm mb-6">"{query}" සඳහා products හොයාගන්න බැරි උනා</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              All Products බලන්න
            </Link>
          </div>
        )}

        {/* No Query */}
        {!query && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg text-gray-500">Search කරන්න</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group"
              >
                <Link href={`/products/${product.product_id}`}>
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
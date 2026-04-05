'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await api.get(`/products/${id}`);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.productId == product.product_id);
    if (index === -1) {
      cart.push({ productId: product.product_id, name: product.product_name, price: product.price, image: product.image_url, qty: quantity });
    } else {
      cart[index].qty += quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 dark:bg-gray-950">
      Product not found
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 mb-6 flex items-center gap-1">
          ← Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Image */}
            <div className="h-80 md:h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover"/>
              ) : (
                <span className="text-8xl">🖥️</span>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              <p className="text-sm text-blue-600 font-medium mb-2">{product.brand}</p>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{product.product_name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{product.category_name}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{product.description}</p>

              <p className="text-3xl font-bold text-blue-600 mb-6">
                Rs. {product.price?.toLocaleString()}
              </p>

              <p className={`text-sm font-medium mb-6 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_quantity > 0 ? `✅ In Stock (${product.stock_quantity})` : '❌ Out of Stock'}
              </p>

              {product.stock_quantity > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                      −
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                      +
                    </button>
                  </div>
                </div>
              )}

              {product.stock_quantity > 0 ? (
                <button onClick={addToCart} className={`w-full py-3 rounded-xl font-semibold transition ${added ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {added ? '✅ Added to Cart!' : 'Add to Cart'}
                </button>
              ) : (
                <button disabled className="w-full bg-gray-200 dark:bg-gray-700 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
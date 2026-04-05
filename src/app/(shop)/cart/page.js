'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getToken } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeItem(productId); return; }
    const updated = cart.map(item => item.productId == productId ? { ...item, qty } : item);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updated = cart.filter(item => item.productId != productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    setLoading(true);
    try {
      const token = getToken();
      await api.post('/cart/sync', { items: cart }, token);
      router.push('/checkout');
    } catch (err) {
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Cart එක හිස්!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Products add කරන්න</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear All</button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  ) : (
                    <span className="text-2xl">🖥️</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-blue-600 font-bold mb-3">Rs. {item.price?.toLocaleString()}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 text-lg">−</button>
                      <span className="px-3 py-1 font-medium text-gray-800 dark:text-gray-100">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 text-lg">+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-800 dark:text-gray-100">Rs. {(item.price * item.qty).toLocaleString()}</p>
                      <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 transition">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.qty}</span>
                    <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handleCheckout} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Checkout →'}
              </button>

              <Link href="/products" className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 mt-4">
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
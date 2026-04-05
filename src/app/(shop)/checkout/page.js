'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({ shipping_address: '', payment_method: 'cash' });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const user = getUser();
    if (user?.address) setFormData(prev => ({ ...prev, shipping_address: user.address }));
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = getToken();
      const data = await api.get('/cart', token);
      if (!data.items || data.items.length === 0) { router.push('/cart'); return; }
      setCart(data);
    } catch (err) {
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.shipping_address) { alert('Shipping address දාන්න!'); return; }
    setPlacing(true);
    try {
      const token = getToken();
      const data = await api.post('/orders/checkout', formData, token);
      if (data.orderId) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        router.push(`/orders/${data.orderId}?success=true`);
      } else {
        alert(data.message || 'Order place කරන්න බැරි උනා!');
      }
    } catch (err) {
      alert('Something went wrong!');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const paymentOptions = [
    { value: 'cash', label: '💵 Cash on Delivery', desc: 'Delivery කරද්දී ගෙවන්න' },
    { value: 'card', label: '💳 Card Payment', desc: 'Credit / Debit Card' },
    { value: 'bank', label: '🏦 Bank Transfer', desc: 'Direct bank transfer' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">📦 Shipping Address</h2>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                rows={3}
                placeholder="ඔබගේ address දාන්න..."
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">💳 Payment Method</h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      formData.payment_method === option.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={formData.payment_method === option.value}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{option.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-1 flex-1 mr-2">{item.product_name} x{item.quantity}</span>
                    <span>Rs. {item.subtotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">Rs. {cart.total?.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {placing ? 'Placing Order...' : '✅ Place Order'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
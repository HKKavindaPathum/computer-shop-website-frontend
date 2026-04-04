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
  const [formData, setFormData] = useState({
    shipping_address: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    // Login නැත්නම් login page එකට
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    // User address pre-fill කරනවා
    const user = getUser();
    if (user?.address) {
      setFormData(prev => ({ ...prev, shipping_address: user.address }));
    }

    // DB cart එක ගන්නවා
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = getToken();
      const data = await api.get('/cart', token);
      if (!data.items || data.items.length === 0) {
        router.push('/cart');
        return;
      }
      setCart(data);
    } catch (err) {
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.shipping_address) {
      alert('Shipping address දාන්න!');
      return;
    }

    setPlacing(true);

    try {
      const token = getToken();
      const data = await api.post('/orders/checkout', formData, token);

      if (data.orderId) {
        // localStorage cart clear කරනවා
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        // Success page එකට යනවා
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Shipping Address</h2>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                rows={3}
                placeholder="ඔබගේ address දාන්න..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Method</h2>
              <div className="space-y-3">

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.payment_method === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={formData.payment_method === 'cash'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-800">💵 Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Delivery කරද්දී ගෙවන්න</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.payment_method === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-800">💳 Card Payment</p>
                    <p className="text-sm text-gray-500">Credit / Debit Card</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.payment_method === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={formData.payment_method === 'bank'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-800">🏦 Bank Transfer</p>
                    <p className="text-sm text-gray-500">Direct bank transfer</p>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="flex justify-between text-sm text-gray-600">
                    <span className="line-clamp-1 flex-1 mr-2">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span>Rs. {item.subtotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">
                    Rs. {cart.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {placing ? 'Placing Order...' : '✅ Place Order'}
              </button>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
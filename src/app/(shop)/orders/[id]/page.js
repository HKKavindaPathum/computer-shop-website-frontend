'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { isLoggedIn, getToken } from '@/lib/auth';
import { api } from '@/lib/api';

function OrderDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = getToken();
      const data = await api.get(`/orders/my-orders/${id}`, token);
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Order not found
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <h2 className="text-xl font-bold text-green-700 mb-1">Order Place වුනා!</h2>
            <p className="text-green-600 text-sm">ඔබගේ order successfully place වුනා!</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.order_id}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(order.order_date).toLocaleDateString('si-LK', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <span className={`text-sm px-4 py-2 rounded-full font-medium ${statusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Shipping Address</p>
              <p className="text-gray-800 font-medium">{order.shipping_address}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Method</p>
              <p className="text-gray-800 font-medium capitalize">{order.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Status</p>
              <p className={`font-medium ${order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Total Amount</p>
              <p className="text-blue-600 font-bold text-lg">Rs. {order.total_amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.order_item_id} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/>
                  ) : (
                    <span className="text-2xl">🖥️</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                  <p className="font-bold text-gray-800">
                    Rs. {(item.unit_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/orders" className="flex-1 text-center border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
            My Orders
          </Link>
          <Link href="/products" className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <OrderDetail />
    </Suspense>
  );
}
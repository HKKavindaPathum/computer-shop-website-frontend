'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isAdmin, isLoggedIn } from '@/lib/auth';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [productForm, setProductForm] = useState({
    product_name: '', brand: '', description: '',
    price: '', stock_quantity: '', image_url: '', category_id: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [ords, prods, cats] = await Promise.all([
        api.get('/orders', token),
        api.get('/products'),
        api.get('/categories')
      ]);
      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =================== ORDERS ===================
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = getToken();
      await api.put(`/orders/${orderId}/status`, { status }, token);
      setOrders(orders.map(o =>
        o.order_id === orderId ? { ...o, status } : o
      ));
    } catch (err) {
      alert('Error updating order status');
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

  // =================== PRODUCTS ===================
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      const token = getToken();
      if (editingProduct) {
        await api.put(`/products/${editingProduct}`, productForm, token);
        setFormMessage('✅ Product updated!');
      } else {
        await api.post('/products', productForm, token);
        setFormMessage('✅ Product added!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setFormMessage('❌ Error occurred');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.product_id);
    setProductForm({
      product_name: product.product_name,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || '',
      category_id: product.category_id
    });
    setActiveTab('add-product');
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete කරන්නද?')) return;
    try {
      const token = getToken();
      await api.delete(`/products/${productId}`, token);
      setProducts(products.filter(p => p.product_id !== productId));
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      product_name: '', brand: '', description: '',
      price: '', stock_quantity: '', image_url: '', category_id: ''
    });
  };

  // =================== STATS ===================
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-8">⚙️ Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'orders', label: '📦 Orders' },
            { id: 'products', label: '🖥️ Products' },
            { id: 'add-product', label: editingProduct ? '✏️ Edit Product' : '➕ Add Product' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id !== 'add-product') resetForm(); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =================== OVERVIEW =================== */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
                { label: 'Pending Orders', value: pendingOrders, color: 'text-yellow-600' },
                { label: 'Total Products', value: products.length, color: 'text-purple-600' },
                { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.order_id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-500">{order.name} • {order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================== ORDERS =================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Order</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">#{order.order_id}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{order.name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      Rs. {parseFloat(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =================== PRODUCTS =================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover"/>
                          ) : (
                            <span>🖥️</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{product.product_name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category_name}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      Rs. {parseFloat(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.product_id)}
                          className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-100 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =================== ADD/EDIT PRODUCT =================== */}
        {activeTab === 'add-product' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>

              {formMessage && (
                <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${formMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {formMessage}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text" required
                      value={productForm.product_name}
                      onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3} required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                    <input
                      type="number" required min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number" required min="0"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => { resetForm(); setActiveTab('products'); }}
                      className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
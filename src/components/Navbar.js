'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, isLoggedIn, isAdmin, logout } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getUser());
      setIsAdminUser(isAdmin());
    }
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, [pathname]);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAdminUser(false);
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      e.target.search.value = '';
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch('');
      setMenuOpen(false);
    }
  };

  if (!mounted) return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm h-16"/>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

        <Link href="/" className="text-xl font-bold text-blue-600 flex-shrink-0">
          💻 Computer Shop
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            Home
          </Link>
          <Link href="/products" className={`text-sm font-medium transition ${pathname === '/products' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            Products
          </Link>
          {isAdminUser && (
            <Link href="/admin/dashboard" className={`text-sm font-medium transition ${pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              Dashboard
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <input
            name="search"
            type="text"
            placeholder="Search products..."
            className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-blue-700 transition">
            🔍
          </button>
        </form>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <div className="text-gray-600 hover:text-blue-600 transition">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">{user.email}</p>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    📦 My Orders
                  </Link>
                  {isAdminUser && (
                    <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Login
            </Link>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">☰</button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
          <form onSubmit={handleMobileSearch} className="flex items-center">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-blue-700 transition">🔍</button>
          </form>
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Home</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Products</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">Cart 🛒 {cartCount > 0 && `(${cartCount})`}</Link>
          {user && <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">My Orders</Link>}
          {isAdminUser && <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">⚙️ Dashboard</Link>}
        </div>
      )}
    </nav>
  );
}
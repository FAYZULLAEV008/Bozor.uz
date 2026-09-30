import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { FavoritesProvider } from './context/FavoritesContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ToastContainer } from './components/Toast.tsx';
import { Navbar } from './components/Navbar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { Footer } from './components/Footer.tsx';
import { CategoriesDrawer } from './components/CategoriesDrawer.tsx';
import { QuickLoginModal } from './components/QuickLoginModal.tsx';
import { api } from './services/api.ts';
import { Category } from './types/index.ts';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';
import { SellerDashboardPage } from './pages/SellerDashboardPage.tsx';
import { SellerRegisterPage } from './pages/SellerRegisterPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Load categories for drawer and navigation
    api.categories.getAll().then(res => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  const navigate = (path: string) => {
    const [pathName, queryStr] = path.split('?');
    setCurrentPath(pathName);
    setSearchParams(new URLSearchParams(queryStr || ''));
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render appropriate page view
  const renderPage = () => {
    if (currentPath === '/') {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenCategories={() => setIsCategoriesDrawerOpen(true)}
        />
      );
    }

    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.replace('/product/', '');
      return <ProductDetailPage productId={productId} onNavigate={navigate} />;
    }

    if (currentPath === '/search') {
      const q = searchParams.get('q') || '';
      const category = searchParams.get('category') || '';
      const sort = searchParams.get('sort') || 'newest';
      const sellerId = searchParams.get('sellerId') || '';
      return (
        <SearchPage
          key={q + category + sort + sellerId}
          initialQuery={q}
          initialCategory={category}
          initialSort={sort}
          initialSellerId={sellerId}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} initialTab="personal" />;
    }

    if (currentPath === '/orders') {
      return <ProfilePage onNavigate={navigate} initialTab="orders" />;
    }

    if (currentPath === '/favorites') {
      return <ProfilePage onNavigate={navigate} initialTab="favorites" />;
    }

    if (currentPath.startsWith('/order/')) {
      const orderId = currentPath.replace('/order/', '');
      return <OrderTrackingPage orderId={orderId} onNavigate={navigate} />;
    }

    if (currentPath === '/seller/dashboard' || currentPath === '/seller/products' || currentPath === '/seller/orders') {
      return <SellerDashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/seller/register') {
      return <SellerRegisterPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/admin')) {
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }

    // Fallback 404
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900">404</h2>
        <p className="text-sm text-gray-500">Kechirasiz, siz qidirayotgan sahifa topilmadi.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Alerts */}
      <ToastContainer />

      {/* Global Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenCategories={() => setIsCategoriesDrawerOpen(true)}
        onOpenQuickLogin={() => setIsQuickLoginOpen(true)}
      />

      {/* Categories Drawer */}
      <CategoriesDrawer
        isOpen={isCategoriesDrawerOpen}
        onClose={() => setIsCategoriesDrawerOpen(false)}
        categories={categories}
        onSelectCategory={slug => navigate(`/search?category=${slug}`)}
      />

      {/* Quick Demo Switcher Modal */}
      <QuickLoginModal
        isOpen={isQuickLoginOpen}
        onClose={() => setIsQuickLoginOpen(false)}
        onOpenRegularLogin={() => navigate('/login')}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenCategories={() => setIsCategoriesDrawerOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

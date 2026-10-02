import React, { useState, useEffect, useCallback } from 'react';
import {
  NavPage,
  Perfume,
  CartItem,
  ScentCategory,
  SiteImages,
  AdminSection,
  OrderRecord,
} from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PopularScents } from './components/PopularScents';
import { BrandStatement } from './components/BrandStatement';
import { WhyShopWithUs } from './components/WhyShopWithUs';
import { WhatsAppCTA } from './components/WhatsAppCTA';
import { Footer } from './components/Footer';
import { ShopPage } from './components/ShopPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Sparkles, MessageCircle, Lock } from 'lucide-react';
import { BRAND_CONFIG, BrandConfig } from './config/brand';
import {
  subscribeToAdminAuth,
  subscribeProducts,
  subscribeStoreSettings,
  subscribeOrders,
  seedProductsIfEmpty,
  saveOrderToFirestore,
  AdminUser,
} from './lib/firebase';
import { PERFUMES } from './data/perfumes';
import { getStoredSiteImages } from './utils/adminStorage';

const CART_STORAGE_KEY = 'superwomans_hub_cart_v1';

// Helper to determine route from pathname, hash, and search parameters
function getRouteFromLocation(pathname: string, hash: string, search: string): {
  page: NavPage;
  adminSection?: AdminSection;
} {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const cleanHash = (hash || '').toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');
  const urlParams = new URLSearchParams(search || '');
  const isQueryAdmin = urlParams.get('admin') === 'true' || urlParams.get('page') === 'admin';

  // Check Hash Routes First (fallback for static hosting without URL rewriting)
  if (cleanHash === 'admin' || isQueryAdmin) {
    return { page: 'admin' };
  }
  if (cleanHash === 'admin/dashboard' || cleanHash === 'dashboard') {
    return { page: 'admin', adminSection: 'dashboard' };
  }
  if (cleanHash === 'admin/products' || cleanHash === 'products') {
    return { page: 'admin', adminSection: 'products' };
  }
  if (cleanHash === 'admin/orders' || cleanHash === 'orders') {
    return { page: 'admin', adminSection: 'orders' };
  }
  if (cleanHash === 'admin/settings' || cleanHash === 'settings') {
    return { page: 'admin', adminSection: 'settings' };
  }
  if (cleanHash === 'admin/homepage' || cleanHash === 'homepage') {
    return { page: 'admin', adminSection: 'homepage' };
  }
  if (cleanHash === 'shop') return { page: 'shop' };
  if (cleanHash === 'about') return { page: 'about' };
  if (cleanHash === 'contact') return { page: 'contact' };

  // Standard Pathname Routes
  if (cleanPath === '/' || cleanPath === '/home') {
    return { page: 'home' };
  }
  if (cleanPath === '/shop') {
    return { page: 'shop' };
  }
  if (cleanPath === '/about') {
    return { page: 'about' };
  }
  if (cleanPath === '/contact') {
    return { page: 'contact' };
  }

  // Admin Routes
  if (cleanPath === '/admin') {
    return { page: 'admin' };
  }
  if (cleanPath === '/admin/dashboard') {
    return { page: 'admin', adminSection: 'dashboard' };
  }
  if (cleanPath === '/admin/products') {
    return { page: 'admin', adminSection: 'products' };
  }
  if (cleanPath === '/admin/orders') {
    return { page: 'admin', adminSection: 'orders' };
  }
  if (cleanPath === '/admin/settings') {
    return { page: 'admin', adminSection: 'settings' };
  }
  if (cleanPath === '/admin/homepage') {
    return { page: 'admin', adminSection: 'homepage' };
  }

  return { page: '404' };
}

export function App() {
  // Current Route State
  const [currentPage, setCurrentPage] = useState<NavPage>(() => {
    if (typeof window !== 'undefined') {
      return getRouteFromLocation(
        window.location.pathname,
        window.location.hash,
        window.location.search
      ).page;
    }
    return 'home';
  });

  const [currentAdminSection, setCurrentAdminSection] = useState<AdminSection>(() => {
    if (typeof window !== 'undefined') {
      return (
        getRouteFromLocation(
          window.location.pathname,
          window.location.hash,
          window.location.search
        ).adminSection || 'dashboard'
      );
    }
    return 'dashboard';
  });

  // Admin Auth State (Direct MVP Credentials)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Firestore Data State
  const [perfumes, setPerfumes] = useState<Perfume[]>(PERFUMES);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(BRAND_CONFIG);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [siteImages] = useState<SiteImages>(() => getStoredSiteImages());

  // Shop & Modals State
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart state persisted via localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync route on popstate (browser back/forward) and hashchange
  useEffect(() => {
    const handleRouteChange = () => {
      const route = getRouteFromLocation(
        window.location.pathname,
        window.location.hash,
        window.location.search
      );
      setCurrentPage(route.page);
      if (route.adminSection) {
        setCurrentAdminSection(route.adminSection);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAdminAuth((user, loading) => {
      setAdminUser(user);
      setAuthLoading(loading);
    });
    return () => unsubscribe();
  }, []);

  // Initial Firestore catalog seed & real-time subscriptions
  useEffect(() => {
    // Seed initial products if collection is empty
    seedProductsIfEmpty();

    // Subscribe to products in Firestore
    const unsubProducts = subscribeProducts((items) => {
      setPerfumes(items);
    });

    // Subscribe to store settings in Firestore
    const unsubSettings = subscribeStoreSettings((config) => {
      setBrandConfig(config);
    });

    // Subscribe to orders in Firestore
    const unsubOrders = subscribeOrders((records) => {
      setOrders(records);
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubOrders();
    };
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignored
    }
  }, [cartItems]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Navigate public pages
  const handleNavigate = (page: NavPage, category?: string) => {
    if (category) {
      setShopCategoryFilter(category);
    }
    setCurrentPage(page);

    const path = page === 'home' ? '/' : `/${page}`;
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate admin sections
  const handleAdminNavigateSection = (section: AdminSection) => {
    setCurrentAdminSection(section);
    const newPath = `/admin/${section}`;
    window.history.pushState(null, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart quantity controls
  const handleAddToCart = (
    perfume: Perfume,
    sizeName: string,
    price: number | null,
    quantity = 1
  ) => {
    const itemUniqueId = `${perfume.id}-${sizeName}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemUniqueId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemUniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: itemUniqueId,
          perfumeId: perfume.id,
          name: perfume.name,
          category: perfume.category,
          selectedSize: sizeName,
          price: price,
          quantity: quantity,
          image: perfume.image,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${quantity}x ${perfume.name} (${sizeName}) to your bag`);
  };

  const handleQuickAddToCart = (perfume: Perfume, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = perfume.sizes.length > 0 ? perfume.sizes[0] : null;
    const sizeName = defaultSize ? defaultSize.name : 'Standard';
    const price = defaultSize?.price ?? perfume.price;

    handleAddToCart(perfume, sizeName, price, 1);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Order recording when user clicks WhatsApp order button
  const handleRecordCartOrder = async (items: CartItem[], total: number) => {
    try {
      const orderId = 'SW-' + Math.floor(100000 + Math.random() * 900000);
      await saveOrderToFirestore({
        orderId,
        customerName: 'WhatsApp Customer',
        phoneNumber: '',
        products: items.map((i) => ({
          name: i.name,
          size: i.selectedSize,
          quantity: i.quantity,
          price: i.price,
        })),
        quantity: items.reduce((acc, i) => acc + i.quantity, 0),
        total,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'New',
        notes: 'Placed via Cart WhatsApp Checkout',
      });
    } catch (err) {
      console.warn('Order logging to Firestore (non-blocking):', err);
    }
  };

  const handleRecordDirectOrder = async (
    perfume: Perfume,
    size: string,
    price: number | null,
    quantity: number
  ) => {
    try {
      const orderId = 'SW-' + Math.floor(100000 + Math.random() * 900000);
      const total = price ? price * quantity : 0;
      await saveOrderToFirestore({
        orderId,
        customerName: 'WhatsApp Customer',
        phoneNumber: '',
        products: [
          {
            name: perfume.name,
            size,
            quantity,
            price,
          },
        ],
        quantity,
        total,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: 'New',
        notes: `Direct inquiry for ${perfume.name}`,
      });
    } catch (err) {
      console.warn('Direct order logging to Firestore (non-blocking):', err);
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // =========================================================
  // ADMIN VIEW RENDERING (ISOLATED FROM PUBLIC NAVBAR/FOOTER)
  // =========================================================
  if (currentPage === 'admin') {
    // 1. Auth Loading Guard: Prevent brief flash of protected content
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5A1224] text-[#C59E3F] flex items-center justify-center mb-4 shadow-md animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <span
            className="text-sm uppercase tracking-[0.2em] font-bold text-[#5A1224]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SUPERWOMAN'S HUB
          </span>
          <p className="text-xs text-[#8C7A6B] mt-2">
            Verifying administrative access...
          </p>
        </div>
      );
    }

    // 2. Unauthenticated: Show Dedicated Admin Login Page
    if (!adminUser) {
      // If unauthenticated person manually requested /admin/dashboard or /admin/*,
      // silently normalize URL to /admin without exposing protected screens
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.replaceState(null, '', '/admin');
      }

      return (
        <div>
          <AdminLoginPage
            onLoginSuccess={() => {
              window.history.pushState(null, '', '/admin/dashboard');
              setCurrentAdminSection('dashboard');
              showToast("Welcome back to Superwoman's Hub Admin");
            }}
            onBackToHome={() => handleNavigate('home')}
          />
          {toastMessage && (
            <div className="fixed bottom-6 left-6 z-50 bg-[#5A1224] text-[#FAF7F2] border border-[#7A1D34] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E5C365] flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      );
    }

    // 3. Authenticated: Show Protected Admin Dashboard
    // If authenticated owner visited /admin directly, redirect to /admin/dashboard
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      window.history.replaceState(null, '', '/admin/dashboard');
    }

    return (
      <div>
        <AdminDashboard
          currentSection={currentAdminSection}
          onNavigateSection={handleAdminNavigateSection}
          perfumes={perfumes}
          orders={orders}
          brandConfig={brandConfig}
          siteImages={siteImages}
          adminEmail={adminUser.email}
          onLogout={() => {
            window.history.pushState(null, '', '/admin');
            setCurrentAdminSection('dashboard');
          }}
          onViewStore={() => handleNavigate('home')}
          showToast={showToast}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-[#5A1224] text-[#FAF7F2] border border-[#7A1D34] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5C365] flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // PUBLIC STOREFRONT VIEW RENDERING
  // =========================================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#232120] flex flex-col justify-between selection:bg-[#5A1224] selection:text-[#FAF7F2]">
      
      {/* 1. Sticky Public Navigation Bar (No admin buttons or links) */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => {
          setCurrentPage('shop');
          window.history.pushState(null, '', '/shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        brandConfig={brandConfig}
      />

      {/* 2. Main Public Pages */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <div>
            {/* Section 1: Hero */}
            <Hero
              onShopClick={() => handleNavigate('shop')}
              heroImage={brandConfig.heroImage || siteImages.hero}
              brandConfig={brandConfig}
            />

            {/* Section 2: Popular Scents (Live from Firestore catalog) */}
            <PopularScents
              perfumes={perfumes}
              onSelectPerfume={(perfume) => setSelectedPerfume(perfume)}
              onAddToCart={handleQuickAddToCart}
              onViewAll={() => handleNavigate('shop')}
            />

            {/* Section 4: Brand Statement */}
            <BrandStatement onDiscoverClick={() => handleNavigate('shop')} />

            {/* Section 5: Why Shop With Us */}
            <WhyShopWithUs />

            {/* Section 6: WhatsApp CTA */}
            <WhatsAppCTA brandConfig={brandConfig} />
          </div>
        )}

        {currentPage === 'shop' && (
          <ShopPage
            perfumes={perfumes}
            initialCategory={shopCategoryFilter}
            onSelectPerfume={(perfume) => setSelectedPerfume(perfume)}
            onAddToCart={handleQuickAddToCart}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onShopClick={() => handleNavigate('shop')}
            aboutImages={siteImages.about}
          />
        )}

        {currentPage === 'contact' && <ContactPage brandConfig={brandConfig} />}

        {currentPage === '404' && (
          <NotFoundPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigateShop={() => handleNavigate('shop')}
          />
        )}
      </main>

      {/* 3. Public Footer (No admin links) */}
      <Footer onNavigate={handleNavigate} brandConfig={brandConfig} />

      {/* 4. Product Details Modal */}
      <ProductDetailsModal
        perfume={selectedPerfume}
        onClose={() => setSelectedPerfume(null)}
        onAddToCart={handleAddToCart}
        brandConfig={brandConfig}
        onDirectOrder={handleRecordDirectOrder}
      />

      {/* 5. Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onContinueShopping={() => setIsCartOpen(false)}
        brandConfig={brandConfig}
        onOrderSubmitted={handleRecordCartOrder}
      />

      {/* 6. Floating WhatsApp Button for Quick Inquiries (Moved to left hand side) */}
      <a
        href={`https://wa.me/${brandConfig.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Superwoman's Hub on WhatsApp"
        className="fixed bottom-5 left-5 z-40 p-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* 7. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5A1224] text-[#FAF7F2] border border-[#7A1D34] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#E5C365] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default App;

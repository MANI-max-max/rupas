import React, { useState, useEffect, useMemo } from 'react';
import { 
  AffiliatePlatform, 
  ProductCategory, 
  Product, 
  AdBanner, 
  VideoAd, 
  AdSpendRecord, 
  DirectOrder, 
  CustomerReview, 
  EmailLog, 
  CartItem, 
  PixelEvent 
} from './types';
import { StorageService } from './services/storage';
import { Language, translations } from './translations';
import { Navbar } from './components/Navbar';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { VideoReelsSection } from './components/VideoReelsSection';
import { DirectCheckoutModal } from './components/DirectCheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SEOMetaHead } from './components/SEOMetaHead';
import { Footer } from './components/Footer';
import { Sparkles, AlertCircle, ShoppingBag, Check } from 'lucide-react';

export default function App() {
  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [adSpends, setAdSpends] = useState<AdSpendRecord[]>([]);
  const [orders, setOrders] = useState<DirectOrder[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pixelEvents, setPixelEvents] = useState<PixelEvent[]>([]);
  const [adminPin, setAdminPin] = useState<string>('admin123');

  // Preferences & Filters
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedPlatform, setSelectedPlatform] = useState<AffiliatePlatform | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'price_low' | 'price_high' | 'rating' | 'popular'>('discount');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [writeReviewProductId, setWriteReviewProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from storage
  useEffect(() => {
    setProducts(StorageService.getProducts());
    setBanners(StorageService.getBanners());
    setVideos(StorageService.getVideos());
    setAdSpends(StorageService.getAdSpends());
    setOrders(StorageService.getOrders());
    setReviews(StorageService.getReviews());
    setEmailLogs(StorageService.getEmailLogs());
    setCart(StorageService.getCart());
    setPixelEvents(StorageService.getPixelEvents());
    setAdminPin(StorageService.getAdminPin());
    
    const initialLang = StorageService.getLang();
    setLang(initialLang);

    const initialTheme = StorageService.getTheme();
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Record initial PageView pixel event
    StorageService.recordPixelEvent('PageView');

    // Personal Admin Access Triggers (Private/Secret to Owner):
    // 1. URL parameter or Hash: ?admin=true or #admin
    const checkAdminUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('admin') || window.location.hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    };
    checkAdminUrl();

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // 2. Secret Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Lang toggle
  const handleToggleLang = () => {
    const nextLang: Language = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    StorageService.setLang(nextLang);
  };

  // Affiliate outbound click
  const handleAffiliateClick = (product: Product) => {
    StorageService.recordProductClick(product.id, product.platform);
    setProducts(StorageService.getProducts());
    setPixelEvents(StorageService.getPixelEvents());
    
    // Open affiliate link in new tab safely
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  // Add to Cart
  const handleAddToCart = (product: Product) => {
    const existingIndex = cart.findIndex(i => i.product.id === product.id);
    let updatedCart: CartItem[] = [];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cart, { product, quantity: 1 }];
    }
    setCart(updatedCart);
    StorageService.saveCart(updatedCart);
    StorageService.recordProductCart(product.id);
    setProducts(StorageService.getProducts());
    setPixelEvents(StorageService.getPixelEvents());
    showToast(`${product.title.slice(0, 24)}... added to cart!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updated = cart.map(i => i.product.id === productId ? { ...i, quantity } : i);
    setCart(updated);
    StorageService.saveCart(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cart.filter(i => i.product.id !== productId);
    setCart(updated);
    StorageService.saveCart(updated);
  };

  // Direct buy single product
  const handleDirectBuy = (product: Product) => {
    setActiveDetailProduct(null);
    setCart([{ product, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  // Order success
  const handleOrderSuccess = (order: DirectOrder) => {
    const updatedOrders = StorageService.addOrder(order);
    setOrders(updatedOrders);
    setProducts(StorageService.getProducts());
    setEmailLogs(StorageService.getEmailLogs());
    setPixelEvents(StorageService.getPixelEvents());
    setCart([]);
    StorageService.saveCart([]);
  };

  // Banner click
  const handleBannerClick = (banner: AdBanner) => {
    StorageService.recordBannerClick(banner.id);
    setBanners(StorageService.getBanners());
    if (banner.targetUrl.startsWith('#')) {
      const el = document.querySelector(banner.targetUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Video click
  const handleVideoClick = (video: VideoAd) => {
    StorageService.recordVideoClick(video.id);
    setVideos(StorageService.getVideos());
  };

  // Review submit
  const handleReviewSubmit = (review: CustomerReview) => {
    const updated = StorageService.addReview(review);
    setReviews(updated);
  };

  // Admin CRUD operations
  const handleAddProduct = (prod: Product) => {
    const updated = StorageService.addProduct(prod);
    setProducts(updated);
    showToast('Product added successfully!');
  };

  const handleUpdateProduct = (prod: Product) => {
    const updated = StorageService.updateProduct(prod);
    setProducts(updated);
    showToast('Product updated successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = StorageService.deleteProduct(id);
    setProducts(updated);
    showToast('Product deleted!');
  };

  const handleAddBanner = (banner: AdBanner) => {
    const current = StorageService.getBanners();
    const updated = [banner, ...current];
    StorageService.saveBanners(updated);
    setBanners(updated);
  };

  const handleUpdateBanner = (banner: AdBanner) => {
    const current = StorageService.getBanners();
    const updated = current.map(b => b.id === banner.id ? banner : b);
    StorageService.saveBanners(updated);
    setBanners(updated);
  };

  const handleDeleteBanner = (id: string) => {
    const current = StorageService.getBanners();
    const updated = current.filter(b => b.id !== id);
    StorageService.saveBanners(updated);
    setBanners(updated);
  };

  const handleAddVideo = (video: VideoAd) => {
    const current = StorageService.getVideos();
    const updated = [video, ...current];
    StorageService.saveVideos(updated);
    setVideos(updated);
  };

  const handleUpdateVideo = (video: VideoAd) => {
    const current = StorageService.getVideos();
    const updated = current.map(v => v.id === video.id ? video : v);
    StorageService.saveVideos(updated);
    setVideos(updated);
  };

  const handleDeleteVideo = (id: string) => {
    const current = StorageService.getVideos();
    const updated = current.filter(v => v.id !== id);
    StorageService.saveVideos(updated);
    setVideos(updated);
  };

  const handleAddAdSpend = (spend: AdSpendRecord) => {
    const updated = StorageService.addAdSpend(spend);
    setAdSpends(updated);
  };

  const handleDeleteAdSpend = (id: string) => {
    const updated = StorageService.deleteAdSpend(id);
    setAdSpends(updated);
  };

  const handleUpdateOrderStatus = (id: string, status: DirectOrder['orderStatus']) => {
    const updated = StorageService.updateOrderStatus(id, status);
    setOrders(updated);
    showToast(`Order status updated to: ${status}`);
  };

  const handleDeleteReview = (id: string) => {
    const updated = StorageService.deleteReview(id);
    setReviews(updated);
  };

  const handleSendTestEmail = (email: string, subject: string) => {
    const newLog: EmailLog = {
      id: `email-${Date.now()}`,
      recipientEmail: email,
      recipientName: 'Valued Shopper',
      subject,
      type: 'deal_alert',
      sentAt: new Date().toISOString(),
      status: 'delivered',
      bodyPreview: `Simulated deal alert dispatched to ${email}.`,
    };
    const updated = StorageService.addEmailLog(newLog);
    setEmailLogs(updated);
  };

  const handleUpdatePin = (newPin: string) => {
    StorageService.setAdminPin(newPin);
    setAdminPin(newPin);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Platform filter
      if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query) || (p.titleBn && p.titleBn.toLowerCase().includes(query));
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCoupon = p.couponCode && p.couponCode.toLowerCase().includes(query);
        const matchesPlatform = p.platform.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCoupon && !matchesPlatform) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      if (sortBy === 'popular') return (b.clicksCount || 0) - (a.clicksCount || 0);
      if (sortBy === 'price_low') return a.dealPrice - b.dealPrice;
      if (sortBy === 'price_high') return b.dealPrice - a.dealPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, selectedPlatform, selectedCategory, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic SEO Meta & Schema.org Structured Data */}
      <SEOMetaHead
        products={products}
        selectedPlatform={selectedPlatform}
        lang={lang}
      />

      {/* Top 3-Zone Navigation Bar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Drawer Menu */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        lang={lang}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1 pb-24 lg:pb-0" id="deals">
        
        {/* Hero Promotional Banner Slider */}
        <HeroBanner
          banners={banners}
          lang={lang}
          onExploreClick={() => {
            const el = document.getElementById('products-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onBannerClick={handleBannerClick}
        />

        {/* Category & Marketplace Segmented Controls */}
        <CategoryBar
          lang={lang}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalProductsCount={filteredProducts.length}
        />

        {/* Featured Products Grid */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-4 sm:my-6" id="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                No deals match your criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or switching to "All Platforms" to discover today's top discounts.
              </p>
              <button
                onClick={() => {
                  setSelectedPlatform('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer min-h-[38px]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  onProductClick={(p) => setActiveDetailProduct(p)}
                  onAffiliateClick={handleAffiliateClick}
                  onAddToCart={handleAddToCart}
                  onVideoClick={(p) => setActiveDetailProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Video Reviews & Unboxing Reels */}
        <VideoReelsSection
          videos={videos}
          products={products}
          lang={lang}
          onVideoClick={handleVideoClick}
          onProductClick={(p) => setActiveDetailProduct(p)}
        />

      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        onSelectPlatform={setSelectedPlatform}
        onScrollToTop={handleScrollToTop}
      />

      {/* Mobile Sticky Bottom Nav Bar (under 15% viewport height cap) */}
      <MobileBottomNav
        lang={lang}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        onScrollToTop={handleScrollToTop}
        onToggleCategories={() => setIsMobileMenuOpen(true)}
      />

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        lang={lang}
        onAffiliateClick={handleAffiliateClick}
        reviews={reviews}
        onOpenWriteReview={(prodId) => setWriteReviewProductId(prodId)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        lang={lang}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Direct Checkout & Multi-Payment Modal */}
      <DirectCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        lang={lang}
        onOrderSuccess={handleOrderSuccess}
        onTrackOrder={(orderId) => {
          setSelectedTrackingOrderId(orderId);
          setIsTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setSelectedTrackingOrderId(null);
        }}
        orders={orders}
        lang={lang}
        selectedOrderId={selectedTrackingOrderId}
        onSelectOrderId={setSelectedTrackingOrderId}
        onRefreshOrders={() => setOrders(StorageService.getOrders())}
      />

      {/* Write Customer Review Modal */}
      <WriteReviewModal
        isOpen={Boolean(writeReviewProductId)}
        onClose={() => setWriteReviewProductId(null)}
        productId={writeReviewProductId}
        products={products}
        lang={lang}
        onSubmitReview={handleReviewSubmit}
      />

      {/* Admin Login Modal (PIN security) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        lang={lang}
        storedPin={adminPin}
        onSuccessLogin={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Full Admin Control Center & Analytics Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        lang={lang}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        banners={banners}
        onAddBanner={handleAddBanner}
        onUpdateBanner={handleUpdateBanner}
        onDeleteBanner={handleDeleteBanner}
        videos={videos}
        onAddVideo={handleAddVideo}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        adSpends={adSpends}
        onAddAdSpend={handleAddAdSpend}
        onDeleteAdSpend={handleDeleteAdSpend}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        reviews={reviews}
        onDeleteReview={handleDeleteReview}
        emailLogs={emailLogs}
        onSendTestEmail={handleSendTestEmail}
        adminPin={adminPin}
        onUpdatePin={handleUpdatePin}
      />

      {/* Floating Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-60 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 dark:border-slate-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

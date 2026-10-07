import { 
  Product, 
  AdBanner, 
  VideoAd, 
  AdSpendRecord, 
  DirectOrder, 
  CustomerReview, 
  EmailLog, 
  PixelEvent,
  CartItem,
  AffiliatePlatform,
  PriceDropAlert
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_BANNERS, 
  INITIAL_VIDEOS, 
  INITIAL_AD_SPENDS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_EMAIL_LOGS 
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'dealhub_products',
  BANNERS: 'dealhub_banners',
  VIDEOS: 'dealhub_videos',
  AD_SPENDS: 'dealhub_ad_spends',
  ORDERS: 'dealhub_orders',
  REVIEWS: 'dealhub_reviews',
  EMAIL_LOGS: 'dealhub_email_logs',
  PRICE_ALERTS: 'rupas_price_alerts',
  PIXEL_EVENTS: 'dealhub_pixel_events',
  CART: 'dealhub_cart',
  ADMIN_PIN: 'dealhub_admin_pin',
  THEME: 'dealhub_theme',
  LANG: 'dealhub_lang',
};

// Safe JSON parser
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from storage`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to storage`, err);
  }
}

export const StorageService = {
  // Products
  getProducts(): Product[] {
    const prods = safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (!prods || prods.length === 0) {
      safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return prods;
  },

  saveProducts(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  },

  addProduct(product: Product): Product[] {
    const current = this.getProducts();
    const updated = [product, ...current];
    this.saveProducts(updated);
    return updated;
  },

  updateProduct(product: Product): Product[] {
    const current = this.getProducts();
    const updated = current.map(p => p.id === product.id ? product : p);
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(id: string): Product[] {
    const current = this.getProducts();
    const updated = current.filter(p => p.id !== id);
    this.saveProducts(updated);
    return updated;
  },

  recordProductClick(id: string, platform?: AffiliatePlatform): void {
    const current = this.getProducts();
    const target = current.find(p => p.id === id);
    if (target) {
      target.clicksCount = (target.clicksCount || 0) + 1;
      this.saveProducts([...current]);
      this.recordPixelEvent('AffiliateClick', {
        productId: id,
        productTitle: target.title,
        platform: platform || target.platform,
        value: target.dealPrice,
      });
    }
  },

  recordProductCart(id: string): void {
    const current = this.getProducts();
    const target = current.find(p => p.id === id);
    if (target) {
      target.cartCount = (target.cartCount || 0) + 1;
      this.saveProducts([...current]);
      this.recordPixelEvent('AddToCart', {
        productId: id,
        productTitle: target.title,
        platform: target.platform,
        value: target.dealPrice,
      });
    }
  },

  recordProductPurchase(id: string): void {
    const current = this.getProducts();
    const target = current.find(p => p.id === id);
    if (target) {
      target.purchaseCount = (target.purchaseCount || 0) + 1;
      this.saveProducts([...current]);
      this.recordPixelEvent('Purchase', {
        productId: id,
        productTitle: target.title,
        platform: target.platform,
        value: target.dealPrice,
      });
    }
  },

  // Banners
  getBanners(): AdBanner[] {
    const banners = safeGet<AdBanner[]>(STORAGE_KEYS.BANNERS, []);
    if (!banners || banners.length === 0) {
      safeSet(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
      return INITIAL_BANNERS;
    }
    return banners;
  },

  saveBanners(banners: AdBanner[]): void {
    safeSet(STORAGE_KEYS.BANNERS, banners);
  },

  recordBannerClick(id: string): void {
    const current = this.getBanners();
    const target = current.find(b => b.id === id);
    if (target) {
      target.clicks = (target.clicks || 0) + 1;
      this.saveBanners([...current]);
    }
  },

  // Videos
  getVideos(): VideoAd[] {
    const videos = safeGet<VideoAd[]>(STORAGE_KEYS.VIDEOS, []);
    if (!videos || videos.length === 0) {
      safeSet(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
      return INITIAL_VIDEOS;
    }
    return videos;
  },

  saveVideos(videos: VideoAd[]): void {
    safeSet(STORAGE_KEYS.VIDEOS, videos);
  },

  recordVideoClick(id: string): void {
    const current = this.getVideos();
    const target = current.find(v => v.id === id);
    if (target) {
      target.clicks = (target.clicks || 0) + 1;
      this.saveVideos([...current]);
    }
  },

  // Ad Spends
  getAdSpends(): AdSpendRecord[] {
    const spends = safeGet<AdSpendRecord[]>(STORAGE_KEYS.AD_SPENDS, []);
    if (!spends || spends.length === 0) {
      safeSet(STORAGE_KEYS.AD_SPENDS, INITIAL_AD_SPENDS);
      return INITIAL_AD_SPENDS;
    }
    return spends;
  },

  saveAdSpends(spends: AdSpendRecord[]): void {
    safeSet(STORAGE_KEYS.AD_SPENDS, spends);
  },

  addAdSpend(spend: AdSpendRecord): AdSpendRecord[] {
    const current = this.getAdSpends();
    const updated = [spend, ...current];
    this.saveAdSpends(updated);
    return updated;
  },

  deleteAdSpend(id: string): AdSpendRecord[] {
    const current = this.getAdSpends();
    const updated = current.filter(s => s.id !== id);
    this.saveAdSpends(updated);
    return updated;
  },

  // Orders
  getOrders(): DirectOrder[] {
    const orders = safeGet<DirectOrder[]>(STORAGE_KEYS.ORDERS, []);
    if (!orders || orders.length === 0) {
      safeSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    return orders;
  },

  saveOrders(orders: DirectOrder[]): void {
    safeSet(STORAGE_KEYS.ORDERS, orders);
  },

  addOrder(order: DirectOrder): DirectOrder[] {
    const current = this.getOrders();
    const updated = [order, ...current];
    this.saveOrders(updated);
    
    // Also record purchase for products
    order.items.forEach(item => {
      this.recordProductPurchase(item.productId);
    });

    // Create automatic email notification
    this.addEmailLog({
      id: `email-${Date.now()}`,
      recipientEmail: order.email,
      recipientName: order.customerName,
      subject: `Order Confirmation #${order.id} - Rupas.Shop Store`,
      type: 'order_confirmation',
      sentAt: new Date().toISOString(),
      status: 'delivered',
      bodyPreview: `Dear ${order.customerName}, your order #${order.id} of ₹${order.totalAmount.toLocaleString()} has been confirmed. Tracking Number: ${order.trackingNumber}.`,
    });

    return updated;
  },

  updateOrderStatus(orderId: string, status: DirectOrder['orderStatus']): DirectOrder[] {
    const current = this.getOrders();
    const updated = current.map(o => o.id === orderId ? { ...o, orderStatus: status } : o);
    this.saveOrders(updated);
    return updated;
  },

  // Reviews
  getReviews(): CustomerReview[] {
    const reviews = safeGet<CustomerReview[]>(STORAGE_KEYS.REVIEWS, []);
    if (!reviews || reviews.length === 0) {
      safeSet(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }
    return reviews;
  },

  saveReviews(reviews: CustomerReview[]): void {
    safeSet(STORAGE_KEYS.REVIEWS, reviews);
  },

  addReview(review: CustomerReview): CustomerReview[] {
    const current = this.getReviews();
    const updated = [review, ...current];
    this.saveReviews(updated);
    return updated;
  },

  deleteReview(id: string): CustomerReview[] {
    const current = this.getReviews();
    const updated = current.filter(r => r.id !== id);
    this.saveReviews(updated);
    return updated;
  },

  // Email logs
  getEmailLogs(): EmailLog[] {
    const logs = safeGet<EmailLog[]>(STORAGE_KEYS.EMAIL_LOGS, []);
    if (!logs || logs.length === 0) {
      safeSet(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS);
      return INITIAL_EMAIL_LOGS;
    }
    return logs;
  },

  addEmailLog(log: EmailLog): EmailLog[] {
    const current = this.getEmailLogs();
    const updated = [log, ...current];
    safeSet(STORAGE_KEYS.EMAIL_LOGS, updated);
    return updated;
  },

  // Price Drop Alerts
  getPriceAlerts(): PriceDropAlert[] {
    return safeGet<PriceDropAlert[]>(STORAGE_KEYS.PRICE_ALERTS, []);
  },

  savePriceAlerts(alerts: PriceDropAlert[]): void {
    safeSet(STORAGE_KEYS.PRICE_ALERTS, alerts);
  },

  addPriceAlert(alert: PriceDropAlert): PriceDropAlert[] {
    const current = this.getPriceAlerts();
    const updated = [alert, ...current];
    this.savePriceAlerts(updated);

    // Also record an automated email log for customer peace of mind
    this.addEmailLog({
      id: `email-${Date.now()}`,
      recipientEmail: alert.userEmail,
      recipientName: 'Deal Hunter',
      subject: `Price Drop Alert Set: ${alert.productTitle.slice(0, 35)}...`,
      type: 'price_drop_alert',
      sentAt: new Date().toISOString(),
      status: 'delivered',
      bodyPreview: `You will be notified immediately at ${alert.userEmail} if the price drops below ₹${(alert.targetPrice || alert.currentPrice).toLocaleString()} on ${alert.platform.toUpperCase()}.`,
    });

    return updated;
  },

  // Pixel Events (FB, IG, Google Ads tracking)
  getPixelEvents(): PixelEvent[] {
    return safeGet<PixelEvent[]>(STORAGE_KEYS.PIXEL_EVENTS, []);
  },

  recordPixelEvent(
    eventName: PixelEvent['eventName'], 
    payload?: Partial<PixelEvent>
  ): void {
    const events = this.getPixelEvents();
    // Parse URL search params for UTM
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || urlParams.get('source') || 'direct';

    const newEvent: PixelEvent = {
      id: `px-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventName,
      source,
      ...payload
    };

    const updated = [newEvent, ...events.slice(0, 199)]; // Keep latest 200 events
    safeSet(STORAGE_KEYS.PIXEL_EVENTS, updated);
  },

  // Cart
  getCart(): CartItem[] {
    return safeGet<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart(cart: CartItem[]): void {
    safeSet(STORAGE_KEYS.CART, cart);
  },

  // Admin Security PIN
  getAdminPin(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || 'admin123';
  },

  setAdminPin(pin: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
  },

  // Theme & Lang
  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getLang(): 'bn' | 'en' {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as 'bn' | 'en') || 'en';
  },

  setLang(lang: 'bn' | 'en'): void {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }
};

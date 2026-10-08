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
import { resolveImageUrl, formatYouTubeEmbedUrl } from '../utils/mediaUtils';

declare global {
  interface Window {
    __INITIAL_SERVER_DATA__?: {
      products?: Product[];
      deletedProductIds?: string[];
      banners?: AdBanner[];
      deletedBannerIds?: string[];
      videos?: VideoAd[];
      deletedVideoIds?: string[];
      orders?: DirectOrder[];
      reviews?: CustomerReview[];
      adSpends?: AdSpendRecord[];
      updatedAt?: string;
    };
  }
}

const STORAGE_KEYS = {
  PRODUCTS: 'dealhub_products',
  DELETED_PRODUCT_IDS: 'dealhub_deleted_product_ids',
  PRODUCTS_INITIALIZED: 'dealhub_products_initialized_v2',

  BANNERS: 'dealhub_banners',
  DELETED_BANNER_IDS: 'dealhub_deleted_banner_ids',
  BANNERS_INITIALIZED: 'dealhub_banners_initialized_v2',

  VIDEOS: 'dealhub_videos',
  DELETED_VIDEO_IDS: 'dealhub_deleted_video_ids',
  VIDEOS_INITIALIZED: 'dealhub_videos_initialized_v2',

  AD_SPENDS: 'dealhub_ad_spends',
  DELETED_AD_SPEND_IDS: 'dealhub_deleted_ad_spend_ids',
  AD_SPENDS_INITIALIZED: 'dealhub_ad_spends_initialized_v2',

  ORDERS: 'dealhub_orders',
  REVIEWS: 'dealhub_reviews',
  DELETED_REVIEW_IDS: 'dealhub_deleted_review_ids',
  REVIEWS_INITIALIZED: 'dealhub_reviews_initialized_v2',

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
  // Deleted tracking helpers (ensures deleted items NEVER reappear on refresh)
  getDeletedProductIds(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
  },
  saveDeletedProductIds(ids: string[]): void {
    safeSet(STORAGE_KEYS.DELETED_PRODUCT_IDS, ids);
  },

  getDeletedBannerIds(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.DELETED_BANNER_IDS, []);
  },
  saveDeletedBannerIds(ids: string[]): void {
    safeSet(STORAGE_KEYS.DELETED_BANNER_IDS, ids);
  },

  getDeletedVideoIds(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.DELETED_VIDEO_IDS, []);
  },
  saveDeletedVideoIds(ids: string[]): void {
    safeSet(STORAGE_KEYS.DELETED_VIDEO_IDS, ids);
  },

  getDeletedReviewIds(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.DELETED_REVIEW_IDS, []);
  },
  saveDeletedReviewIds(ids: string[]): void {
    safeSet(STORAGE_KEYS.DELETED_REVIEW_IDS, ids);
  },

  // Products
  getProducts(): Product[] {
    // If server injected authoritative synchronized data, absorb it immediately
    if (typeof window !== 'undefined' && window.__INITIAL_SERVER_DATA__) {
      const serverData = window.__INITIAL_SERVER_DATA__;
      if (Array.isArray(serverData.deletedProductIds) && serverData.deletedProductIds.length > 0) {
        const localDeleted = safeGet<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
        const merged = Array.from(new Set([...localDeleted, ...serverData.deletedProductIds]));
        safeSet(STORAGE_KEYS.DELETED_PRODUCT_IDS, merged);
      }
      if (Array.isArray(serverData.products)) {
        const currentDeleted = this.getDeletedProductIds();
        const serverFiltered = serverData.products.filter(p => !currentDeleted.includes(p.id));
        safeSet(STORAGE_KEYS.PRODUCTS, serverFiltered);
        safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);
        window.__INITIAL_SERVER_DATA__.products = undefined;
      }
    }

    const isInitialized = safeGet<boolean>(STORAGE_KEYS.PRODUCTS_INITIALIZED, false);
    const deletedIds = this.getDeletedProductIds();

    let prods: Product[];
    if (!isInitialized) {
      // First run: Seed default catalog, excluding any previously deleted IDs
      safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);
      prods = INITIAL_PRODUCTS.filter(p => !deletedIds.includes(p.id));
      safeSet(STORAGE_KEYS.PRODUCTS, prods);
    } else {
      prods = safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, []);
      // Guarantee that deleted items never resurrect on page reload or across devices
      if (deletedIds.length > 0) {
        prods = prods.filter(p => !deletedIds.includes(p.id));
      }
    }

    return prods.map(p => ({
      ...p,
      imageUrl: resolveImageUrl(p.imageUrl, 'hero'),
      videoUrl: p.videoUrl ? formatYouTubeEmbedUrl(p.videoUrl) : undefined,
    }));
  },

  saveProducts(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  },

  addProduct(product: Product): Product[] {
    // Un-blacklist this ID if it was ever in deleted list
    const deletedIds = this.getDeletedProductIds().filter(id => id !== product.id);
    this.saveDeletedProductIds(deletedIds);

    const current = this.getProducts();
    const updated = [product, ...current];
    this.saveProducts(updated);
    safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);

    // Cross-Device Sync: Add on server
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }).catch(err => console.warn('[Sync] Server add failed:', err));

    return updated;
  },

  updateProduct(product: Product): Product[] {
    const current = this.getProducts();
    const updated = current.map(p => p.id === product.id ? product : p);
    this.saveProducts(updated);

    // Cross-Device Sync: Update on server
    fetch(`/api/products/${encodeURIComponent(product.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }).catch(err => console.warn('[Sync] Server update failed:', err));

    return updated;
  },

  async deleteProductAsync(id: string): Promise<Product[]> {
    // 1. Immediately record in persistent blacklist locally
    const deletedIds = this.getDeletedProductIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedProductIds([...deletedIds, id]);
    }

    // 2. Remove product from local array
    const current = this.getProducts();
    const updated = current.filter(p => p.id !== id);
    this.saveProducts(updated);
    safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);

    // 3. Immediately send permanent server delete and await broadcast
    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
    } catch (err) {
      console.warn('[Sync] Server permanent delete network warning:', err);
    }

    return updated;
  },

  deleteProduct(id: string): Product[] {
    // 1. Permanently record deletion in persistent blacklist
    const deletedIds = this.getDeletedProductIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedProductIds([...deletedIds, id]);
    }

    // 2. Remove product from stored array
    const current = this.getProducts();
    const updated = current.filter(p => p.id !== id);
    this.saveProducts(updated);

    // 3. Ensure initialized flag remains true so empty list never triggers initial data reload
    safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);

    // 4. PERMANENT SERVER DELETE: Guarantee other devices also permanently remove this product
    fetch(`/api/products/${encodeURIComponent(id)}`, { 
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    }).catch(err => {
      console.warn('[Sync] Server permanent delete failed:', err);
    });

    return updated;
  },

  resetToDefaultCatalog(): Product[] {
    safeSet(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
    safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);

    fetch('/api/products/reset', { method: 'POST' }).catch(err => {
      console.warn('[Sync] Reset failed on server:', err);
    });

    return this.getProducts();
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
    const isInitialized = safeGet<boolean>(STORAGE_KEYS.BANNERS_INITIALIZED, false);
    const deletedIds = this.getDeletedBannerIds();

    let banners: AdBanner[];
    if (!isInitialized) {
      safeSet(STORAGE_KEYS.BANNERS_INITIALIZED, true);
      banners = INITIAL_BANNERS.filter(b => !deletedIds.includes(b.id));
      safeSet(STORAGE_KEYS.BANNERS, banners);
    } else {
      banners = safeGet<AdBanner[]>(STORAGE_KEYS.BANNERS, []);
      if (deletedIds.length > 0) {
        banners = banners.filter(b => !deletedIds.includes(b.id));
      }
    }

    return banners.map(b => ({
      ...b,
      imageUrl: resolveImageUrl(b.imageUrl, 'hero'),
    }));
  },

  saveBanners(banners: AdBanner[]): void {
    safeSet(STORAGE_KEYS.BANNERS, banners);
  },

  deleteBanner(id: string): AdBanner[] {
    const deletedIds = this.getDeletedBannerIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedBannerIds([...deletedIds, id]);
    }
    const current = this.getBanners();
    const updated = current.filter(b => b.id !== id);
    this.saveBanners(updated);
    safeSet(STORAGE_KEYS.BANNERS_INITIALIZED, true);

    fetch(`/api/banners/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(err => {
      console.warn('[Sync] Server delete banner failed:', err);
    });

    return updated;
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
    const isInitialized = safeGet<boolean>(STORAGE_KEYS.VIDEOS_INITIALIZED, false);
    const deletedIds = this.getDeletedVideoIds();

    let videos: VideoAd[];
    if (!isInitialized) {
      safeSet(STORAGE_KEYS.VIDEOS_INITIALIZED, true);
      videos = INITIAL_VIDEOS.filter(v => !deletedIds.includes(v.id));
      safeSet(STORAGE_KEYS.VIDEOS, videos);
    } else {
      videos = safeGet<VideoAd[]>(STORAGE_KEYS.VIDEOS, []);
      if (deletedIds.length > 0) {
        videos = videos.filter(v => !deletedIds.includes(v.id));
      }
    }

    return videos.map(v => ({
      ...v,
      thumbnailUrl: resolveImageUrl(v.thumbnailUrl, 'earbuds'),
      videoUrl: formatYouTubeEmbedUrl(v.videoUrl),
    }));
  },

  saveVideos(videos: VideoAd[]): void {
    safeSet(STORAGE_KEYS.VIDEOS, videos);
  },

  deleteVideo(id: string): VideoAd[] {
    const deletedIds = this.getDeletedVideoIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedVideoIds([...deletedIds, id]);
    }
    const current = this.getVideos();
    const updated = current.filter(v => v.id !== id);
    this.saveVideos(updated);
    safeSet(STORAGE_KEYS.VIDEOS_INITIALIZED, true);

    fetch(`/api/videos/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(err => {
      console.warn('[Sync] Server delete video failed:', err);
    });

    return updated;
  },

  recordVideoClick(id: string): void {
    const current = this.getVideos();
    const target = current.find(v => v.id === id);
    if (target) {
      target.clicks = (target.clicks || 0) + 1;
      this.saveVideos([...current]);
    }
  },

  getDeletedAdSpendIds(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.DELETED_AD_SPEND_IDS, []);
  },
  saveDeletedAdSpendIds(ids: string[]): void {
    safeSet(STORAGE_KEYS.DELETED_AD_SPEND_IDS, ids);
  },

  // Ad Spends
  getAdSpends(): AdSpendRecord[] {
    const isInitialized = safeGet<boolean>(STORAGE_KEYS.AD_SPENDS_INITIALIZED, false);
    const deletedIds = this.getDeletedAdSpendIds();

    let spends: AdSpendRecord[];
    if (!isInitialized) {
      safeSet(STORAGE_KEYS.AD_SPENDS_INITIALIZED, true);
      spends = INITIAL_AD_SPENDS.filter(s => !deletedIds.includes(s.id));
      safeSet(STORAGE_KEYS.AD_SPENDS, spends);
    } else {
      spends = safeGet<AdSpendRecord[]>(STORAGE_KEYS.AD_SPENDS, []);
      if (deletedIds.length > 0) {
        spends = spends.filter(s => !deletedIds.includes(s.id));
      }
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
    safeSet(STORAGE_KEYS.AD_SPENDS_INITIALIZED, true);
    return updated;
  },

  deleteAdSpend(id: string): AdSpendRecord[] {
    const deletedIds = this.getDeletedAdSpendIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedAdSpendIds([...deletedIds, id]);
    }
    const current = this.getAdSpends();
    const updated = current.filter(s => s.id !== id);
    this.saveAdSpends(updated);
    safeSet(STORAGE_KEYS.AD_SPENDS_INITIALIZED, true);
    return updated;
  },

  // Orders
  getOrders(): DirectOrder[] {
    const orders = safeGet<DirectOrder[]>(STORAGE_KEYS.ORDERS, []);
    const sourceOrders = (!orders || orders.length === 0) ? INITIAL_ORDERS : orders;
    
    // Sanitize image paths for robust display
    const sanitized = sourceOrders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl, 'earbuds'),
      }))
    }));

    if (!orders || orders.length === 0) {
      safeSet(STORAGE_KEYS.ORDERS, sanitized);
    }
    return sanitized;
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

    // Cross-Device Sync: Send to server so other devices see this order
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(err => console.warn('[Sync] Server add order failed:', err));

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

    // Cross-Device Sync: Update on server
    fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(err => console.warn('[Sync] Server order status update failed:', err));

    return updated;
  },

  // Reviews
  getReviews(): CustomerReview[] {
    const isInitialized = safeGet<boolean>(STORAGE_KEYS.REVIEWS_INITIALIZED, false);
    const deletedIds = this.getDeletedReviewIds();

    let reviews: CustomerReview[];
    if (!isInitialized) {
      safeSet(STORAGE_KEYS.REVIEWS_INITIALIZED, true);
      reviews = INITIAL_REVIEWS.filter(r => !deletedIds.includes(r.id));
      safeSet(STORAGE_KEYS.REVIEWS, reviews);
    } else {
      reviews = safeGet<CustomerReview[]>(STORAGE_KEYS.REVIEWS, []);
      if (deletedIds.length > 0) {
        reviews = reviews.filter(r => !deletedIds.includes(r.id));
      }
    }
    return reviews;
  },

  saveReviews(reviews: CustomerReview[]): void {
    safeSet(STORAGE_KEYS.REVIEWS, reviews);
  },

  addReview(review: CustomerReview): CustomerReview[] {
    const deletedIds = this.getDeletedReviewIds().filter(id => id !== review.id);
    this.saveDeletedReviewIds(deletedIds);

    const current = this.getReviews();
    const updated = [review, ...current];
    this.saveReviews(updated);
    safeSet(STORAGE_KEYS.REVIEWS_INITIALIZED, true);

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    }).catch(err => console.warn('[Sync] Server add review failed:', err));

    return updated;
  },

  deleteReview(id: string): CustomerReview[] {
    const deletedIds = this.getDeletedReviewIds();
    if (!deletedIds.includes(id)) {
      this.saveDeletedReviewIds([...deletedIds, id]);
    }
    const current = this.getReviews();
    const updated = current.filter(r => r.id !== id);
    this.saveReviews(updated);
    safeSet(STORAGE_KEYS.REVIEWS_INITIALIZED, true);
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
  },

  // Cross-Device Full Synchronization
  async syncWithServer(): Promise<{
    products: Product[];
    banners: AdBanner[];
    videos: VideoAd[];
    orders: DirectOrder[];
    reviews: CustomerReview[];
  } | null> {
    try {
      // 1. Proactively sync any previously deleted product IDs from this browser to server
      const localDeletedIds = this.getDeletedProductIds();
      if (localDeletedIds.length > 0) {
        await fetch('/api/products/batch-delete', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ids: localDeletedIds }),
        }).catch(() => {});
      }

      // 2. Fetch authoritative snapshot with cache busting
      const res = await fetch(`/api/sync?_t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      const data = await res.json();

      // 3. Merge deleted IDs from server
      if (Array.isArray(data.deletedProductIds)) {
        const mergedDeleted = Array.from(new Set([...this.getDeletedProductIds(), ...data.deletedProductIds]));
        this.saveDeletedProductIds(mergedDeleted);
      }

      // 4. Update products
      if (Array.isArray(data.products)) {
        const deletedIds = this.getDeletedProductIds();
        const activeProds = data.products
          .filter((p: Product) => !deletedIds.includes(p.id))
          .map((p: Product) => ({
            ...p,
            imageUrl: resolveImageUrl(p.imageUrl, 'hero'),
            videoUrl: p.videoUrl ? formatYouTubeEmbedUrl(p.videoUrl) : undefined,
          }));
        this.saveProducts(activeProds);
        safeSet(STORAGE_KEYS.PRODUCTS_INITIALIZED, true);
      }

      // 5. Update banners
      if (Array.isArray(data.banners)) {
        const activeBanners = data.banners.map((b: AdBanner) => ({
          ...b,
          imageUrl: resolveImageUrl(b.imageUrl, 'hero'),
        }));
        this.saveBanners(activeBanners);
        safeSet(STORAGE_KEYS.BANNERS_INITIALIZED, true);
      }

      // 6. Update videos
      if (Array.isArray(data.videos)) {
        const activeVideos = data.videos.map((v: VideoAd) => ({
          ...v,
          thumbnailUrl: resolveImageUrl(v.thumbnailUrl, 'earbuds'),
          videoUrl: formatYouTubeEmbedUrl(v.videoUrl),
        }));
        this.saveVideos(activeVideos);
        safeSet(STORAGE_KEYS.VIDEOS_INITIALIZED, true);
      }

      // 7. Update orders
      if (Array.isArray(data.orders)) {
        const sanitizedOrders = data.orders.map((o: DirectOrder) => ({
          ...o,
          items: o.items.map(it => ({
            ...it,
            imageUrl: resolveImageUrl(it.imageUrl, 'earbuds'),
          }))
        }));
        this.saveOrders(sanitizedOrders);
      }

      // 8. Update reviews
      if (Array.isArray(data.reviews)) {
        this.saveReviews(data.reviews);
        safeSet(STORAGE_KEYS.REVIEWS_INITIALIZED, true);
      }

      return {
        products: this.getProducts(),
        banners: this.getBanners(),
        videos: this.getVideos(),
        orders: this.getOrders(),
        reviews: this.getReviews(),
      };
    } catch (err) {
      console.warn('[Sync] Server sync check skipped (offline or network error):', err);
      return null;
    }
  }
};

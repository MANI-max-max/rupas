import { Product, AdBanner, VideoAd, DirectOrder, CustomerReview } from '../types';
import { StorageService } from './storage';

type SyncListener = () => void;
type ProductDeleteListener = (id: string) => void;
type ProductsBatchDeleteListener = (ids: string[]) => void;
type ProductSaveListener = (product: Product) => void;
type BannerDeleteListener = (id: string) => void;
type VideoDeleteListener = (id: string) => void;
type OrdersUpdateListener = (orders: DirectOrder[]) => void;

class RealtimeSyncManager {
  private eventSource: EventSource | null = null;
  private isConnecting = false;
  private reconnectTimeout: any = null;
  private pollInterval: any = null;

  // Listeners
  private productDeleteListeners: Set<ProductDeleteListener> = new Set();
  private productsBatchDeleteListeners: Set<ProductsBatchDeleteListener> = new Set();
  private productSaveListeners: Set<ProductSaveListener> = new Set();
  private bannerDeleteListeners: Set<BannerDeleteListener> = new Set();
  private videoDeleteListeners: Set<VideoDeleteListener> = new Set();
  private ordersUpdateListeners: Set<OrdersUpdateListener> = new Set();
  private genericSyncListeners: Set<SyncListener> = new Set();

  public init() {
    if (typeof window === 'undefined') return;

    this.connectSSE();

    // Start background fast-polling fallback (every 3 seconds)
    // Guarantees sync even if phone sleeps or SSE closes
    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => {
        this.pollServer();
      }, 3000);
    }

    // Sync immediately when tab becomes visible or gets focus
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pollServer();
        if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
          this.connectSSE();
        }
      }
    });

    window.addEventListener('focus', () => {
      this.pollServer();
    });
  }

  private connectSSE() {
    if (typeof window === 'undefined') return;
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) return;
    if (this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.eventSource = new EventSource('/api/live-stream', { withCredentials: true });

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        console.log('[LiveSync] Connected to real-time server stream across all devices.');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch {
          // ignore heartbeat / ping messages
        }
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 2 seconds
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connectSSE();
          }, 2000);
        }
      };
    } catch (err) {
      this.isConnecting = false;
      console.warn('[LiveSync] SSE setup warning:', err);
    }
  }

  private handleEvent(data: any) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'CONNECTED':
        if (Array.isArray(data.deletedProductIds)) {
          const currentDeleted = StorageService.getDeletedProductIds();
          const merged = Array.from(new Set([...currentDeleted, ...data.deletedProductIds]));
          StorageService.saveDeletedProductIds(merged);
        }
        break;

      case 'PRODUCT_DELETED': {
        const id = data.id;
        if (id) {
          // 1. Permanently update local persistent blacklist
          const deleted = StorageService.getDeletedProductIds();
          if (!deleted.includes(id)) {
            StorageService.saveDeletedProductIds([...deleted, id]);
          }
          // 2. Remove product from local stored array
          const prods = StorageService.getProducts().filter(p => p.id !== id);
          StorageService.saveProducts(prods);

          // 3. Notify all listening UI components on phone / computer
          this.productDeleteListeners.forEach(cb => cb(id));
          this.genericSyncListeners.forEach(cb => cb());
        }
        break;
      }

      case 'PRODUCTS_BATCH_DELETED': {
        const ids: string[] = data.ids || [];
        if (ids.length > 0) {
          const deleted = StorageService.getDeletedProductIds();
          const merged = Array.from(new Set([...deleted, ...ids]));
          StorageService.saveDeletedProductIds(merged);

          const prods = StorageService.getProducts().filter(p => !ids.includes(p.id));
          StorageService.saveProducts(prods);

          this.productsBatchDeleteListeners.forEach(cb => cb(ids));
          this.genericSyncListeners.forEach(cb => cb());
        }
        break;
      }

      case 'PRODUCT_SAVED': {
        const prod: Product = data.product;
        if (prod && prod.id) {
          // Un-blacklist if re-added
          const deleted = StorageService.getDeletedProductIds().filter(i => i !== prod.id);
          StorageService.saveDeletedProductIds(deleted);

          const current = StorageService.getProducts();
          const exists = current.findIndex(p => p.id === prod.id);
          let updated: Product[];
          if (exists >= 0) {
            updated = current.map(p => p.id === prod.id ? prod : p);
          } else {
            updated = [prod, ...current];
          }
          StorageService.saveProducts(updated);

          this.productSaveListeners.forEach(cb => cb(prod));
          this.genericSyncListeners.forEach(cb => cb());
        }
        break;
      }

      case 'BANNER_DELETED': {
        const id = data.id;
        if (id) {
          const deleted = StorageService.getDeletedBannerIds();
          if (!deleted.includes(id)) {
            StorageService.saveDeletedBannerIds([...deleted, id]);
          }
          const banners = StorageService.getBanners().filter(b => b.id !== id);
          StorageService.saveBanners(banners);

          this.bannerDeleteListeners.forEach(cb => cb(id));
          this.genericSyncListeners.forEach(cb => cb());
        }
        break;
      }

      case 'VIDEO_DELETED': {
        const id = data.id;
        if (id) {
          const deleted = StorageService.getDeletedVideoIds();
          if (!deleted.includes(id)) {
            StorageService.saveDeletedVideoIds([...deleted, id]);
          }
          const videos = StorageService.getVideos().filter(v => v.id !== id);
          StorageService.saveVideos(videos);

          this.videoDeleteListeners.forEach(cb => cb(id));
          this.genericSyncListeners.forEach(cb => cb());
        }
        break;
      }

      case 'ORDER_SAVED':
      case 'ORDER_STATUS_UPDATED':
      case 'ORDERS_UPDATED': {
        if (Array.isArray(data.orders)) {
          StorageService.saveOrders(data.orders);
          this.ordersUpdateListeners.forEach(cb => cb(data.orders));
        }
        break;
      }

      default:
        break;
    }
  }

  public async pollServer() {
    try {
      const res = await StorageService.syncWithServer();
      if (res) {
        this.genericSyncListeners.forEach(cb => cb());
      }
    } catch {
      // offline silent
    }
  }

  // Subscribe methods
  public onProductDeleted(cb: ProductDeleteListener) {
    this.productDeleteListeners.add(cb);
    return () => this.productDeleteListeners.delete(cb);
  }

  public onProductsBatchDeleted(cb: ProductsBatchDeleteListener) {
    this.productsBatchDeleteListeners.add(cb);
    return () => this.productsBatchDeleteListeners.delete(cb);
  }

  public onProductSaved(cb: ProductSaveListener) {
    this.productSaveListeners.add(cb);
    return () => this.productSaveListeners.delete(cb);
  }

  public onBannerDeleted(cb: BannerDeleteListener) {
    this.bannerDeleteListeners.add(cb);
    return () => this.bannerDeleteListeners.delete(cb);
  }

  public onVideoDeleted(cb: VideoDeleteListener) {
    this.videoDeleteListeners.add(cb);
    return () => this.videoDeleteListeners.delete(cb);
  }

  public onOrdersUpdated(cb: OrdersUpdateListener) {
    this.ordersUpdateListeners.add(cb);
    return () => this.ordersUpdateListeners.delete(cb);
  }

  public onGenericSync(cb: SyncListener) {
    this.genericSyncListeners.add(cb);
    return () => this.genericSyncListeners.delete(cb);
  }
}

export const RealtimeSync = new RealtimeSyncManager();

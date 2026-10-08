import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_BANNERS, 
  INITIAL_VIDEOS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_AD_SPENDS 
} from './src/data/mockData.ts';
import { Product, AdBanner, VideoAd, DirectOrder, CustomerReview, AdSpendRecord } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database persistence setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface ServerDB {
  products: Product[];
  deletedProductIds: string[];
  banners: AdBanner[];
  deletedBannerIds: string[];
  videos: VideoAd[];
  deletedVideoIds: string[];
  orders: DirectOrder[];
  reviews: CustomerReview[];
  adSpends: AdSpendRecord[];
  updatedAt: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDatabase(): ServerDB {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: ServerDB = {
      products: INITIAL_PRODUCTS,
      deletedProductIds: [],
      banners: INITIAL_BANNERS,
      deletedBannerIds: [],
      videos: INITIAL_VIDEOS,
      deletedVideoIds: [],
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      adSpends: INITIAL_AD_SPENDS,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(initialDb);
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db: ServerDB = JSON.parse(raw);
    
    // Ensure all required fields exist
    if (!Array.isArray(db.products)) db.products = INITIAL_PRODUCTS;
    if (!Array.isArray(db.deletedProductIds)) db.deletedProductIds = [];
    if (!Array.isArray(db.banners)) db.banners = INITIAL_BANNERS;
    if (!Array.isArray(db.deletedBannerIds)) db.deletedBannerIds = [];
    if (!Array.isArray(db.videos)) db.videos = INITIAL_VIDEOS;
    if (!Array.isArray(db.deletedVideoIds)) db.deletedVideoIds = [];
    if (!Array.isArray(db.orders)) db.orders = INITIAL_ORDERS;
    if (!Array.isArray(db.reviews)) db.reviews = INITIAL_REVIEWS;
    if (!Array.isArray(db.adSpends)) db.adSpends = INITIAL_AD_SPENDS;
    
    return db;
  } catch (err) {
    console.error('Error reading db.json, recreating with defaults:', err);
    const fallbackDb: ServerDB = {
      products: INITIAL_PRODUCTS,
      deletedProductIds: [],
      banners: INITIAL_BANNERS,
      deletedBannerIds: [],
      videos: INITIAL_VIDEOS,
      deletedVideoIds: [],
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      adSpends: INITIAL_AD_SPENDS,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(fallbackDb);
    return fallbackDb;
  }
}

function saveDatabase(db: ServerDB): void {
  ensureDataDir();
  db.updatedAt = new Date().toISOString();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Helper to get only active, non-deleted items
function getActiveProducts(db: ServerDB): Product[] {
  const deletedSet = new Set(db.deletedProductIds || []);
  return db.products.filter(p => !deletedSet.has(p.id));
}

function getActiveBanners(db: ServerDB): AdBanner[] {
  const deletedSet = new Set(db.deletedBannerIds || []);
  return db.banners.filter(b => !deletedSet.has(b.id));
}

function getActiveVideos(db: ServerDB): VideoAd[] {
  const deletedSet = new Set(db.deletedVideoIds || []);
  return db.videos.filter(v => !deletedSet.has(v.id));
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full Sync endpoint for cross-device synchronization
app.get('/api/sync', (_req, res) => {
  const db = getDatabase();
  res.json({
    products: getActiveProducts(db),
    deletedProductIds: db.deletedProductIds,
    banners: getActiveBanners(db),
    deletedBannerIds: db.deletedBannerIds,
    videos: getActiveVideos(db),
    deletedVideoIds: db.deletedVideoIds,
    orders: db.orders,
    reviews: db.reviews,
    adSpends: db.adSpends,
    updatedAt: db.updatedAt
  });
});

// Products API
app.get('/api/products', (_req, res) => {
  const db = getDatabase();
  res.json(getActiveProducts(db));
});

app.post('/api/products', (req, res) => {
  const product: Product = req.body;
  if (!product || !product.id || !product.title) {
    return res.status(400).json({ error: 'Invalid product payload' });
  }

  const db = getDatabase();
  // Remove from deleted list if it was previously deleted
  db.deletedProductIds = db.deletedProductIds.filter(id => id !== product.id);

  const existingIdx = db.products.findIndex(p => p.id === product.id);
  if (existingIdx >= 0) {
    db.products[existingIdx] = product;
  } else {
    db.products.unshift(product);
  }

  saveDatabase(db);
  res.status(201).json({ product, products: getActiveProducts(db) });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = getDatabase();

  const idx = db.products.findIndex(p => p.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.products[idx] = { ...db.products[idx], ...updatedData, id };
  saveDatabase(db);
  res.json({ product: db.products[idx], products: getActiveProducts(db) });
});

// PERMANENT DELETE: Removes from db.products AND records in db.deletedProductIds
// This guarantees that ANY other device opening the website will NEVER see this product!
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  // 1. Add to permanent deleted blacklist
  if (!db.deletedProductIds.includes(id)) {
    db.deletedProductIds.push(id);
  }

  // 2. Remove product from stored array
  db.products = db.products.filter(p => p.id !== id);

  saveDatabase(db);
  console.log(`[Cross-Device Sync] Product "${id}" permanently deleted across all devices.`);

  res.json({
    success: true,
    deletedId: id,
    deletedProductIds: db.deletedProductIds,
    products: getActiveProducts(db)
  });
});

// Batch Delete endpoint to sync deletions made from any device
app.post('/api/products/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json({ success: true, count: 0 });
  }

  const db = getDatabase();
  const idSet = new Set(ids);

  ids.forEach(id => {
    if (!db.deletedProductIds.includes(id)) {
      db.deletedProductIds.push(id);
    }
  });

  db.products = db.products.filter(p => !idSet.has(p.id));
  saveDatabase(db);

  console.log(`[Cross-Device Sync] Batch deleted ${ids.length} products across all devices:`, ids);

  res.json({
    success: true,
    deletedProductIds: db.deletedProductIds,
    products: getActiveProducts(db)
  });
});

// Reset catalog back to factory defaults
app.post('/api/products/reset', (_req, res) => {
  const db = getDatabase();
  db.deletedProductIds = [];
  db.products = [...INITIAL_PRODUCTS];
  saveDatabase(db);
  res.json({ success: true, products: db.products });
});

// Product analytics counters
app.post('/api/products/:id/click', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const prod = db.products.find(p => p.id === id);
  if (prod) {
    prod.clicksCount = (prod.clicksCount || 0) + 1;
    saveDatabase(db);
    res.json({ clicksCount: prod.clicksCount });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products/:id/cart', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const prod = db.products.find(p => p.id === id);
  if (prod) {
    prod.cartCount = (prod.cartCount || 0) + 1;
    saveDatabase(db);
    res.json({ cartCount: prod.cartCount });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products/:id/purchase', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const prod = db.products.find(p => p.id === id);
  if (prod) {
    prod.purchaseCount = (prod.purchaseCount || 0) + 1;
    saveDatabase(db);
    res.json({ purchaseCount: prod.purchaseCount });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Banners API
app.get('/api/banners', (_req, res) => {
  const db = getDatabase();
  res.json(getActiveBanners(db));
});

app.post('/api/banners', (req, res) => {
  const banner: AdBanner = req.body;
  const db = getDatabase();
  db.deletedBannerIds = db.deletedBannerIds.filter(id => id !== banner.id);
  db.banners.unshift(banner);
  saveDatabase(db);
  res.status(201).json({ banner, banners: getActiveBanners(db) });
});

app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  if (!db.deletedBannerIds.includes(id)) {
    db.deletedBannerIds.push(id);
  }
  db.banners = db.banners.filter(b => b.id !== id);
  saveDatabase(db);
  res.json({ success: true, banners: getActiveBanners(db) });
});

// Videos API
app.get('/api/videos', (_req, res) => {
  const db = getDatabase();
  res.json(getActiveVideos(db));
});

app.post('/api/videos', (req, res) => {
  const video: VideoAd = req.body;
  const db = getDatabase();
  db.deletedVideoIds = db.deletedVideoIds.filter(id => id !== video.id);
  db.videos.unshift(video);
  saveDatabase(db);
  res.status(201).json({ video, videos: getActiveVideos(db) });
});

app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  if (!db.deletedVideoIds.includes(id)) {
    db.deletedVideoIds.push(id);
  }
  db.videos = db.videos.filter(v => v.id !== id);
  saveDatabase(db);
  res.json({ success: true, videos: getActiveVideos(db) });
});

// Orders API (Multi-device live sync)
app.get('/api/orders', (_req, res) => {
  const db = getDatabase();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const order: DirectOrder = req.body;
  const db = getDatabase();
  db.orders.unshift(order);
  saveDatabase(db);
  res.status(201).json({ order, orders: db.orders });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, orderStatus, courierName, trackingNumber } = req.body;
  const db = getDatabase();

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const newStatus = orderStatus || status;
  if (newStatus) order.orderStatus = newStatus;
  if (courierName) order.courierName = courierName;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  saveDatabase(db);
  res.json({ order, orders: db.orders });
});

// Reviews API
app.get('/api/reviews', (_req, res) => {
  const db = getDatabase();
  res.json(db.reviews);
});

app.post('/api/reviews', (req, res) => {
  const review: CustomerReview = req.body;
  const db = getDatabase();
  db.reviews.unshift(review);
  saveDatabase(db);
  res.status(201).json({ review, reviews: db.reviews });
});

// Helper to inject initial synchronized data into index.html
function injectInitialData(html: string, db: ServerDB): string {
  const activeProducts = getActiveProducts(db);
  const activeBanners = getActiveBanners(db);
  const activeVideos = getActiveVideos(db);

  const initialData = {
    products: activeProducts,
    deletedProductIds: db.deletedProductIds,
    banners: activeBanners,
    videos: activeVideos,
    orders: db.orders,
    reviews: db.reviews,
    updatedAt: db.updatedAt
  };

  const scriptTag = `<script>window.__INITIAL_SERVER_DATA__ = ${JSON.stringify(initialData)};</script>`;
  return html.replace('</head>', `${scriptTag}\n</head>`);
}

// ---------------- VITE MIDDLEWARE & SERVER INITIALIZATION ----------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    // Serve HTML with injected synchronized data
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }

      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        const db = getDatabase();
        const html = injectInitialData(template, db);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.use('*', (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }

      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let template = fs.readFileSync(indexPath, 'utf-8');
        const db = getDatabase();
        const html = injectInitialData(template, db);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } else {
        res.status(404).send('Application not built');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`  DealHub Full-Stack Server Running on Port ${PORT}`);
    console.log(`  Cross-Device Sync API active at http://0.0.0.0:${PORT}/api/sync`);
    console.log(`==================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

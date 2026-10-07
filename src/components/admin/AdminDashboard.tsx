import React, { useState } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  Video, 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  MousePointerClick, 
  ShoppingBag, 
  ShoppingCart, 
  Eye, 
  ExternalLink, 
  Mail, 
  CheckCircle, 
  Layers, 
  Percent, 
  Key, 
  Star,
  Check,
  Tag,
  ArrowUpRight,
  ShieldAlert,
  Send,
  TrendingDown
} from 'lucide-react';
import { 
  Product, 
  AdBanner, 
  VideoAd, 
  AdSpendRecord, 
  DirectOrder, 
  CustomerReview, 
  EmailLog, 
  AffiliatePlatform, 
  ProductCategory,
  PriceDropAlert
} from '../../types';
import { StorageService } from '../../services/storage';
import { ExportService } from '../../services/exportUtils';
import { Language, translations } from '../../translations';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  banners: AdBanner[];
  onAddBanner: (b: AdBanner) => void;
  onUpdateBanner: (b: AdBanner) => void;
  onDeleteBanner: (id: string) => void;
  videos: VideoAd[];
  onAddVideo: (v: VideoAd) => void;
  onUpdateVideo: (v: VideoAd) => void;
  onDeleteVideo: (id: string) => void;
  adSpends: AdSpendRecord[];
  onAddAdSpend: (s: AdSpendRecord) => void;
  onDeleteAdSpend: (id: string) => void;
  orders: DirectOrder[];
  onUpdateOrderStatus: (id: string, status: DirectOrder['orderStatus']) => void;
  reviews: CustomerReview[];
  onDeleteReview: (id: string) => void;
  emailLogs: EmailLog[];
  onSendTestEmail: (email: string, subject: string) => void;
  adminPin: string;
  onUpdatePin: (newPin: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  lang,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  banners,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  videos,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  adSpends,
  onAddAdSpend,
  onDeleteAdSpend,
  orders,
  onUpdateOrderStatus,
  reviews,
  onDeleteReview,
  emailLogs,
  onSendTestEmail,
  adminPin,
  onUpdatePin,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'banners' | 'videos' | 'ad_spend' | 'orders' | 'reviews' | 'emails' | 'settings'
  >('analytics');

  // Product Add / Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    title: '',
    category: 'electronics',
    platform: 'amazon',
    affiliateUrl: '',
    imageUrl: '',
    originalPrice: 1999,
    dealPrice: 999,
    discountPercentage: 50,
    rating: 4.5,
    reviewCount: 100,
    couponCode: '',
    badge: 'Hot Deal',
    inStock: true,
    description: '',
  });

  // Banner Add Form state
  const [isBannerFormOpen, setIsBannerFormOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState<Partial<AdBanner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetUrl: '#deals',
    position: 'hero',
    platform: 'all',
    buttonText: 'Claim Deal Now',
    active: true,
  });

  // Video Add Form state
  const [isVideoFormOpen, setIsVideoFormOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState<Partial<VideoAd>>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    targetUrl: '',
    active: true,
  });

  // Ad Spend Form state
  const [isSpendFormOpen, setIsSpendFormOpen] = useState(false);
  const [spendFormData, setSpendFormData] = useState<Partial<AdSpendRecord>>({
    platform: 'facebook',
    campaignName: '',
    amountSpent: 2000,
    date: new Date().toISOString().slice(0, 10),
    clicksGenerated: 500,
    conversions: 30,
    revenueGenerated: 6000,
    notes: '',
  });

  // Test Email state
  const [testEmailInput, setTestEmailInput] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  // Pin update state
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Aggregate Metrics
  const totalClicks = products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);
  const totalCartClicks = products.reduce((acc, p) => acc + (p.cartCount || 0), 0);
  const totalPurchases = products.reduce((acc, p) => acc + (p.purchaseCount || 0), 0);
  const totalAdSpent = adSpends.reduce((acc, s) => acc + s.amountSpent, 0);
  const totalAdRevenue = adSpends.reduce((acc, s) => acc + s.revenueGenerated, 0);
  const overallROAS = totalAdSpent > 0 ? (totalAdRevenue / totalAdSpent).toFixed(2) : '0.00';
  const directOrdersRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Platform click breakdown
  const amazonClicks = products.filter(p => p.platform === 'amazon').reduce((a, b) => a + b.clicksCount, 0);
  const flipkartClicks = products.filter(p => p.platform === 'flipkart').reduce((a, b) => a + b.clicksCount, 0);
  const meeshoClicks = products.filter(p => p.platform === 'meesho').reduce((a, b) => a + b.clicksCount, 0);

  // Handle Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.title || !productFormData.affiliateUrl) return;

    const discount = Math.round(
      (((productFormData.originalPrice || 0) - (productFormData.dealPrice || 0)) / (productFormData.originalPrice || 1)) * 100
    );

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        ...productFormData,
        discountPercentage: discount > 0 ? discount : (productFormData.discountPercentage || 0),
      } as Product;
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: productFormData.title || 'New Deal Product',
        titleBn: productFormData.titleBn || productFormData.title,
        description: productFormData.description || 'Verified product discount deal.',
        descriptionBn: productFormData.descriptionBn,
        category: (productFormData.category as ProductCategory) || 'electronics',
        platform: (productFormData.platform as AffiliatePlatform) || 'amazon',
        affiliateUrl: productFormData.affiliateUrl || 'https://amazon.in',
        imageUrl: productFormData.imageUrl || '/src/assets/images/hero_affiliate_deals_1791387714076.jpg',
        originalPrice: Number(productFormData.originalPrice) || 1999,
        dealPrice: Number(productFormData.dealPrice) || 999,
        discountPercentage: discount > 0 ? discount : 50,
        rating: Number(productFormData.rating) || 4.5,
        reviewCount: Number(productFormData.reviewCount) || 50,
        couponCode: productFormData.couponCode || '',
        badge: productFormData.badge as any,
        inStock: productFormData.inStock ?? true,
        videoUrl: productFormData.videoUrl,
        clicksCount: 0,
        cartCount: 0,
        purchaseCount: 0,
        featured: true,
        createdAt: new Date().toISOString(),
      };
      onAddProduct(newProd);
    }

    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  // Open Edit Product
  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({ ...prod });
    setIsProductFormOpen(true);
  };

  // Handle Save Banner
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title) return;

    const newBanner: AdBanner = {
      id: `banner-${Date.now()}`,
      title: bannerFormData.title || 'Special Promotion Banner',
      titleBn: bannerFormData.titleBn,
      subtitle: bannerFormData.subtitle || 'Exclusive deals and discounts',
      subtitleBn: bannerFormData.subtitleBn,
      imageUrl: bannerFormData.imageUrl || '/src/assets/images/banner_ad_festive_sale_1791387761449.jpg',
      targetUrl: bannerFormData.targetUrl || '#deals',
      position: bannerFormData.position || 'hero',
      platform: bannerFormData.platform || 'all',
      buttonText: bannerFormData.buttonText || 'Claim Deal',
      active: true,
      clicks: 0,
      impressions: 1,
    };
    onAddBanner(newBanner);
    setIsBannerFormOpen(false);
  };

  // Handle Save Video
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title || !videoFormData.videoUrl) return;

    const newVideo: VideoAd = {
      id: `video-${Date.now()}`,
      title: videoFormData.title,
      description: videoFormData.description || 'Hands-on review',
      videoUrl: videoFormData.videoUrl,
      thumbnailUrl: videoFormData.thumbnailUrl || '/src/assets/images/product_anc_earbuds_1791387733714.jpg',
      targetUrl: videoFormData.targetUrl || '#deals',
      views: 0,
      clicks: 0,
      active: true,
    };
    onAddVideo(newVideo);
    setIsVideoFormOpen(false);
  };

  // Handle Save Spend
  const handleSaveSpend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendFormData.campaignName) return;

    const newSpend: AdSpendRecord = {
      id: `spend-${Date.now()}`,
      platform: spendFormData.platform || 'facebook',
      campaignName: spendFormData.campaignName,
      amountSpent: Number(spendFormData.amountSpent) || 0,
      date: spendFormData.date || new Date().toISOString().slice(0, 10),
      clicksGenerated: Number(spendFormData.clicksGenerated) || 0,
      conversions: Number(spendFormData.conversions) || 0,
      revenueGenerated: Number(spendFormData.revenueGenerated) || 0,
      notes: spendFormData.notes || '',
    };
    onAddAdSpend(newSpend);
    setIsSpendFormOpen(false);
  };

  // Export PDF Report handler
  const handleExportPDF = () => {
    const summary = [
      { label: 'Total Affiliate Clicks', value: totalClicks.toLocaleString() },
      { label: 'Add to Cart Clicks', value: totalCartClicks.toLocaleString() },
      { label: 'Purchases / Conversions', value: totalPurchases.toLocaleString() },
      { label: 'Total Ad Spend (INR)', value: `₹${totalAdSpent.toLocaleString()}` },
      { label: 'Ad Revenue (INR)', value: `₹${totalAdRevenue.toLocaleString()}` },
      { label: 'Overall ROAS', value: `${overallROAS}x` },
      { label: 'Direct Store Sales', value: `₹${directOrdersRevenue.toLocaleString()}` },
      { label: 'Active Products', value: String(products.length) },
    ];

    const headers = ['Product Title', 'Platform', 'Deal Price', 'Discount', 'Clicks', 'Cart', 'Purchases', 'Conv %'];
    const rows = products.map(p => {
      const cr = p.clicksCount > 0 ? ((p.purchaseCount / p.clicksCount) * 100).toFixed(1) + '%' : '0.0%';
      return [
        p.title,
        p.platform.toUpperCase(),
        `₹${p.dealPrice}`,
        `${p.discountPercentage}%`,
        p.clicksCount,
        p.cartCount,
        p.purchaseCount,
        cr
      ];
    });

    ExportService.exportToPDF('Affiliate Marketing & Performance Report', summary, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Admin Card */}
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col h-[92vh] overflow-hidden">
        
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs">
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Hub</span>
            </span>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                Affiliate Control Center & Analytics
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage Amazon, Flipkart, Meesho products, ad spends, and real-time sales reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Buttons */}
            <button
              onClick={() => ExportService.exportProductsCSV(products)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-xs"
              title="Download Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-xs"
              title="Print / PDF Report"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">PDF Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 py-2">
          {[
            { id: 'analytics', label: 'Overview & Reports', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'products', label: `Products (${products.length})`, icon: <Package className="w-3.5 h-3.5" /> },
            { id: 'banners', label: `Banners (${banners.length})`, icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'videos', label: `Videos (${videos.length})`, icon: <Video className="w-3.5 h-3.5" /> },
            { id: 'ad_spend', label: 'Ad Spends & ROAS', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'orders', label: `Direct Orders (${orders.length})`, icon: <ShoppingCart className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: <Star className="w-3.5 h-3.5" /> },
            { id: 'emails', label: `Email Logs (${emailLogs.length})`, icon: <Mail className="w-3.5 h-3.5" /> },
            { id: 'settings', label: 'PIN Security', icon: <Key className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* TAB 1: ANALYTICS & SALES REPORT */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Affiliate Link Clicks</span>
                    <MousePointerClick className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {totalClicks.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                    +18.4% this week
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Add to Cart Actions</span>
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {totalCartClicks.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Intent tracking active
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Purchases / Conversions</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {totalPurchases.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                    {totalClicks > 0 ? ((totalPurchases / totalClicks) * 100).toFixed(1) : 0}% Conversion Rate
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Ad Spend vs Return (ROAS)</span>
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {overallROAS}x
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                    ₹{totalAdSpent.toLocaleString()} spent → ₹{totalAdRevenue.toLocaleString()} rev
                  </div>
                </div>
              </div>

              {/* Platform Share & Ad Funnel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform share */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                    <span>Platform Click Distribution</span>
                    <span className="text-xs font-normal text-slate-400">Real-time</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Amazon Deals</span>
                        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">{amazonClicks} clicks</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${totalClicks > 0 ? (amazonClicks / totalClicks) * 100 : 33}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Flipkart Offers</span>
                        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">{flipkartClicks} clicks</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${totalClicks > 0 ? (flipkartClicks / totalClicks) * 100 : 33}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Meesho Fashion & Budget</span>
                        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">{meeshoClicks} clicks</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-pink-500 h-full rounded-full" 
                          style={{ width: `${totalClicks > 0 ? (meeshoClicks / totalClicks) * 100 : 33}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ad channels conversion */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Ad Campaigns Breakdown
                  </h3>
                  <div className="space-y-2 text-xs">
                    {adSpends.map(ad => (
                      <div key={ad.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{ad.campaignName}</div>
                          <div className="text-[11px] text-slate-500 uppercase">{ad.platform} · {ad.clicksGenerated} clicks</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            ROAS: {(ad.revenueGenerated / (ad.amountSpent || 1)).toFixed(2)}x
                          </div>
                          <div className="text-[10px] text-slate-400 tabular-nums">₹{ad.amountSpent} spent</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Top Performing Deals Table */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Top Converting Affiliate Products
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Platform</th>
                        <th className="py-2 px-3">Price</th>
                        <th className="py-2 px-3">Clicks</th>
                        <th className="py-2 px-3">Cart</th>
                        <th className="py-2 px-3">Conversions</th>
                        <th className="py-2 px-3">CR %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {products.map(p => {
                        const cr = p.clicksCount > 0 ? ((p.purchaseCount / p.clicksCount) * 100).toFixed(1) : '0.0';
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                              {p.title}
                            </td>
                            <td className="py-2.5 px-3 uppercase text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              {p.platform}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-bold">
                              ₹{p.dealPrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums text-slate-600 dark:text-slate-300 font-mono">
                              {p.clicksCount}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums text-slate-600 dark:text-slate-300 font-mono">
                              {p.cartCount}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {p.purchaseCount}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums text-slate-600 dark:text-slate-300 font-semibold font-mono">
                              {cr}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Product Catalog & Affiliate Links</h3>
                  <p className="text-xs text-slate-500">Add, edit, delete deals, coupon codes and affiliate links.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      title: '',
                      category: 'electronics',
                      platform: 'amazon',
                      affiliateUrl: '',
                      imageUrl: '/src/assets/images/hero_affiliate_deals_1791387714076.jpg',
                      originalPrice: 2999,
                      dealPrice: 1499,
                      discountPercentage: 50,
                      rating: 4.8,
                      reviewCount: 200,
                      couponCode: 'SAVE500',
                      badge: 'Hot Deal',
                      inStock: true,
                      description: '',
                    });
                    setIsProductFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Platform</th>
                        <th className="py-2.5 px-3">Price / Discount</th>
                        <th className="py-2.5 px-3">Coupon</th>
                        <th className="py-2.5 px-3">Clicks / Sales</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 max-w-xs">
                              <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-slate-100 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{p.title}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 uppercase font-bold text-amber-600 dark:text-amber-400">
                            {p.platform}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums">
                            <span className="font-bold text-slate-900 dark:text-white">₹{p.dealPrice.toLocaleString()}</span>
                            <span className="text-slate-400 line-through ml-1.5">₹{p.originalPrice.toLocaleString()}</span>
                            <span className="text-emerald-600 font-bold ml-1.5">({p.discountPercentage}%)</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {p.couponCode || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                            {p.clicksCount} clicks · {p.purchaseCount} sold
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.inStock ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                            }`}>
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="p-1 text-slate-500 hover:text-amber-600 cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANNERS & AD MANAGER */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Promotional Banners & Ad Sliders</h3>
                  <p className="text-xs text-slate-500">Configure hero sliders and in-feed advertisement placements.</p>
                </div>
                <button
                  onClick={() => setIsBannerFormOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ad Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map(b => (
                  <div key={b.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="relative aspect-16/9 rounded-lg overflow-hidden bg-slate-100">
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        {b.clicks} Clicks · {b.impressions} Views
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">{b.position} · {b.platform}</span>
                      <button
                        onClick={() => onDeleteBanner(b.id)}
                        className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Delete Banner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VIDEOS REELS */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Video Reviews & Reels</h3>
                  <p className="text-xs text-slate-500">Attach unboxing YouTube videos and hands-on demonstrations.</p>
                </div>
                <button
                  onClick={() => setIsVideoFormOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video Review</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map(v => (
                  <div key={v.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="aspect-16/9 bg-black rounded-lg overflow-hidden mb-3">
                        <iframe src={v.videoUrl} title={v.title} className="w-full h-full border-0" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{v.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{v.description}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">{v.views} Views · {v.clicks} Clicks</span>
                      <button
                        onClick={() => onDeleteVideo(v.id)}
                        className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Delete Video
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AD SPEND & ROAS TRACKER */}
          {activeTab === 'ad_spend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Facebook, Instagram & Google Ads Tracker</h3>
                  <p className="text-xs text-slate-500">Record advertising budget and calculate real ROI / ROAS.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => ExportService.exportAdSpendCSV(adSpends)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setIsSpendFormOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Ad Campaign</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3">Campaign</th>
                      <th className="py-2.5 px-3">Spent</th>
                      <th className="py-2.5 px-3">Clicks</th>
                      <th className="py-2.5 px-3">Conversions</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3">ROAS</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {adSpends.map(s => {
                      const roas = (s.revenueGenerated / (s.amountSpent || 1)).toFixed(2);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono">{s.date}</td>
                          <td className="py-2.5 px-3 uppercase font-bold text-purple-600 dark:text-purple-400">{s.platform}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{s.campaignName}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-red-600">₹{s.amountSpent.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono">{s.clicksGenerated}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{s.conversions}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">₹{s.revenueGenerated.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono font-extrabold text-amber-600">{roas}x</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => onDeleteAdSpend(s.id)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DIRECT ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Direct Orders & Fulfillment</h3>
                  <p className="text-xs text-slate-500">Update tracking states and courier tracking references.</p>
                </div>
                <button
                  onClick={() => ExportService.exportOrdersCSV(orders)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download Orders CSV</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Phone / City</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Tracking</th>
                      <th className="py-2.5 px-3">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{o.id}</td>
                        <td className="py-2.5 px-3 font-semibold">{o.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{o.phone} · {o.city}</td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">₹{o.totalAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold">
                          <span className={`px-1.5 py-0.5 rounded ${o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{o.trackingNumber}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-semibold cursor-pointer"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Customer Feedback Moderation</h3>
              <div className="space-y-3">
                {reviews.map(r => {
                  const product = products.find(p => p.id === r.productId);
                  return (
                    <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{r.customerName}</span>
                          <span className="text-amber-500 font-bold">{r.rating} ★</span>
                          <span className="text-slate-400">on {product?.title || 'Product'}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{r.comment}</p>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteReview(r.id)}
                        className="text-red-500 hover:text-red-700 font-semibold cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: EMAIL NOTIFICATION LOGS & TESTER */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              {/* Send Test Email Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Automatic Email Notification System
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Trigger and test instant transactional order emails, invoice receipts, and deal alerts.
                </p>

                {emailStatusMsg && (
                  <div className="p-2.5 mb-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg">
                    {emailStatusMsg}
                  </div>
                )}

                <div className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="Enter recipient email (e.g. client@example.com)"
                    value={testEmailInput}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={() => {
                      if (!testEmailInput) return;
                      onSendTestEmail(testEmailInput, 'Test Deal Alert & Order Notification');
                      setEmailStatusMsg(`Notification dispatched to ${testEmailInput}`);
                      setTestEmailInput('');
                      setTimeout(() => setEmailStatusMsg(''), 3000);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>

              {/* Logs table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Recipient</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {emailLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(log.sentAt).toLocaleTimeString()}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{log.recipientEmail}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{log.subject}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">{log.type.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">DELIVERED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Active Price Drop Subscriptions */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-amber-500" />
                      <span>Subscribed Price Drop Alerts</span>
                    </h4>
                    <p className="text-xs text-slate-500">Users waiting for deal price reductions on Amazon, Flipkart, and Meesho.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono">
                    {StorageService.getPriceAlerts().length} Active
                  </span>
                </div>

                {StorageService.getPriceAlerts().length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No price drop alerts set yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                        <tr>
                          <th className="py-2 px-3">Subscriber Email</th>
                          <th className="py-2 px-3">Product</th>
                          <th className="py-2 px-3">Platform</th>
                          <th className="py-2 px-3">Current Price</th>
                          <th className="py-2 px-3">Target Price</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {StorageService.getPriceAlerts().map((alert: PriceDropAlert) => (
                          <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold font-mono text-slate-900 dark:text-white">{alert.userEmail}</td>
                            <td className="py-2.5 px-3 truncate max-w-xs">{alert.productTitle}</td>
                            <td className="py-2.5 px-3 uppercase font-bold text-amber-600">{alert.platform}</td>
                            <td className="py-2.5 px-3 font-mono">₹{alert.currentPrice.toLocaleString()}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                              {alert.targetPrice ? `₹${alert.targetPrice.toLocaleString()}` : 'Any reduction'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: SECURITY & PIN SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-md p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Admin Security Settings</h3>
              <p className="text-xs text-slate-500">
                Update your private administrator unlock PIN code.
              </p>

              {pinChangeMsg && (
                <div className="p-2.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg">
                  {pinChangeMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Admin Security PIN
                </label>
                <input
                  type="text"
                  placeholder="Enter 4-8 character PIN"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => {
                  if (newPinInput.length >= 4) {
                    onUpdatePin(newPinInput);
                    setPinChangeMsg('Admin PIN updated successfully!');
                    setNewPinInput('');
                    setTimeout(() => setPinChangeMsg(''), 3000);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs cursor-pointer"
              >
                Save New PIN
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsProductFormOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product Deal' : 'Add New Affiliate Product'}
              </h3>
              <button onClick={() => setIsProductFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productFormData.title || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Affiliate Platform *</label>
                  <select
                    value={productFormData.platform}
                    onChange={(e) => setProductFormData({ ...productFormData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="meesho">Meesho</option>
                    <option value="direct">Direct Store</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="gadgets">Gadgets</option>
                    <option value="fashion">Fashion & Style</option>
                    <option value="home_kitchen">Home & Kitchen</option>
                    <option value="beauty_personal">Beauty & Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Affiliate Link URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://amazon.in/dp/... or https://meesho.com/..."
                  value={productFormData.affiliateUrl || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, affiliateUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL / Path *</label>
                <input
                  type="text"
                  required
                  value={productFormData.imageUrl || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.originalPrice || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deal Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.dealPrice || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, dealPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={productFormData.couponCode || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, couponCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={productFormData.description || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BANNER */}
      {isBannerFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsBannerFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 z-10 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">Add Promotional Banner</h3>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Banner Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Grand Mega Festive Sale"
                  value={bannerFormData.title || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="Up to 70% off on Amazon and Flipkart"
                  value={bannerFormData.subtitle || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="/src/assets/images/banner_ad_festive_sale_1791387761449.jpg"
                  value={bannerFormData.imageUrl || ''}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsBannerFormOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 font-bold rounded">Add Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VIDEO */}
      {isVideoFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsVideoFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 z-10 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">Add Video Review</h3>
            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  placeholder="Honest Headphones Review"
                  value={videoFormData.title || ''}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">YouTube Embed / MP4 URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoFormData.videoUrl || ''}
                  onChange={(e) => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsVideoFormOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 font-bold rounded">Add Video</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG AD SPEND */}
      {isSpendFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setIsSpendFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 z-10 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">Log Ad Spend Record</h3>
            <form onSubmit={handleSaveSpend} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Ad Platform</label>
                  <select
                    value={spendFormData.platform}
                    onChange={(e) => setSpendFormData({ ...spendFormData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="instagram">Instagram Ads</option>
                    <option value="google">Google Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Campaign Date</label>
                  <input
                    type="date"
                    value={spendFormData.date}
                    onChange={(e) => setSpendFormData({ ...spendFormData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="FB_Festive_Gadgets"
                  value={spendFormData.campaignName || ''}
                  onChange={(e) => setSpendFormData({ ...spendFormData, campaignName: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Spend Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={spendFormData.amountSpent || ''}
                    onChange={(e) => setSpendFormData({ ...spendFormData, amountSpent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Revenue Generated (₹)</label>
                  <input
                    type="number"
                    required
                    value={spendFormData.revenueGenerated || ''}
                    onChange={(e) => setSpendFormData({ ...spendFormData, revenueGenerated: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsSpendFormOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 font-bold rounded">Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

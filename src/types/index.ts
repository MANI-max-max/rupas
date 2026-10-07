export type AffiliatePlatform = 'amazon' | 'flipkart' | 'meesho' | 'direct';

export type ProductCategory = 
  | 'electronics' 
  | 'fashion' 
  | 'gadgets' 
  | 'home_kitchen' 
  | 'beauty_personal';

export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  category: ProductCategory;
  platform: AffiliatePlatform;
  affiliateUrl: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  couponCode?: string;
  badge?: 'Best Seller' | 'Lightning Deal' | 'Trending' | 'Top Rated' | 'Hot Deal';
  inStock: boolean;
  videoUrl?: string; // YouTube or direct video embed
  clicksCount: number;
  cartCount: number;
  purchaseCount: number;
  featured: boolean;
  createdAt: string;
}

export interface AdBanner {
  id: string;
  title: string;
  titleBn?: string;
  subtitle: string;
  subtitleBn?: string;
  imageUrl: string;
  targetUrl: string;
  position: 'hero' | 'middle' | 'sidebar';
  platform: AffiliatePlatform | 'all';
  buttonText: string;
  buttonTextBn?: string;
  active: boolean;
  clicks: number;
  impressions: number;
}

export interface VideoAd {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube or MP4 url
  thumbnailUrl: string;
  productId?: string;
  targetUrl: string;
  views: number;
  clicks: number;
  active: boolean;
}

export interface AdSpendRecord {
  id: string;
  platform: 'facebook' | 'instagram' | 'google' | 'other';
  campaignName: string;
  amountSpent: number;
  date: string;
  clicksGenerated: number;
  conversions: number;
  revenueGenerated: number;
  notes?: string;
}

export interface CustomerReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: 'approved' | 'pending';
}

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface DirectOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: OrderStatus;
  trackingNumber: string;
  courierName?: string;
  createdAt: string;
  notes?: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 'order_confirmation' | 'shipping_update' | 'deal_alert' | 'welcome' | 'price_drop_alert';
  sentAt: string;
  status: 'sent' | 'delivered';
  bodyPreview: string;
}

export interface PriceDropAlert {
  id: string;
  productId: string;
  productTitle: string;
  userEmail: string;
  currentPrice: number;
  targetPrice?: number;
  platform: AffiliatePlatform;
  createdAt: string;
  status: 'active' | 'triggered';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PixelEvent {
  id: string;
  timestamp: string;
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'AffiliateClick' | 'Purchase';
  productId?: string;
  productTitle?: string;
  platform?: AffiliatePlatform;
  value?: number;
  source: string;
}

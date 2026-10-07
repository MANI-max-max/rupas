import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Check, 
  Copy, 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Tag, 
  MessageSquarePlus,
  Play,
  Bell,
  BellRing,
  TrendingDown,
  CheckCircle2,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, CustomerReview, PriceDropAlert } from '../types';
import { Language, translations } from '../translations';
import { StorageService } from '../services/storage';
import { SocialShareMenu } from './SocialShareMenu';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  lang: Language;
  onAffiliateClick: (product: Product) => void;
  reviews: CustomerReview[];
  onOpenWriteReview: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  lang,
  onAffiliateClick,
  reviews,
  onOpenWriteReview,
}) => {
  if (!product) return null;
  const t = translations[lang];

  const [copied, setCopied] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertSaved, setAlertSaved] = useState(false);
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);

  // Check if an existing alert exists for this product
  useEffect(() => {
    if (!product) return;
    const existing = StorageService.getPriceAlerts().find(a => a.productId === product.id);
    if (existing) {
      setAlertSaved(true);
      setAlertEmail(existing.userEmail);
    } else {
      setAlertSaved(false);
      setAlertEmail('');
    }
  }, [product?.id]);

  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'approved');

  const handleCopyCoupon = () => {
    if (!product.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim() || !product) return;

    const newAlert: PriceDropAlert = {
      id: `alert-${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      userEmail: alertEmail.trim(),
      currentPrice: product.dealPrice,
      targetPrice: targetPrice ? Number(targetPrice) : Math.round(product.dealPrice * 0.95),
      platform: product.platform,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    StorageService.addPriceAlert(newAlert);
    setAlertSaved(true);
    setIsAlertFormOpen(false);

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#6366f1']
    });
  };

  const savingsAmount = product.originalPrice - product.dealPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{product.platform} Deal</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category.replace('_', ' ')}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Product Image & Video preview */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded shadow-sm">
                  {product.discountPercentage}% DISCOUNT
                </div>
              </div>

              {/* Video embed if product has video */}
              {product.videoUrl && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2 px-1">
                    <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span>Watch Honest Video Review & Unboxing</span>
                  </div>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={product.videoUrl}
                      title={product.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contiguous Purchase & Deal Module */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {lang === 'bn' && product.titleBn ? product.titleBn : product.title}
                </h2>

                {/* Rating, verified reviews & Social Share */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      {product.reviewCount} {t.reviews}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className={`text-xs font-semibold ${product.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {product.inStock ? t.inStock : t.outOfStock}
                    </span>
                  </div>

                  {/* Social Media Share for WhatsApp, Facebook, Twitter */}
                  <SocialShareMenu product={product} compact={false} />
                </div>

                {/* Pricing Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                      ₹{product.dealPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      M.R.P: ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      You Save ₹{savingsAmount.toLocaleString()} ({product.discountPercentage}%)
                    </span>
                  </div>

                  {/* Coupon Code Section */}
                  {product.couponCode && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {t.couponCode}: <strong className="font-mono text-slate-900 dark:text-white">{product.couponCode}</strong>
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCoupon}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? t.couponCopied : t.copyCoupon}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' && product.descriptionBn ? product.descriptionBn : product.description}
                </p>

                {/* FEATURE 1: Price Drop Alert Feature Box */}
                <div className="mt-5 p-3.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{t.priceDropAlert}</span>
                    </div>
                    {alertSaved ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.alertActive}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAlertFormOpen(!isAlertFormOpen)}
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        <span>{isAlertFormOpen ? 'Cancel' : 'Notify Me'}</span>
                      </button>
                    )}
                  </div>

                  {alertSaved ? (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Active alert for <strong className="font-mono text-slate-800 dark:text-slate-200">{alertEmail}</strong>. We'll automatically email you the instant this price drops lower!
                    </p>
                  ) : (
                    <div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                        {t.priceDropAlertDesc}
                      </p>
                      
                      {isAlertFormOpen && (
                        <form onSubmit={handleSetPriceAlert} className="space-y-2 pt-1 animate-fadeIn">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={alertEmail}
                                onChange={(e) => setAlertEmail(e.target.value)}
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            <input
                              type="number"
                              placeholder={`Target: ₹${Math.round(product.dealPrice * 0.95)}`}
                              value={targetPrice}
                              onChange={(e) => setTargetPrice(e.target.value)}
                              className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              {t.setAlert}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Value props */}
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">100% Genuine</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <Truck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Fast Dispatch</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <RotateCcw className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Full-width SHOP NOW (Direct card buttons removed) */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onAffiliateClick(product)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-xl active:scale-98 cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Customer Reviews Section */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.customerReviews}</span>
                <span className="text-xs text-slate-500 font-normal">({productReviews.length})</span>
              </h3>
              <button
                onClick={() => onOpenWriteReview(product.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{t.writeReview}</span>
              </button>
            </div>

            {productReviews.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3 italic">
                No reviews yet for this product. Be the first to review!
              </p>
            ) : (
              <div className="space-y-3">
                {productReviews.map(rev => (
                  <div 
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {rev.customerName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

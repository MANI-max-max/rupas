import React, { useState } from 'react';
import { 
  Star, 
  ExternalLink, 
  Copy, 
  Check, 
  ShoppingBag, 
  Eye, 
  Play, 
  Tag, 
  Flame,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { Language, translations } from '../translations';
import { SocialShareMenu } from './SocialShareMenu';
import { resolveImageUrl, CDN_FALLBACKS } from '../utils/mediaUtils';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onProductClick: (product: Product) => void;
  onAffiliateClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onVideoClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onProductClick,
  onAffiliateClick,
  onAddToCart,
  onVideoClick,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopied(true);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#3b82f6']
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const platformBadgeDetails = {
    amazon: { label: 'Amazon', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/60' },
    flipkart: { label: 'Flipkart', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/60' },
    meesho: { label: 'Meesho', color: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-900/60' },
    direct: { label: 'Direct Deal', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/60' },
  }[product.platform];

  const savingsAmount = product.originalPrice - product.dealPrice;

  return (
    <article 
      onClick={() => onProductClick(product)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Banner Ribbon / Badge (Single unobtrusive label, no badge sandwich) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <span className="text-[11px] font-bold tracking-tight text-white bg-red-600 px-2 py-0.5 rounded shadow-xs">
          {product.discountPercentage}% OFF
        </span>
        {product.badge && (
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200/60 dark:border-slate-700/60">
            {product.badge}
          </span>
        )}
      </div>

      {/* Top Right Action Icons: Social Share & Video Review */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <SocialShareMenu product={product} compact={true} />
        {product.videoUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onVideoClick) onVideoClick(product);
            }}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs shadow-xs transition-transform hover:scale-110 cursor-pointer"
            title="Watch Video Review"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
          </button>
        )}
      </div>

      {/* Product Image slot with fallback container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center">
        <img
          src={resolveImageUrl(product.imageUrl, 'hero')}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('unsplash')) {
              target.src = CDN_FALLBACKS.hero;
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
        />
      </div>

      {/* Product Content Body */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Category · Platform · Rating) strictly following anti-pill rule */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${platformBadgeDetails.color}`}>
              {platformBadgeDetails.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category.replace('_', ' & ')}</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {lang === 'bn' && product.titleBn ? product.titleBn : product.title}
          </h3>

          {/* Pricing Row with Tabular Numerals */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              ₹{product.dealPrice.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            {savingsAmount > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                Save ₹{savingsAmount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Coupon Code Strip if available */}
          {product.couponCode && (
            <div 
              onClick={handleCopyCoupon}
              className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 min-h-[36px] rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs transition-colors hover:bg-amber-100/70 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="font-mono font-bold tracking-wider">{product.couponCode}</span>
              </div>
              <button 
                type="button"
                className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Affiliate Outbound Button (Full-width SHOP NOW) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAffiliateClick(product);
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer uppercase"
          >
            <span>SHOP NOW</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </article>
  );
};

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart, ArrowUp } from 'lucide-react';
import { Language, translations } from '../translations';
import { AffiliatePlatform } from '../types';

interface FooterProps {
  lang: Language;
  onOpenTracking: () => void;
  onOpenAdmin?: () => void;
  onSelectPlatform: (platform: AffiliatePlatform | 'all') => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onOpenTracking,
  onOpenAdmin,
  onSelectPlatform,
  onScrollToTop,
}) => {
  const t = translations[lang];

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">100% Genuine Deals</h4>
              <p className="text-[11px] text-slate-500">Verified links with authentic discounts</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.fastDelivery}</h4>
              <p className="text-[11px] text-slate-500">Dispatched via partner networks</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.easyReturn}</h4>
              <p className="text-[11px] text-slate-500">Guaranteed replacement or refund</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Help & Assistance</h4>
              <p className="text-[11px] text-slate-500">Quick order status & resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              <span className="text-amber-500">Rupas</span>.Shop
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Leading affiliate marketing aggregator curating lightning deals, festive discounts, and genuine coupons from Amazon, Flipkart, and Meesho.
            </p>
            <div className="pt-2">
              <button
                onClick={onScrollToTop}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to top</span>
              </button>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Marketplaces
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onSelectPlatform('amazon')} className="hover:text-amber-500 transition-colors cursor-pointer">
                  Amazon Great Deals
                </button>
              </li>
              <li>
                <button onClick={() => onSelectPlatform('flipkart')} className="hover:text-amber-500 transition-colors cursor-pointer">
                  Flipkart Super Offers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectPlatform('meesho')} className="hover:text-amber-500 transition-colors cursor-pointer">
                  Meesho Budget Fashion
                </button>
              </li>
              <li>
                <button onClick={() => onSelectPlatform('all')} className="hover:text-amber-500 transition-colors cursor-pointer">
                  All Featured Products
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={onOpenTracking} className="hover:text-amber-500 transition-colors cursor-pointer">
                  Track Your Shipment
                </button>
              </li>
              <li>
                <a href="#deals" className="hover:text-amber-500 transition-colors">
                  Today's Coupon Codes
                </a>
              </li>
              <li>
                <span className="text-slate-500">Fast Shipping Policy</span>
              </li>
              <li>
                <span className="text-slate-500">Secure Payments Information</span>
              </li>
            </ul>
          </div>

          {/* Admin & Affiliate Disclosure */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Affiliate Transparency
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              As an affiliate partner, we may earn an advertising commission from qualifying purchases made through Amazon, Flipkart, and Meesho links at zero extra cost to you.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} Rupas.Shop. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer">Terms & Conditions</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer">SEO Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

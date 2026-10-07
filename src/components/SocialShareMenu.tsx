import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';

interface SocialShareMenuProps {
  product: Product;
  compact?: boolean;
}

export const SocialShareMenu: React.FC<SocialShareMenuProps> = ({
  product,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct sharing text and URL
  const shareUrl = product.affiliateUrl || window.location.href;
  const shareTitle = `Check out this deal on ${product.title} (${product.discountPercentage}% OFF)!`;
  const whatsappText = `🔥 Special Deal Alert on Rupas.Shop!\n*${product.title}*\n💰 Deal Price: ₹${product.dealPrice.toLocaleString()} (${product.discountPercentage}% OFF)\n👉 Shop Now: ${shareUrl}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#22c55e', '#3b82f6', '#f59e0b']
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleShareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=deals,discounts,RupasShop`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleNativeShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Get ${product.title} at ${product.discountPercentage}% OFF!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {/* Share Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`rounded-full transition-transform active:scale-95 cursor-pointer flex items-center justify-center ${
          compact
            ? 'p-1.5 bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-xs shadow-xs hover:scale-110'
            : 'px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-xs font-semibold gap-1.5'
        }`}
        title="Share Affiliate Link"
        aria-label="Share Deal"
      >
        <Share2 className={compact ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
        {!compact && <span>Share Deal</span>}
      </button>

      {/* Popover Share Dropdown */}
      {isOpen && (
        <>
          {/* Transparent Backdrop to dismiss click outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
          />

          <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 space-y-1 text-xs animate-fadeIn">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Share Deal</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                {/* WhatsApp SVG */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.074-2.148-.521-1.637-.674-2.704-2.316-2.787-2.428-.083-.112-.663-.881-.663-1.679 0-.798.419-1.191.568-1.353.149-.162.325-.203.434-.203.108 0 .216.002.312.007.101.005.237-.038.371.284.144.343.491 1.2.533 1.287.042.086.07.188.012.304-.058.115-.087.188-.173.289-.086.101-.182.226-.26.304-.087.086-.177.181-.076.355.101.173.449.742.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.102-.115.433-.505.549-.679.115-.173.231-.144.39-.086s1.011.477 1.184.563c.173.086.289.13.332.202.043.073.043.419-.101.824z" />
                </svg>
              </div>
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                {/* Facebook SVG */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </div>
              <span>Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              onClick={handleShareTwitter}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                {/* X / Twitter SVG */}
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span>Twitter / X</span>
            </button>

            {/* Copy Link */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Affiliate Link</span>
                </div>
                {copied && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DirectOrder } from '../types';
import { Language, translations } from '../translations';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: DirectOrder[];
  lang: Language;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<DirectOrder | null>(orders[0] || null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return;

    const match = orders.find(
      o => o.id.toLowerCase() === clean || 
           o.trackingNumber.toLowerCase() === clean ||
           o.phone.includes(clean)
    );
    setSearchedOrder(match || null);
  };

  const steps = [
    { key: 'placed', label: t.trackingStep1, desc: 'Received in system' },
    { key: 'confirmed', label: t.trackingStep2, desc: 'Verified and packed' },
    { key: 'shipped', label: t.trackingStep3, desc: 'Handed over to courier' },
    { key: 'out_for_delivery', label: t.trackingStep4, desc: 'Out with delivery agent' },
    { key: 'delivered', label: t.trackingStep5, desc: 'Successfully delivered' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: DirectOrder['orderStatus']) => {
    const orderRanks: Record<string, number> = {
      placed: 0,
      confirmed: 1,
      shipped: 2,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: -1,
    };
    const currentRank = orderRanks[currentStatus] ?? 0;
    const targetRank = orderRanks[stepKey] ?? 0;

    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.trackOrder}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-94812) or Phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
            >
              Track Now
            </button>
          </form>

          {searchedOrder ? (
            <div className="space-y-6">
              {/* Order Meta Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{searchedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tracking Reference</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {searchedOrder.trackingNumber} ({searchedOrder.courierName || 'BlueDart'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Placed On</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(searchedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Delivery To</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {searchedOrder.customerName}, {searchedOrder.city}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Live Dispatch Status
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {steps.map((step) => {
                    const status = getStepStatus(step.key, searchedOrder.orderStatus);
                    return (
                      <div key={step.key} className="relative flex items-start gap-3">
                        <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : status === 'current'
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 dark:ring-amber-950'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${
                            status === 'current' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {step.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Items In Shipment
                </h4>
                <div className="space-y-2">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <img 
                          src={item.imageUrl} 
                          alt={item.productTitle} 
                          className="w-8 h-8 rounded object-cover bg-slate-100" 
                        />
                        <span className="truncate text-slate-800 dark:text-slate-200">{item.productTitle}</span>
                      </div>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white shrink-0">
                        x{item.quantity} · ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No active orders found matching "{searchQuery}". Please check the ID or contact support.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

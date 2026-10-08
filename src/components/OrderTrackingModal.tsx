import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
  Building,
  Calendar
} from 'lucide-react';
import { DirectOrder } from '../types';
import { Language, translations } from '../translations';
import { resolveImageUrl } from '../utils/mediaUtils';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: DirectOrder[];
  lang: Language;
  selectedOrderId?: string | null;
  onSelectOrderId?: (id: string | null) => void;
  onRefreshOrders?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  lang,
  selectedOrderId,
  onSelectOrderId,
  onRefreshOrders,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  // Active selected order ID state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    if (selectedOrderId) return selectedOrderId;
    return orders.length > 0 ? orders[0].id : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with selectedOrderId prop when opened or changed
  useEffect(() => {
    if (selectedOrderId) {
      setActiveOrderId(selectedOrderId);
      setSearchError(null);
    } else if (!activeOrderId && orders.length > 0) {
      setActiveOrderId(orders[0].id);
    }
  }, [selectedOrderId, orders]);

  // Derived active order: ALWAYS in sync with latest orders prop (live updates!)
  const activeOrder = orders.find(o => o.id === activeOrderId) || (orders.length > 0 ? orders[0] : null);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshOrders) {
      onRefreshOrders();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Robust Search handler for Order ID, Tracking Code, Phone number, or Name
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const raw = searchQuery.trim();
    if (!raw) {
      // If user submits empty, reset to the most recent order
      if (orders.length > 0) {
        setActiveOrderId(orders[0].id);
      }
      return;
    }

    const clean = raw.toLowerCase().replace(/^#/, '');
    const cleanDigits = raw.replace(/\D/g, '');

    const match = orders.find(o => {
      const orderIdLower = o.id.toLowerCase();
      const trkLower = o.trackingNumber.toLowerCase();
      const phoneDigits = o.phone.replace(/\D/g, '');
      const custName = o.customerName.toLowerCase();
      const custEmail = o.email.toLowerCase();

      // Check ID (full or numeric part)
      if (orderIdLower === clean || orderIdLower.replace('ord-', '') === clean) return true;
      // Check Tracking
      if (trkLower === clean || trkLower.includes(clean)) return true;
      // Check Phone
      if (cleanDigits && phoneDigits.includes(cleanDigits)) return true;
      // Check Name or Email
      if (custName.includes(clean) || custEmail.includes(clean)) return true;

      return false;
    });

    if (match) {
      setActiveOrderId(match.id);
      if (onSelectOrderId) onSelectOrderId(match.id);
      setSearchError(null);
    } else {
      setSearchError(`No order found matching "${raw}". Check your order ID or phone number.`);
    }
  };

  const selectOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    if (onSelectOrderId) onSelectOrderId(orderId);
    setSearchError(null);
  };

  const steps = [
    { 
      key: 'placed', 
      label: t.trackingStep1, 
      desc: 'Order placed & verified in system',
      icon: Clock,
    },
    { 
      key: 'confirmed', 
      label: t.trackingStep2, 
      desc: 'Order processed & packed at fulfillment center',
      icon: PackageCheck,
    },
    { 
      key: 'shipped', 
      label: t.trackingStep3, 
      desc: activeOrder?.courierName 
        ? `Handed over to ${activeOrder.courierName}` 
        : 'Dispatched via premium courier partner',
      icon: Truck,
    },
    { 
      key: 'out_for_delivery', 
      label: t.trackingStep4, 
      desc: activeOrder?.city 
        ? `Out for delivery with delivery agent in ${activeOrder.city}` 
        : 'Out for delivery to your doorstep',
      icon: MapPin,
    },
    { 
      key: 'delivered', 
      label: t.trackingStep5, 
      desc: 'Package handed over successfully',
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (stepKey: string, currentStatus?: DirectOrder['orderStatus']) => {
    if (!currentStatus) return 'upcoming';
    if (currentStatus === 'cancelled') return 'cancelled';

    const orderRanks: Record<string, number> = {
      placed: 0,
      confirmed: 1,
      shipped: 2,
      out_for_delivery: 3,
      delivered: 4,
    };
    const currentRank = orderRanks[currentStatus] ?? 0;
    const targetRank = orderRanks[stepKey] ?? 0;

    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  // Status badge config
  const getStatusBadge = (status?: DirectOrder['orderStatus']) => {
    switch (status) {
      case 'placed':
        return {
          label: 'Order Placed',
          labelBn: 'অর্ডার সম্পন্ন',
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'confirmed':
        return {
          label: 'Confirmed & Packed',
          labelBn: 'অর্ডার নিশ্চিত ও প্যাকিং',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'shipped':
        return {
          label: 'Shipped · In Transit',
          labelBn: 'শিপিং শুরু · ট্রানজিটে রয়েছে',
          bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dot: 'bg-sky-500',
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery Today',
          labelBn: 'আজকের ডেলিভারি বের হয়েছে',
          bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
        };
      case 'delivered':
        return {
          label: 'Delivered Successfully',
          labelBn: 'ডেলিভারি সম্পন্ন',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          label: 'Order Cancelled',
          labelBn: 'অর্ডার বাতিল হয়েছে',
          bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
          dot: 'bg-red-500',
        };
      default:
        return {
          label: 'Processing',
          labelBn: 'প্রক্রিয়াধীন',
          bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusBadge = getStatusBadge(activeOrder?.orderStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t.trackOrder}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live delivery status & courier tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="Refresh tracking status"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-94812) or Phone"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Now</span>
            </button>
          </form>

          {/* Search Error Notice */}
          {searchError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrderId(orders[0].id);
                    setSearchError(null);
                    setSearchQuery('');
                  }}
                  className="underline font-bold text-[11px] whitespace-nowrap cursor-pointer hover:text-red-800 dark:hover:text-red-200"
                >
                  View Latest Order
                </button>
              )}
            </div>
          )}

          {/* Quick Select Orders Tabs (if multiple orders exist) */}
          {orders.length > 1 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Recent Orders:</span>
                <span className="text-[10px] text-slate-400">Tap to view live status</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {orders.map((o) => {
                  const isSelected = activeOrder?.id === o.id;
                  const b = getStatusBadge(o.orderStatus);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => selectOrder(o.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-mono">{o.id}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                      <span className="text-[10px] capitalize opacity-80">{o.orderStatus.replace(/_/g, ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeOrder ? (
            <div className="space-y-5">
              {/* Live Status Highlight Card */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      #{activeOrder.id}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusBadge.bg}`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${statusBadge.dot}`} />
                    <span>{lang === 'bn' ? statusBadge.labelBn : statusBadge.label}</span>
                  </div>
                </div>

                {/* Tracking & Courier Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Courier Partner & Tracking:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {activeOrder.courierName || 'BlueDart Express'}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {activeOrder.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(activeOrder.trackingNumber)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy tracking number"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Delivery Location:</span>
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5" title={`${activeOrder.address}, ${activeOrder.city}`}>
                      {activeOrder.customerName} · {activeOrder.city} ({activeOrder.postalCode})
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancelled Banner if status === 'cancelled' */}
              {activeOrder.orderStatus === 'cancelled' ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Order Cancelled</span>
                  </div>
                  <p className="text-red-600 dark:text-red-400 text-[11px]">
                    This order was cancelled. If a refund was applicable, it will reflect within 3-5 business days.
                  </p>
                </div>
              ) : (
                /* Live Dispatch Progress Timeline */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Live Dispatch Timeline
                    </h4>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Updates Active
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {steps.map((step) => {
                      const status = getStepStatus(step.key, activeOrder.orderStatus);
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="relative flex items-start gap-3">
                          <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            status === 'completed'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : status === 'current'
                              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}>
                            {status === 'completed' ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : status === 'current' ? (
                              <div className="w-2 h-2 rounded-full bg-slate-950" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${
                                status === 'current'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : status === 'completed'
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}>
                                {step.label}
                              </span>
                              {status === 'current' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items in Shipment */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Items in Shipment ({activeOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {activeOrder.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <img 
                          src={resolveImageUrl(item.imageUrl, 'earbuds')} 
                          alt={item.productTitle} 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80';
                          }}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/50 dark:border-slate-700/50" 
                        />
                        <div className="truncate">
                          <span className="truncate block font-semibold text-slate-800 dark:text-slate-200">
                            {item.productTitle}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Qty: {item.quantity} · Price: ₹{item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Placed Date & Support guarantee */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Placed: {new Date(activeOrder.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Purchase</span>
                </div>
              </div>
            </div>
          ) : (
            /* No Orders in system */
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  No Active Shipments Found
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Place an order from our direct checkout deals or search with your Order ID to track here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

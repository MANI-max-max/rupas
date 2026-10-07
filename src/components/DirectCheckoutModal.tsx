import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Truck,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, DirectOrder } from '../types';
import { Language, translations } from '../translations';

interface DirectCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  lang: Language;
  onOrderSuccess: (order: DirectOrder) => void;
}

export const DirectCheckoutModal: React.FC<DirectCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  lang,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const totalAmount = cartItems.reduce((acc, item) => acc + item.product.dealPrice * item.quantity, 0);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'upi' as 'upi' | 'cod' | 'card' | 'netbanking',
  });

  // Card details state if card chosen
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<DirectOrder | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.email || !formData.address) {
      setFormError('Please fill in all required shipping fields.');
      return;
    }

    if (formData.paymentMethod === 'card' && (!cardData.number || !cardData.expiry || !cardData.cvv)) {
      setFormError('Please enter valid credit/debit card information.');
      return;
    }

    setFormError('');
    setIsProcessing(true);

    // Simulate realistic secure payment processing gateway
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingNumber = `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newOrder: DirectOrder = {
        id: orderId,
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city || 'Kolkata',
        postalCode: formData.postalCode || '700001',
        items: cartItems.map(item => ({
          productId: item.product.id,
          productTitle: item.product.title,
          quantity: item.quantity,
          price: item.product.dealPrice,
          imageUrl: item.product.imageUrl,
        })),
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
        trackingNumber,
        courierName: 'Express Courier Services',
        createdAt: new Date().toISOString(),
      };

      setIsProcessing(false);
      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);

      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 }
      });
    }, 1400);
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard.writeText(trackNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {completedOrder ? t.orderSuccess : 'Secure Checkout & Payment'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Order Success View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t.orderSuccess}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Confirmation email automatically sent to <strong className="text-slate-800 dark:text-slate-200">{completedOrder.email}</strong>
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tracking Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{completedOrder.trackingNumber}</span>
                    <button
                      onClick={() => handleCopyTracking(completedOrder.trackingNumber)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Tracking Number"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{completedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{completedOrder.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-right">{completedOrder.address}, {completedOrder.city}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                >
                  Back to Deals
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {formError && (
                <div className="p-3 text-xs bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Items Summary Strip */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">{cartItems.length} item(s) selected</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {cartItems.map(i => `${i.product.title} (x${i.quantity})`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</span>
                  <div className="font-bold text-base text-slate-900 dark:text-white tabular-nums">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  1. Shipping Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.phoneNumber} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.emailAddress} (For order tracking & invoice) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.shippingAddress} *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat No, Street, Landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Kolkata / Mumbai / Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="700001"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  2. Select Payment Method
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.paymentMethod === 'upi'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <div className="text-xs font-bold">UPI / QR</div>
                    <div className="text-[10px] text-slate-500">GPay, PhonePe</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-xs font-bold">Cards</div>
                    <div className="text-[10px] text-slate-500">Debit / Credit</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <div className="text-xs font-bold">COD</div>
                    <div className="text-[10px] text-slate-500">Pay on Delivery</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'netbanking' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.paymentMethod === 'netbanking'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                    <div className="text-xs font-bold">Net Banking</div>
                    <div className="text-[10px] text-slate-500">All Banks</div>
                  </button>
                </div>

                {/* Card input fields when card selected */}
                {formData.paymentMethod === 'card' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8842"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI QR preview when UPI selected */}
                {formData.paymentMethod === 'upi' && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                    <div className="text-xs text-amber-900 dark:text-amber-200">
                      <strong>Instant UPI Verification:</strong> You can pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM) upon placing order.
                    </div>
                    <div className="shrink-0 p-1 bg-white rounded border border-amber-200">
                      <QrCode className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Verifying Secure Gateway...</span>
                  ) : (
                    <>
                      <span>{t.placeOrder} (₹{totalAmount.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>256-bit SSL Encrypted & Protected Checkout</span>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

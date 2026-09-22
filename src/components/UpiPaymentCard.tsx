import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface UpiPaymentCardProps {
  amount: number;
  totalTariff: number;
  bookingRef?: string;
  isPartPayment?: boolean;
  onPaymentTypeChange?: (type: 'partial' | 'full', advanceAmount: number) => void;
  utrNumber: string;
  onUtrChange: (utr: string) => void;
  selectedUpiApp: string;
  onSelectUpiApp: (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi') => void;
}

export const UpiPaymentCard: React.FC<UpiPaymentCardProps> = ({
  amount,
  totalTariff,
  bookingRef = 'NEW-STAY',
  isPartPayment = false,
  onPaymentTypeChange,
  utrNumber,
  onUtrChange,
  selectedUpiApp,
  onSelectUpiApp,
}) => {
  const [copied, setCopied] = useState(false);
  const upiId = 'cloudheavenresort@okaxis';
  const payeeName = 'Cloud Heaven Vagamon';

  // Deep link for mobile UPI apps
  const note = `Booking-${bookingRef}`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Dynamic QR code URL via free QR server
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUrl
  )}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateUtr = () => {
    const random12 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    onUtrChange(random12);
  };

  return (
    <div className="space-y-4">
      {/* Part Payment vs Full Payment Selector if toggleable */}
      {onPaymentTypeChange && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Payment Terms
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
              Zero Convenience Fee
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Part payment option */}
            <div
              onClick={() => onPaymentTypeChange('partial', Math.round(totalTariff * 0.4))}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                isPartPayment
                  ? 'bg-white border-emerald-800 shadow-sm'
                  : 'bg-white/60 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-xs text-gray-900 flex items-center gap-1">
                    <span>Pay 40% Advance Now</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                      Popular
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Pay ₹{Math.round(totalTariff * 0.4).toLocaleString()} to confirm; balance ₹{Math.round(totalTariff * 0.6).toLocaleString()} at check-in.
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isPartPayment ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-gray-300'
                  }`}
                >
                  {isPartPayment && <Check className="w-2.5 h-2.5" />}
                </div>
              </div>
            </div>

            {/* Full payment option */}
            <div
              onClick={() => onPaymentTypeChange('full', totalTariff)}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                !isPartPayment
                  ? 'bg-white border-emerald-800 shadow-sm'
                  : 'bg-white/60 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-xs text-gray-900">Pay Full Amount (100%)</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Pay ₹{totalTariff.toLocaleString()} now. Nothing to pay on arrival.
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    !isPartPayment ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-gray-300'
                  }`}
                >
                  {!isPartPayment && <Check className="w-2.5 h-2.5" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UPI Payment Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Direct UPI Gateway
              </span>
              <span className="text-xs font-semibold text-gray-600">Scan &amp; Pay</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mt-1">
              Pay ₹{amount.toLocaleString()} via any UPI App
            </h4>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Payable Amount
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-900">
              ₹{amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* QR Code and Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Code Visual Box */}
          <div className="flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200 rounded-2xl">
            <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
              <img
                src={qrCodeUrl}
                alt="Cloud Heaven UPI QR Code"
                className="w-48 h-48 rounded-xl object-contain"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="bg-emerald-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                  BHIM &bull; UPI
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-medium mt-3 text-center">
              Scan with GPay, PhonePe, Paytm, BHIM, or any banking app
            </p>
          </div>

          {/* UPI ID & App Launchers */}
          <div className="space-y-4">
            {/* Copyable UPI ID Box */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Official Resort UPI ID (VPA)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs font-bold text-gray-900 truncate">
                  {upiId}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick App Selectors */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Your UPI Provider:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'gpay', name: 'GPay', color: 'text-blue-600' },
                  { id: 'phonepe', name: 'PhonePe', color: 'text-purple-600' },
                  { id: 'paytm', name: 'Paytm', color: 'text-cyan-600' },
                  { id: 'bhim', name: 'BHIM', color: 'text-emerald-700' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onSelectUpiApp(app.id as any)}
                    className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedUpiApp === app.id
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Open UPI Link (works on mobile phones/tablets) */}
            <div>
              <a
                href={upiUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open UPI App on this Device</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* UTR / Transaction Reference Input */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>12-Digit UPI Transaction ID / UTR</span>
            </label>
            <button
              type="button"
              onClick={handleSimulateUtr}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              Demo: Auto-fill Sample UTR
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. 423891028374 (From your UPI payment receipt)"
              value={utrNumber}
              onChange={(e) => onUtrChange(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-gray-500">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span>
              After approving the payment in your UPI app, enter the 12-digit UTR/Ref number shown on the receipt for instant automatic confirmation.
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-gray-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Direct Bank Settlement to Official Resort Current Account</span>
          </div>
          <span className="font-semibold text-emerald-900">Axis Bank &bull; Cloud Heaven Resorts</span>
        </div>
      </div>
    </div>
  );
};

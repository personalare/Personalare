import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { AVAILABLE_ADDONS } from '../data/mockData';
import { Booking, BookingAddon } from '../types';

interface AdminOfflineBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: Booking) => void;
}

export const AdminOfflineBookingModal: React.FC<AdminOfflineBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  const villa = StorageService.getVillaDetails();
  const existingBookings = StorageService.getBookings();
  const blockedDates = StorageService.getBlockedDates();

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Stay details
  const [villaType, setVillaType] = useState<'2bhk' | '3bhk'>('2bhk');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<BookingAddon[]>([]);

  // Pricing & Part payment
  const defaultRate = villaType === '3bhk' ? (villa.bhk3Price || 11000) : (villa.bhk2Price || 8000);
  const [customRatePerNight, setCustomRatePerNight] = useState<number>(defaultRate);
  const [isCustomRate, setIsCustomRate] = useState(false);

  const [paymentType, setPaymentType] = useState<'partial' | 'full' | 'pending'>('partial');
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'bank_transfer' | 'card'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi'>('gpay');
  const [referenceId, setReferenceId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update rate per night when villa type changes if not custom
  React.useEffect(() => {
    if (!isCustomRate) {
      setCustomRatePerNight(villaType === '3bhk' ? (villa.bhk3Price || 11000) : (villa.bhk2Price || 8000));
    }
  }, [villaType, isCustomRate, villa.bhk3Price, villa.bhk2Price]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate + 'T00:00:00');
    const end = new Date(checkOutDate + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkInDate, checkOutDate]);

  // Check date conflicts
  const dateConflict = useMemo(() => {
    if (!checkInDate || !checkOutDate || nights <= 0) return null;

    // Check blocked dates
    for (const b of blockedDates) {
      if (b.date >= checkInDate && b.date < checkOutDate) {
        return `Date ${b.date} is blocked in calendar (${b.reason})`;
      }
    }

    // Check confirmed bookings
    for (const b of existingBookings) {
      if (b.status === 'cancelled') continue;
      // Overlap condition: start < b.end and end > b.start
      if (checkInDate < b.checkOutDate && checkOutDate > b.checkInDate) {
        return `Dates overlap with existing booking #${b.id} (${b.userName} from ${b.checkInDate} to ${b.checkOutDate})`;
      }
    }

    return null;
  }, [checkInDate, checkOutDate, nights, blockedDates, existingBookings]);

  // Financial calculations
  const baseTotal = nights * customRatePerNight;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = baseTotal + addonsTotal;
  const taxRate = villa.taxRatePercent || 12;
  const taxes = Math.round((subtotal * taxRate) / 100);
  const grandTotal = subtotal + taxes;

  // Sync advance amount when switching payment type or grandTotal
  React.useEffect(() => {
    if (paymentType === 'full') {
      setAdvanceAmount(grandTotal);
    } else if (paymentType === 'pending') {
      setAdvanceAmount(0);
    } else if (paymentType === 'partial') {
      // Default to 50% rounded
      const half = Math.round(grandTotal * 0.5);
      if (advanceAmount > grandTotal || advanceAmount === 0) {
        setAdvanceAmount(half > 0 ? half : 5000);
      }
    }
  }, [paymentType, grandTotal]);

  const balanceDue = Math.max(0, grandTotal - advanceAmount);

  const toggleAddon = (addon: BookingAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handlePresetAdvance = (pct: number) => {
    const val = Math.round((grandTotal * pct) / 100);
    setAdvanceAmount(val);
    setPaymentType('partial');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!guestName.trim()) {
      setError('Please enter guest full name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile / WhatsApp number.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setError('Please enter a valid guest email address.');
      return;
    }
    if (!checkInDate || !checkOutDate || nights <= 0) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }
    if (dateConflict) {
      setError(dateConflict);
      return;
    }
    if (advanceAmount > grandTotal) {
      setError('Advance payment cannot exceed the grand total amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentStatus: Booking['paymentStatus'] =
        advanceAmount >= grandTotal ? 'paid' : advanceAmount > 0 ? 'partially_paid' : 'pending';

      const paymentNotes = adminNotes.trim()
        ? adminNotes.trim()
        : paymentStatus === 'partially_paid'
        ? `Advance of ₹${advanceAmount.toLocaleString()} received via ${paymentMode.toUpperCase()}. Balance ₹${balanceDue.toLocaleString()} due on arrival.`
        : `Full payment of ₹${grandTotal.toLocaleString()} collected offline via ${paymentMode.toUpperCase()}.`;

      const newBooking = StorageService.createBooking({
        userId: `usr_offline_${Date.now()}`,
        userName: guestName.trim(),
        userEmail: guestEmail.trim().toLowerCase(),
        userPhone: guestPhone.trim(),
        villaType,
        villaTypeLabel:
          villaType === '3bhk'
            ? '3 BHK Luxury Villa (Up to 12 Pax)'
            : '2 BHK Luxury Villa (Up to 9 Pax)',
        checkInDate,
        checkOutDate,
        checkInTime: villa.checkInTime || '2:00 PM',
        checkOutTime: villa.checkOutTime || '11:00 AM',
        guests: { adults, children },
        totalNights: nights,
        basePricePerNight: customRatePerNight,
        addons: selectedAddons,
        totalAmount: subtotal,
        taxAmount: taxes,
        finalAmount: grandTotal,
        status: 'confirmed',
        specialRequests: specialRequests.trim() || (guestCity ? `Guest from ${guestCity}` : undefined),
        bookingSource: 'offline_admin',
        paymentMode,
        paymentStatus,
        advancePaid: advanceAmount,
        balanceAmount: balanceDue,
        upiTransactionId: referenceId.trim() || undefined,
        upiApp: paymentMode === 'upi' ? upiApp : undefined,
        paymentNotes,
      });

      onBookingCreated(newBooking);
      onClose();
    } catch (err: any) {
      console.error('Failed to create offline booking:', err);
      setError(err?.message || 'Failed to save offline booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative z-10 w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-700/60 rounded text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                  Admin Portal
                </span>
                <span className="text-xs text-emerald-200 font-medium">Offline Direct Booking</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                Create Offline Booking &amp; Part Payment
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            {dateConflict && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Booking Conflict Detected:</strong>
                  <span>{dateConflict}</span>
                </div>
              </div>
            )}

            {/* Step 1: Guest Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-4 h-4 text-emerald-800" />
                <h3 className="font-serif text-base font-bold text-gray-900">
                  1. Guest Identification Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Lead Guest Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Krishnan"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mobile / WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address (For Voucher) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ramesh@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    City / Origin (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Kochi, Chennai"
                    value={guestCity}
                    onChange={(e) => setGuestCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Special Requests / Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Birthday anniversary decoration, pool towels, late arrival at 5 PM"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Villa Type & Dates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <CalendarIcon className="w-4 h-4 text-emerald-800" />
                <h3 className="font-serif text-base font-bold text-gray-900">
                  2. Accommodation &amp; Stay Schedule
                </h3>
              </div>

              {/* Villa Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setVillaType('2bhk')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    villaType === '2bhk'
                      ? 'border-emerald-800 bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-serif text-sm font-bold text-gray-900">
                        2 BHK Luxury Villa
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Capacity: Up to 9 Guests &bull; Heated Pool
                      </div>
                    </div>
                    <span className="font-serif font-bold text-emerald-900 text-sm">
                      ₹{(villa.bhk2Price || 8000).toLocaleString()} <span className="text-[10px] font-normal text-gray-500">/nt</span>
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setVillaType('3bhk')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    villaType === '3bhk'
                      ? 'border-emerald-800 bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-serif text-sm font-bold text-gray-900">
                        3 BHK Luxury Villa
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Capacity: Up to 12 Guests &bull; Panoramic Deck
                      </div>
                    </div>
                    <span className="font-serif font-bold text-emerald-900 text-sm">
                      ₹{(villa.bhk3Price || 11000).toLocaleString()} <span className="text-[10px] font-normal text-gray-500">/nt</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Check-In Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 font-medium">Check-In: 2:00 PM</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Check-Out Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 font-medium">Check-Out: 11:00 AM</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Adults (12+ yrs)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-gray-900">{adults}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAdults((prev) =>
                          Math.min(villaType === '3bhk' ? 12 : 9, prev + 1)
                        )
                      }
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Children (0-11 yrs)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-gray-900">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren((prev) => Math.min(6, prev + 1))}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Addons Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Optional Experiences &amp; Add-ons
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-800 text-emerald-950 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono font-semibold">+₹{addon.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Tariff & Part Payment Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-800" />
                  <h3 className="font-serif text-base font-bold text-gray-900">
                    3. Tariff, Part Payment &amp; Balance Due
                  </h3>
                </div>
                <div className="text-xs font-bold text-emerald-800">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} Selected
                </div>
              </div>

              {/* Rate Override Option */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-900">Nightly Tariff Rate</div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    Default: ₹{defaultRate.toLocaleString()} / night
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">₹</span>
                  <input
                    type="number"
                    value={customRatePerNight}
                    onChange={(e) => {
                      setIsCustomRate(true);
                      setCustomRatePerNight(Number(e.target.value));
                    }}
                    className="w-28 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                  <span className="text-xs text-gray-500">/ night</span>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Base Accommodation ({nights} nights &times; ₹{customRatePerNight.toLocaleString()})
                  </span>
                  <span className="font-semibold text-gray-900">₹{baseTotal.toLocaleString()}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Add-on Experiences ({selectedAddons.length})</span>
                    <span className="font-semibold text-gray-900">+ ₹{addonsTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Resort Tax &amp; GST ({taxRate}%)</span>
                  <span className="font-semibold text-gray-900">+ ₹{taxes.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
                  <span>Grand Total Tariff:</span>
                  <span className="font-serif text-lg text-emerald-950">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Part Payment Controls */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/60 to-teal-50/60 border border-emerald-200 rounded-3xl space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Payment Terms &amp; Advance Collection
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Choose whether the guest is paying part advance or the full amount now.
                  </p>
                </div>

                {/* Payment Option Tabs */}
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentType('partial')}
                    className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentType === 'partial'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Part Payment (Advance)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentType === 'full'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Full Payment (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('pending')}
                    className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                      paymentType === 'pending'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Pay at Check-In (₹0 Now)
                  </button>
                </div>

                {paymentType === 'partial' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-800">Quick Advance Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePresetAdvance(25)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-900 cursor-pointer"
                        >
                          25% (₹{Math.round(grandTotal * 0.25).toLocaleString()})
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetAdvance(50)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-900 cursor-pointer"
                        >
                          50% (₹{Math.round(grandTotal * 0.5).toLocaleString()})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvanceAmount(5000)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-900 cursor-pointer"
                        >
                          ₹5,000 Token
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                          Advance Amount Collected (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={grandTotal}
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                      </div>

                      <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl">
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Remaining Balance Due on Check-In
                        </div>
                        <div className="font-serif text-xl font-bold text-amber-950 mt-0.5">
                          ₹{balanceDue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-amber-700 font-medium">
                          Collectable by Caretaker at villa gate
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method & UTR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    >
                      <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                      <option value="cash">Direct Cash</option>
                      <option value="bank_transfer">Bank Transfer / NEFT / IMPS</option>
                      <option value="card">Card / POS Terminal</option>
                    </select>
                  </div>

                  {paymentMode === 'upi' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                        UPI App
                      </label>
                      <select
                        value={upiApp}
                        onChange={(e) => setUpiApp(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                      >
                        <option value="gpay">Google Pay (GPay)</option>
                        <option value="phonepe">PhonePe</option>
                        <option value="paytm">Paytm</option>
                        <option value="bhim">BHIM UPI</option>
                        <option value="other_upi">Other UPI / QR Code</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                      Transaction Ref / UTR / Receipt #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 423819283719 or CASH-01"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    Internal Admin Payment Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guest paid via GPay from mobile ending in 4210. Remaining balance to be paid via cash upon arrival."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* Email Dispatch Checkbox */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendConfirmationEmail}
                onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-800 border-gray-300 cursor-pointer"
              />
              <label htmlFor="sendEmail" className="text-xs text-gray-700 cursor-pointer">
                <strong className="text-gray-900 font-bold block">
                  Send Instant Confirmation Email &amp; Voucher to Guest
                </strong>
                Will automatically dispatch official confirmation with check-in schedule, balance due, and Caretaker Babu contact.
              </label>
            </div>
          </form>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Tariff: ₹{grandTotal.toLocaleString()}
              </div>
              <div className="text-base font-bold text-gray-900">
                Advance: <span className="text-emerald-800">₹{advanceAmount.toLocaleString()}</span>
                {balanceDue > 0 && (
                  <span className="text-xs text-amber-700 font-medium ml-2">
                    (Balance Due: ₹{balanceDue.toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !!dateConflict}
                className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Booking...' : 'Confirm Offline Booking'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Gift,
  Tag,
  CloudFog,
  CloudRain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { AVAILABLE_ADDONS } from '../data/mockData';
import { Booking, BookingAddon } from '../types';
import { UpiPaymentCard } from './UpiPaymentCard';
import { detectVagamonSeasons } from '../utils/vagamonSeasons';
import { SeasonAlertCard } from './SeasonAlertCard';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onBookingSuccess: (booking: Booking) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialVillaType?: '2bhk' | '3bhk';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onBookingSuccess,
  initialCheckIn,
  initialCheckOut,
  initialVillaType,
}) => {
  const { currentUser } = useAuth();
  const villa = StorageService.getVillaDetails();
  const blockedDatesList = StorageService.getBlockedDates();
  const bookingsList = StorageService.getBookings();

  // Calendar month state (defaults to current month or August 2026)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || '');
  const [villaType, setVillaType] = useState<'2bhk' | '3bhk'>(initialVillaType || '2bhk');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<BookingAddon[]>([]);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'dates' | 'customize' | 'review'>('dates');
  const [promoCode, setPromoCode] = useState<string>('MIST15');
  const [appliedPromo, setAppliedPromo] = useState<string | null>('MIST15');
  const [promoMessage, setPromoMessage] = useState<string | null>('15% Seasonal Discount Applied!');

  // Friend Referral System states
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');
  const [appliedReferral, setAppliedReferral] = useState<{
    code: string;
    referrerName: string;
    referrerUserId: string;
    discountAmount: number;
    pointsAwarded: number;
  } | null>(null);
  const [referralMessage, setReferralMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Auto-detect referral code from URL query parameter (?ref=NAME-CHV or ?referral=...)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref') || params.get('referral');
        if (refParam && !appliedReferral) {
          const cleanRef = refParam.trim().toUpperCase();
          setReferralCodeInput(cleanRef);
          const res = StorageService.validateReferralCode(
            cleanRef,
            currentUser?.id,
            currentUser?.email
          );
          if (res.valid && res.referrer) {
            setAppliedReferral({
              code: cleanRef,
              referrerName: res.referrer.name,
              referrerUserId: res.referrer.id,
              discountAmount: res.discountAmount,
              pointsAwarded: res.pointsAwarded,
            });
            setReferralMessage({
              text: `Referral applied from ${res.referrer.name}! You get ₹${res.discountAmount.toLocaleString()} off your first stay, and ${res.referrer.name} earns +500 loyalty points!`,
              isError: false,
            });
          }
        }
      } catch (err) {
        console.warn('Could not parse referral param:', err);
      }
    }
  }, [currentUser]);

  // Payment states (Part payment vs Full payment via UPI)
  const [isPartPayment, setIsPartPayment] = useState<boolean>(true);
  const [customAdvance, setCustomAdvance] = useState<number | null>(null);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<
    'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi'
  >('gpay');

  const currentRatePerNight = villaType === '3bhk' ? (villa.bhk3Price || 11000) : (villa.bhk2Price || 8000);
  const currentMaxGuests = villaType === '3bhk' ? (villa.bhk3MaxGuests || 12) : (villa.bhk2MaxGuests || 9);

  // Auto adjust guests if changing to 2BHK when count exceeds 9
  React.useEffect(() => {
    if (adults + children > currentMaxGuests) {
      if (adults > currentMaxGuests) {
        setAdults(currentMaxGuests);
        setChildren(0);
      } else {
        setChildren(Math.max(0, currentMaxGuests - adults));
      }
    }
  }, [villaType, currentMaxGuests, adults, children]);

  // Sync initial dates and villa type when modal is triggered
  React.useEffect(() => {
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    if (initialVillaType) setVillaType(initialVillaType);
  }, [initialCheckIn, initialCheckOut, initialVillaType, isOpen]);

  // Automated Vagamon Seasonal Notification Alert state
  const [seasonAlertAcknowledged, setSeasonAlertAcknowledged] = useState<boolean>(false);
  const [livePrecipitation, setLivePrecipitation] = useState<number | undefined>(undefined);

  // Sync live precipitation forecast if check-in is within next 7 days
  React.useEffect(() => {
    if (!checkIn) {
      setLivePrecipitation(undefined);
      return;
    }
    try {
      const inDate = new Date(checkIn + 'T00:00:00');
      const now = new Date();
      const diffDays = Math.ceil((inDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=9.6854&longitude=76.9056&daily=precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=8'
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (
              data?.daily?.precipitation_probability_max &&
              diffDays < data.daily.precipitation_probability_max.length
            ) {
              setLivePrecipitation(data.daily.precipitation_probability_max[diffDays]);
            }
          })
          .catch(() => {});
      } else {
        setLivePrecipitation(undefined);
      }
    } catch {
      // fallback
    }
  }, [checkIn]);

  // Compute automated Vagamon seasonal notification alert
  const seasonAlert = useMemo(() => {
    return detectVagamonSeasons(checkIn, checkOut, livePrecipitation);
  }, [checkIn, checkOut, livePrecipitation]);

  // Reset acknowledgment if dates change
  React.useEffect(() => {
    setSeasonAlertAcknowledged(false);
  }, [checkIn, checkOut]);

  // Format Helper: YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date availability checker
  const getDateStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    if (target < today) {
      return { available: false, status: 'past', label: 'Past Date' };
    }

    const blocked = blockedDatesList.find((b) => b.date === dateStr);
    if (blocked) {
      return { available: false, status: 'blocked', label: `Blocked: ${blocked.reason}` };
    }

    for (const b of bookingsList) {
      if (b.status === 'cancelled') continue;
      if (dateStr >= b.checkInDate && dateStr < b.checkOutDate) {
        return { available: false, status: 'booked', label: 'Reserved by Guest' };
      }
    }

    return { available: true, status: 'available', label: 'Available' };
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Days in current month grid
  const daysInMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // empty prefix padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = formatDateKey(dateObj);
      const { available, status, label } = getDateStatus(dateKey);
      days.push({
        dayNumber: d,
        dateKey,
        dateObj,
        available,
        status,
        label,
      });
    }
    return days;
  }, [currentMonthDate, blockedDatesList, bookingsList]);

  // Click on a calendar day
  const handleDateClick = (dateKey: string, available: boolean) => {
    if (!available) return;
    setError(null);

    if (!checkIn || (checkIn && checkOut)) {
      // First click selects Check-in
      setCheckIn(dateKey);
      setCheckOut('');
    } else if (checkIn && !checkOut) {
      // Second click selects Check-out
      if (dateKey <= checkIn) {
        // Reset to new checkIn
        setCheckIn(dateKey);
        setCheckOut('');
      } else {
        // Verify all intervening dates are available
        const start = new Date(checkIn + 'T00:00:00');
        const end = new Date(dateKey + 'T00:00:00');
        let hasConflict = false;

        const cur = new Date(start);
        while (cur < end) {
          const k = formatDateKey(cur);
          const st = getDateStatus(k);
          if (!st.available) {
            hasConflict = true;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasConflict) {
          setError('Selected range includes unavailable or blocked dates. Please pick another range.');
        } else {
          setCheckOut(dateKey);
        }
      }
    }
  };

  // Calculate pricing breakdown
  const pricing = useMemo(() => {
    if (!checkIn || !checkOut) {
      return { nights: 0, baseTotal: 0, addonsTotal: 0, discount: 0, taxes: 0, grandTotal: 0 };
    }

    const start = new Date(checkIn + 'T00:00:00');
    const end = new Date(checkOut + 'T00:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) return { nights: 0, baseTotal: 0, addonsTotal: 0, discount: 0, taxes: 0, grandTotal: 0 };

    let baseTotal = 0;
    const cur = new Date(start);
    for (let i = 0; i < nights; i++) {
      baseTotal += currentRatePerNight;
      cur.setDate(cur.getDate() + 1);
    }

    const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);

    // Calculate Promo Discount
    let discount = 0;
    if (appliedPromo === 'MIST15' && nights >= 2) {
      discount = Math.round(baseTotal * 0.15);
    } else if (appliedPromo === 'EARLYBIRD' || appliedPromo === 'WELCOME10') {
      discount = Math.round(baseTotal * 0.10);
    } else if (appliedPromo) {
      const voucherRes = StorageService.validateLoyaltyVoucher(appliedPromo);
      if (voucherRes.valid) {
        discount = Math.min(baseTotal, voucherRes.discountAmount);
      }
    }

    // Calculate Referral Discount (₹1,000 off 1st stay)
    const referralDiscount = appliedReferral ? Math.min(baseTotal - discount, appliedReferral.discountAmount) : 0;
    const totalDiscount = discount + referralDiscount;

    const subtotal = Math.max(0, baseTotal - totalDiscount) + addonsTotal;
    const taxes = Math.round((subtotal * villa.taxRatePercent) / 100);
    const grandTotal = subtotal + taxes;

    return {
      nights,
      baseTotal,
      addonsTotal,
      discount,
      referralDiscount,
      totalDiscount,
      taxes,
      grandTotal,
    };
  }, [checkIn, checkOut, selectedAddons, villa, appliedPromo, appliedReferral, currentRatePerNight]);

  // Compute effective advance and balance due
  const effectiveAdvance = useMemo(() => {
    if (!isPartPayment) return pricing.grandTotal;
    if (customAdvance !== null && customAdvance > 0 && customAdvance <= pricing.grandTotal) {
      return customAdvance;
    }
    return Math.round(pricing.grandTotal * 0.4);
  }, [isPartPayment, customAdvance, pricing.grandTotal]);

  const balanceDue = Math.max(0, pricing.grandTotal - effectiveAdvance);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      setPromoMessage(null);
      return;
    }

    if (code === 'MIST15') {
      if (pricing.nights < 2 && pricing.nights > 0) {
        setAppliedPromo(null);
        setPromoMessage('MIST15 requires a minimum stay of 2 nights.');
      } else {
        setAppliedPromo('MIST15');
        setPromoCode('MIST15');
        setPromoMessage('15% Seasonal Discount Applied!');
      }
    } else if (code === 'EARLYBIRD' || code === 'WELCOME10') {
      setAppliedPromo(code);
      setPromoCode(code);
      setPromoMessage('10% Early-Bird Discount Applied!');
    } else {
      const voucherRes = StorageService.validateLoyaltyVoucher(code);
      if (voucherRes.valid) {
        setAppliedPromo(code);
        setPromoCode(code);
        setPromoMessage(`₹${voucherRes.discountAmount.toLocaleString()} Loyalty Rewards Discount Applied!`);
      } else {
        setAppliedPromo(null);
        setPromoMessage(voucherRes.message || 'Invalid promo code or loyalty voucher.');
      }
    }
  };

  const handleApplyReferral = () => {
    if (!referralCodeInput.trim()) {
      setReferralMessage({ text: 'Please enter a referral code.', isError: true });
      return;
    }
    const res = StorageService.validateReferralCode(
      referralCodeInput,
      currentUser?.id,
      currentUser?.email
    );
    if (res.valid && res.referrer) {
      setAppliedReferral({
        code: referralCodeInput.trim().toUpperCase(),
        referrerName: res.referrer.name,
        referrerUserId: res.referrer.id,
        discountAmount: res.discountAmount,
        pointsAwarded: res.pointsAwarded,
      });
      setReferralMessage({ text: res.message, isError: false });
    } else {
      setAppliedReferral(null);
      setReferralMessage({ text: res.message || 'Invalid referral code.', isError: true });
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralCodeInput('');
    setReferralMessage(null);
  };

  const toggleAddon = (addon: BookingAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleConfirmBooking = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!checkIn || !checkOut || pricing.nights <= 0) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }

    const paymentStatus = effectiveAdvance >= pricing.grandTotal ? 'paid' : 'partially_paid';
    const paymentNotes = isPartPayment
      ? `Website Booking: Advance of ₹${effectiveAdvance.toLocaleString()} paid via UPI (${selectedUpiApp.toUpperCase()}). Balance of ₹${balanceDue.toLocaleString()} due at check-in.`
      : `Website Booking: Full payment of ₹${pricing.grandTotal.toLocaleString()} completed via UPI (${selectedUpiApp.toUpperCase()}).`;

    const newBooking = StorageService.createBooking({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      villaType,
      villaTypeLabel:
        villaType === '3bhk'
          ? '3 BHK Luxury Villa (Up to 12 Pax)'
          : '2 BHK Luxury Villa (Up to 9 Pax)',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      checkInTime: villa.checkInTime, // "2:00 PM"
      checkOutTime: villa.checkOutTime, // "11:00 AM"
      guests: { adults, children },
      totalNights: pricing.nights,
      basePricePerNight: currentRatePerNight,
      addons: selectedAddons,
      totalAmount: pricing.baseTotal + pricing.addonsTotal,
      taxAmount: pricing.taxes,
      finalAmount: pricing.grandTotal,
      status: 'confirmed',
      specialRequests: specialRequests.trim() || undefined,
      bookingSource: 'website',
      paymentMode: 'upi',
      advancePaid: effectiveAdvance,
      balanceAmount: balanceDue,
      paymentStatus,
      upiTransactionId: utrNumber.trim() || undefined,
      upiApp: selectedUpiApp,
      paymentNotes,
      // Referral system fields
      referralCode: appliedReferral?.code,
      referredByUserId: appliedReferral?.referrerUserId,
      referralDiscountAmount: appliedReferral?.discountAmount,
      referralRewardPointsEarned: appliedReferral?.pointsAwarded,
      // Vagamon Seasonal Advisory Record
      seasonalAdvisory: seasonAlert ? `${seasonAlert.title} (${seasonAlert.badge})` : undefined,
      seasonType: seasonAlert?.type,
    });

    // If a loyalty voucher was applied, mark it used
    if (appliedPromo) {
      StorageService.markLoyaltyVoucherUsed(appliedPromo, newBooking.id);
    }

    onBookingSuccess(newBooking);
    onClose();
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
          className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-3xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] mx-2 sm:mx-auto"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                  Reserve The Villa
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-500 font-medium">Private Pool Estate</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                Cloud Heaven, Vagamon
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Time notice banner: 2 PM Check-in, 11 AM Check-out */}
          <div className="bg-emerald-950 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2 sm:gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>
                Standard Timings: <strong>Check-in at 2:00 PM</strong> &bull; <strong>Check-out at 11:00 AM</strong>
              </span>
            </div>
            <div className="text-emerald-200/70 hidden sm:block text-[11px]">
              Exclusive Private Villa &bull; Entire Property Reserved For You
            </div>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
            <button
              onClick={() => setStep('dates')}
              className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center border-r border-gray-200 transition-colors cursor-pointer ${
                step === 'dates'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'hover:text-gray-900'
              }`}
            >
              <span>1. Dates</span>
            </button>
            <button
              onClick={() => {
                if (checkIn && checkOut) setStep('customize');
              }}
              disabled={!checkIn || !checkOut}
              className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center border-r border-gray-200 transition-colors ${
                step === 'customize'
                  ? 'bg-white text-emerald-900 shadow-xs cursor-pointer'
                  : checkIn && checkOut
                  ? 'hover:text-gray-900 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">2. Guests &amp; Experiences</span>
              <span className="sm:hidden">2. Guests</span>
            </button>
            <button
              onClick={() => {
                if (checkIn && checkOut) setStep('review');
              }}
              disabled={!checkIn || !checkOut}
              className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center transition-colors ${
                step === 'review'
                  ? 'bg-white text-emerald-900 shadow-xs cursor-pointer'
                  : checkIn && checkOut
                  ? 'hover:text-gray-900 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">3. Confirmation</span>
              <span className="sm:hidden">3. Confirm</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: DATES SELECTION */}
            {step === 'dates' && (
              <div className="space-y-6">
                {/* Date badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      checkIn
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Check-In Date
                    </span>
                    <div className="font-serif text-xl font-bold text-gray-900 mt-0.5">
                      {checkIn ? new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select from calendar'}
                    </div>
                    <div className="text-xs text-emerald-800 mt-1 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Check-in Time: 2:00 PM
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      checkOut
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Check-Out Date
                    </span>
                    <div className="font-serif text-xl font-bold text-gray-900 mt-0.5">
                      {checkOut ? new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select from calendar'}
                    </div>
                    <div className="text-xs text-emerald-800 mt-1 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Check-out Time: 11:00 AM
                    </div>
                  </div>
                </div>

                {/* Automated Seasonal Weather & Festival Advisory Alert */}
                {seasonAlert && (
                  <SeasonAlertCard
                    alert={seasonAlert}
                    acknowledged={seasonAlertAcknowledged}
                    onToggleAcknowledge={() => setSeasonAlertAcknowledged((prev) => !prev)}
                  />
                )}

                {/* Calendar View */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-serif text-lg font-bold text-gray-900">
                      {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1.5 pt-2">
                    {daysInMonth.map((day, idx) => {
                      if (!day) {
                        return <div key={`empty-${idx}`} className="h-12" />;
                      }

                      const isSelectedCheckIn = checkIn === day.dateKey;
                      const isSelectedCheckOut = checkOut === day.dateKey;
                      const isInRange =
                        checkIn && checkOut && day.dateKey > checkIn && day.dateKey < checkOut;

                      let cellBg = 'bg-white hover:bg-emerald-50/40 text-gray-900 border border-gray-200';
                      if (!day.available) {
                        if (day.status === 'blocked') {
                          cellBg = 'bg-rose-50 text-rose-400 border border-rose-100 cursor-not-allowed';
                        } else if (day.status === 'booked') {
                          cellBg = 'bg-amber-50 text-amber-500 border border-amber-100 cursor-not-allowed';
                        } else {
                          cellBg = 'bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed';
                        }
                      }

                      if (isSelectedCheckIn || isSelectedCheckOut) {
                        cellBg = 'bg-emerald-900 text-white font-bold border-emerald-900 shadow-md';
                      } else if (isInRange) {
                        cellBg = 'bg-emerald-100/70 text-emerald-950 font-bold border-emerald-200';
                      }

                      return (
                        <button
                          key={day.dateKey}
                          type="button"
                          disabled={!day.available}
                          onClick={() => handleDateClick(day.dateKey, day.available)}
                          title={day.label}
                          className={`h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative group cursor-pointer ${cellBg}`}
                        >
                          <span className="text-xs font-semibold">{day.dayNumber}</span>
                          {!day.available && (
                            <span className="text-[9px] scale-90 leading-tight font-medium">
                              {day.status === 'blocked'
                                ? 'Blocked'
                                : day.status === 'booked'
                                ? 'Booked'
                                : ''}
                            </span>
                          )}
                          {isSelectedCheckIn && (
                            <span className="text-[8px] uppercase tracking-tighter opacity-80 font-bold">2 PM In</span>
                          )}
                          {isSelectedCheckOut && (
                            <span className="text-[8px] uppercase tracking-tighter opacity-80 font-bold">11 AM Out</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 mt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white border border-gray-200" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-900" />
                      <span>Selected Stay</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                      <span>Blocked by Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GUESTS & ADDONS */}
            {step === 'customize' && (
              <div className="space-y-6">
                {/* Villa Type / Configuration Selection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-800" /> Select Villa Configuration
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                      Private Pool Included
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Choose between our 2 BHK and 3 BHK private pool villa layouts according to your group size.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* 2 BHK Option */}
                    <div
                      onClick={() => setVillaType('2bhk')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        villaType === '2bhk'
                          ? 'bg-emerald-50/70 border-emerald-900 shadow-sm ring-1 ring-emerald-900'
                          : 'bg-gray-50/50 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-gray-900">2 BHK Luxury Villa</span>
                          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Up to 9 Pax
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          2 Master Bedrooms, Private Pool, Scenic Deck & Living Lounge. Ideal for families and groups up to 9 guests.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-baseline justify-between">
                        <span className="text-xs text-gray-500 font-medium">Nightly Tariff:</span>
                        <span className="text-base font-bold text-emerald-900">₹8,000 <span className="text-xs font-normal text-gray-500">/ night</span></span>
                      </div>
                    </div>

                    {/* 3 BHK Option */}
                    <div
                      onClick={() => setVillaType('3bhk')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        villaType === '3bhk'
                          ? 'bg-emerald-50/70 border-emerald-900 shadow-sm ring-1 ring-emerald-900'
                          : 'bg-gray-50/50 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-gray-900">3 BHK Luxury Villa</span>
                          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Up to 12 Pax
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Full 3 Master Suites, Private Pool, Valley View Balconies & Spacious Lawn. Ideal for groups up to 12 guests.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-baseline justify-between">
                        <span className="text-xs text-gray-500 font-medium">Nightly Tariff:</span>
                        <span className="text-base font-bold text-emerald-900">₹11,000 <span className="text-xs font-normal text-gray-500">/ night</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest counter */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-800" /> Guest Headcount
                    </h4>
                    <span className="text-xs font-bold text-gray-600">
                      Total: {adults + children} / {currentMaxGuests} Max
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {villaType === '2bhk' ? '2 BHK accommodates up to 9 guests maximum.' : '3 BHK accommodates up to 12 guests maximum.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Adults */}
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-sm font-bold text-gray-900">Adults</div>
                        <div className="text-xs text-gray-500">Age 12+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-4 text-center">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(currentMaxGuests - children, adults + 1))}
                          disabled={adults + children >= currentMaxGuests}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-sm font-bold text-gray-900">Children</div>
                        <div className="text-xs text-gray-500">Age 0–11</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-4 text-center">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(currentMaxGuests - adults, children + 1))}
                          disabled={adults + children >= currentMaxGuests}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add-ons and Experiences */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-800" /> Additional Add-ons & Experiences
                    </h4>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_ADDONS.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-emerald-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-gray-900">{addon.name}</span>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-emerald-900 border-emerald-900 text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{addon.description}</p>
                          </div>
                          <div className="mt-3 text-xs font-bold text-emerald-800">
                            + ₹{addon.price.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Assistance Notice */}
                <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">Need help or customized arrangements?</div>
                    <div className="text-emerald-300 text-[11px]">
                      Booking Desk: <strong>8925014660</strong> | Caretaker: <strong>7358956101</strong>
                    </div>
                  </div>
                  <a
                    href="tel:8925014660"
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Call Booking Desk
                  </a>
                </div>

                {/* Special Requests */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Special Requests & Preferences
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Flight/train arrival timings, campfire schedule, jeep safari timing, extra towels, or dietary preferences."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Account check banner */}
                {!currentUser ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Customer Account Required</div>
                      <div className="text-xs text-amber-700">
                        Please log in to your account to confirm and receive your official resort voucher.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-4 py-2 bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow cursor-pointer"
                    >
                      Log In / Register
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-500">
                          {currentUser.email} &bull; {currentUser.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Logged In Guest
                    </span>
                  </div>
                )}

                {/* Stay Summary Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="font-serif text-lg font-bold text-gray-900">
                    Stay & Timings Summary
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-In</div>
                      <div className="text-sm font-bold text-gray-900">{checkIn}</div>
                      <div className="text-xs text-emerald-800 font-bold mt-0.5">Time: 2:00 PM</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-Out</div>
                      <div className="text-sm font-bold text-gray-900">{checkOut}</div>
                      <div className="text-xs text-emerald-800 font-bold mt-0.5">Time: 11:00 AM</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Total Nights:</span>
                      <strong className="text-gray-900">{pricing.nights} Nights</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <strong className="text-gray-900">{adults} Adults, {children} Children</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Accommodation:</span>
                      <strong className="text-gray-900">
                        {villaType === '3bhk' ? '3 BHK Luxury Villa (Up to 12 Pax)' : '2 BHK Luxury Villa (Up to 9 Pax)'} with Private Pool
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Nightly Tariff:</span>
                      <strong className="text-emerald-900">₹{currentRatePerNight.toLocaleString()} / night</strong>
                    </div>
                  </div>
                </div>

                {/* Promo Code & Discount */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Promotional / Loyalty Voucher</span>
                    </label>
                    {appliedPromo && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        {appliedPromo} Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MIST15 or CHV-1000-XXXX"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick-Apply Loyalty Vouchers if user has any active ones */}
                  {currentUser && (() => {
                    const userVouchers = StorageService.getLoyaltyVouchers(currentUser.id).filter(
                      (v) => v.status === 'active' && new Date(v.expiresAt).getTime() > Date.now()
                    );
                    if (userVouchers.length === 0) return null;
                    return (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Your Active Loyalty Rewards Vouchers:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {userVouchers.map((v) => {
                            const isApplied = appliedPromo === v.code;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleApplyPromo(v.code)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isApplied
                                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                <span>₹{v.discountAmount.toLocaleString()} Off ({v.code})</span>
                                {isApplied ? <Check className="w-3 h-3" /> : <span className="text-[10px] opacity-75">Apply</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {promoMessage && (
                    <p className={`text-[11px] font-semibold ${appliedPromo ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Friend Referral Program Card */}
                <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs space-y-2.5 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Friend Referral Code</span>
                    </label>
                    {appliedReferral ? (
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {appliedReferral.code} Applied
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                        Get ₹1,000 Off 1st Stay
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Did a friend or family member who stayed at Cloud Heaven refer you? Enter their unique code to save ₹1,000 on your first booking and reward them with +500 loyalty points!
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. SARAH-CHV"
                      disabled={!!appliedReferral}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs uppercase font-bold tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {appliedReferral ? (
                      <button
                        type="button"
                        onClick={handleRemoveReferral}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyReferral}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        Apply Code
                      </button>
                    )}
                  </div>

                  {appliedReferral && (
                    <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">
                          Referral verified: {appliedReferral.referrerName}
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
                          ₹{appliedReferral.discountAmount.toLocaleString()} discount deducted. Upon completion of this reservation, {appliedReferral.referrerName} will receive +500 Highland Loyalty Points!
                        </div>
                      </div>
                    </div>
                  )}

                  {referralMessage && !appliedReferral && (
                    <p
                      className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                        referralMessage.isError ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {referralMessage.isError && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>{referralMessage.text}</span>
                    </p>
                  )}
                </div>

                {/* Automated Seasonal Advisory Summary */}
                {seasonAlert && (
                  <SeasonAlertCard
                    alert={seasonAlert}
                    acknowledged={seasonAlertAcknowledged}
                    onToggleAcknowledge={() => setSeasonAlertAcknowledged((prev) => !prev)}
                    variant="summary"
                    compact
                  />
                )}

                {/* Price Breakdown */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="font-serif text-base font-bold text-gray-900">
                    Price Breakdown
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Villa Rate ({pricing.nights} nights)</span>
                      <span className="font-semibold text-gray-900">₹{pricing.baseTotal.toLocaleString()}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                        <span>✨ Promo Discount ({appliedPromo})</span>
                        <span>- ₹{pricing.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.referralDiscount > 0 && (
                      <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-100/70 p-2 rounded-lg border border-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Friend Referral Discount ({appliedReferral?.code})</span>
                        </span>
                        <span>- ₹{pricing.referralDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedAddons.map((a) => (
                      <div key={a.id} className="flex justify-between text-gray-500">
                        <span>+ {a.name}</span>
                        <span>₹{a.price.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span>Resort Tax & GST ({villa.taxRatePercent}%)</span>
                      <span>₹{pricing.taxes.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                      <span>Grand Total Tariff</span>
                      <span className="text-emerald-900 font-serif text-lg">₹{pricing.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* UPI Direct Payment & Part Payment Options */}
                <UpiPaymentCard
                  amount={effectiveAdvance}
                  totalTariff={pricing.grandTotal}
                  bookingRef={`${checkIn ? checkIn.replace(/-/g, '') : 'BOOK'}`}
                  isPartPayment={isPartPayment}
                  onPaymentTypeChange={(type, adv) => {
                    setIsPartPayment(type === 'partial');
                    setCustomAdvance(adv);
                  }}
                  utrNumber={utrNumber}
                  onUtrChange={setUtrNumber}
                  selectedUpiApp={selectedUpiApp}
                  onSelectUpiApp={setSelectedUpiApp}
                />
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {pricing.nights > 0 ? (
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {pricing.nights} {pricing.nights === 1 ? 'Night' : 'Nights'} &bull; Total: ₹{pricing.grandTotal.toLocaleString()}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {step === 'review' ? (
                      <span>
                        Pay Now: <span className="text-emerald-900 font-serif">₹{effectiveAdvance.toLocaleString()}</span>
                        {balanceDue > 0 && (
                          <span className="text-xs text-amber-700 font-normal ml-2">
                            (Bal: ₹{balanceDue.toLocaleString()})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>₹{pricing.grandTotal.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-medium">Please select dates</div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              {step !== 'dates' && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'review') setStep('customize');
                    else if (step === 'customize') setStep('dates');
                  }}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Back
                </button>
              )}

              {step === 'dates' && (
                <button
                  type="button"
                  disabled={!checkIn || !checkOut}
                  onClick={() => setStep('customize')}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer text-center"
                >
                  Continue to Guests
                </button>
              )}

              {step === 'customize' && (
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer text-center"
                >
                  Review Booking
                </button>
              )}

              {step === 'review' && (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Pay ₹{effectiveAdvance.toLocaleString()} via UPI &amp; Confirm
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

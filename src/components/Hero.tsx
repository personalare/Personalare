import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Waves,
  Wifi,
  Flame,
  Coffee,
  CheckCircle2,
  Users,
  Tag,
  X,
  Gift,
  Copy,
  FileText,
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { VillaDetails } from '../types';
import { WeatherWidget } from './WeatherWidget';

interface HeroProps {
  onOpenBookingWithDates: (checkIn?: string, checkOut?: string) => void;
  onOpenAuth: () => void;
  onOpenWelcomeGuide?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBookingWithDates,
  onOpenWelcomeGuide,
}) => {
  const [villa, setVilla] = useState<VillaDetails>(() => StorageService.getVillaDetails());
  const [quickCheckIn, setQuickCheckIn] = useState('');
  const [quickCheckOut, setQuickCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('2 Adults, 1 Villa');
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setVilla(StorageService.getVillaDetails());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('cloudheaven_promo_dismissed');
    if (dismissed === 'true') {
      setIsBannerVisible(false);
    }
  }, []);

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem('cloudheaven_promo_dismissed', 'true');
  };

  const handleCopyPromo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('MIST15');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBookingWithDates(quickCheckIn || undefined, quickCheckOut || undefined);
  };

  return (
    <section className="relative pt-4 pb-16 md:pt-6 md:pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-6">
      {/* Slim Dismissible Promotional Announcement Bar */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative bg-emerald-950 text-white rounded-2xl p-3 sm:px-5 sm:py-2.5 shadow-md border border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Left & Center: Offer content */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-center sm:justify-start text-center sm:text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>Early-Bird &amp; Seasonal Offer</span>
                </span>
                <p className="text-emerald-100 font-medium leading-tight">
                  Flat <strong className="text-emerald-300 font-bold">15% OFF</strong> on 2+ nights with code{' '}
                  <span className="font-mono font-bold text-emerald-200 bg-emerald-900 px-1.5 py-0.5 rounded border border-emerald-700">
                    MIST15
                  </span>{' '}
                  <span className="hidden md:inline text-emerald-200/80">• Includes complimentary floating pool breakfast &amp; campfire.</span>
                </p>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-colors flex items-center gap-1 border border-white/10 cursor-pointer"
                  title="Copy Promo Code"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-300" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBookingWithDates(quickCheckIn || undefined, quickCheckOut || undefined)}
                  className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Claim Offer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="p-1 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                  aria-label="Dismiss promotional banner"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Story + Sleek Booking Reservation Box */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold tracking-wider uppercase text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Exclusive Private Villa &amp; Swimming Pool</span>
              </div>
              <WeatherWidget variant="compact" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-[1.1] tracking-tight"
            >
              Your Private Escape in{' '}
              <span className="text-emerald-900 font-medium italic font-serif">Vagamon</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed"
            >
              Experience the serenity of Cloud Heaven. A luxury private villa sanctuary featuring a pristine heated infinity pool, secluded tea valley views, and dedicated estate care.
            </motion.p>
          </div>

          {/* Sleek Booking Reservation Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-900">
                Booking Reservation
              </h2>
              <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                From ₹{villa.basePricePerNight.toLocaleString()} / night
              </span>
            </div>

            <form onSubmit={handleCheckAvailability} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase mb-1.5 font-bold tracking-wider">
                    Check-In (02:00 PM)
                  </label>
                  <input
                    type="date"
                    value={quickCheckIn}
                    onChange={(e) => setQuickCheckIn(e.target.value)}
                    className="w-full border-b border-gray-200 py-2 text-sm text-gray-900 focus:border-emerald-900 outline-none transition-colors cursor-pointer bg-transparent font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase mb-1.5 font-bold tracking-wider">
                    Check-Out (11:00 AM)
                  </label>
                  <input
                    type="date"
                    value={quickCheckOut}
                    onChange={(e) => setQuickCheckOut(e.target.value)}
                    className="w-full border-b border-gray-200 py-2 text-sm text-gray-900 focus:border-emerald-900 outline-none transition-colors cursor-pointer bg-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 uppercase mb-1.5 font-bold tracking-wider">
                  Guest Profile &amp; Accommodation
                </label>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-800">
                    {guestCount} (Entire 3-Suite Villa)
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenBookingWithDates(quickCheckIn || undefined, quickCheckOut || undefined)}
                    className="text-emerald-900 text-xs font-bold uppercase tracking-wider hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    Modify
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-900 text-white py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-emerald-800 shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Confirm Dates &amp; Book Stay</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {onOpenWelcomeGuide && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onOpenWelcomeGuide}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Guest Welcome Guide &amp; Vagamon Map (PDF)</span>
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>

        {/* Right Column: Sleek Emerald Feature Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-5 relative bg-emerald-950 rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-emerald-900 min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]"
        >
          {/* Background Villa Imagery with subtle opacity */}
          <div
            className="absolute inset-0 opacity-45 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${villa.images.pool})` }}
          />

          {/* Gradient Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-emerald-950/30" />

          {/* Top Floating Badges */}
          <div className="relative z-10 p-6 sm:p-8 flex flex-wrap gap-2.5">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white uppercase font-bold tracking-wider border border-white/10">
              Private Pool
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white uppercase font-bold tracking-wider border border-white/10">
              Premium Wi-Fi
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white uppercase font-bold tracking-wider border border-white/10">
              Personal Chef
            </span>
          </div>

          {/* Bottom Sleek Showcase */}
          <div className="relative z-10 p-6 sm:p-8 mt-auto">
            <div className="border-l-2 border-emerald-400 pl-4 sm:pl-6 mb-6">
              <p className="text-emerald-400/90 text-xs uppercase tracking-widest mb-1 font-bold">
                Estate Highlights
              </p>
              <h3 className="text-white text-xl sm:text-2xl font-medium font-serif">
                3 King Suites &amp; Heated Infinity Pool
              </h3>
            </div>

            {/* Sleek Glassmorphic Card & Live Weather Showcase */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 text-white space-y-4">
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                Nestled on 4 private acres atop Vagamon (1,100m ASL). Complete exclusivity with panoramic misty tea hill vistas and crisp mountain breezes.
              </p>

              {/* Live Mountain Weather Strip */}
              <div className="pt-1">
                <WeatherWidget variant="hero-embed" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Coins,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Gift,
  HelpCircle,
  TrendingUp,
  Sliders,
  X,
  Crown,
  Coffee,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { LoyaltyAccount, LoyaltyTier, Booking } from '../types';

interface LoyaltyPointsTierWidgetProps {
  loyaltyAccount: LoyaltyAccount;
  bookings: Booking[];
  onOpenBooking: () => void;
  onNavigateToLoyalty: () => void;
}

interface TierDefinition {
  tier: LoyaltyTier;
  title: string;
  badgeLabel: string;
  subtitle: string;
  criteriaSummary: string;
  minBookings: number;
  minNights: number;
  minPoints: number;
  minSpend: number;
  colorBg: string;
  borderColor: string;
  textColor: string;
  accentBadge: string;
  gradientCard: string;
  perks: string[];
}

export const TIER_DEFINITIONS: Record<LoyaltyTier, TierDefinition> = {
  Silver: {
    tier: 'Silver',
    title: 'Highland Explorer',
    badgeLabel: 'Silver Tier',
    subtitle: 'Welcome Guest Membership',
    criteriaSummary: '0 – 1 Stays • Entry tier for all registered guests',
    minBookings: 0,
    minNights: 0,
    minPoints: 0,
    minSpend: 0,
    colorBg: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800',
    accentBadge: 'bg-slate-100 text-slate-700 border-slate-300',
    gradientCard: 'from-slate-800 via-slate-900 to-slate-950',
    perks: [
      'Earn 100 points per night stayed at Cloud Heaven',
      'Earn 5% points on all confirmed booking values',
      'Instant points redemption: 1 Point = ₹2 Stay Credit',
      'Standard check-in at 2:00 PM & check-out at 11:00 AM',
      'Complimentary welcome highland tea on arrival',
    ],
  },
  Gold: {
    tier: 'Gold',
    title: 'Valley Connoisseur',
    badgeLabel: 'Gold Tier',
    subtitle: 'Frequent Highland Traveler',
    criteriaSummary: '2 – 4 Stays • 5+ Nights • 1,500+ Stay Pts • ₹30,000+ Spend',
    minBookings: 2,
    minNights: 5,
    minPoints: 1500,
    minSpend: 30000,
    colorBg: 'bg-amber-50/50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    accentBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    gradientCard: 'from-amber-700 via-amber-800 to-stone-900',
    perks: [
      'All Silver privileges included',
      '+10% bonus loyalty points on all future reservations',
      'Priority early check-in from 12:30 PM (subject to availability)',
      'Complimentary organic tea estate welcome gift box',
      'Complimentary evening tea & fresh bakery treats for family',
    ],
  },
  Platinum: {
    tier: 'Platinum',
    title: 'Mist Peak VIP Luminary',
    badgeLabel: 'Platinum Tier',
    subtitle: 'Elite VIP Retreat Member',
    criteriaSummary: '5+ Stays • 10+ Nights • 3,500+ Stay Pts • ₹75,000+ Spend',
    minBookings: 5,
    minNights: 10,
    minPoints: 3500,
    minSpend: 75000,
    colorBg: 'bg-emerald-50/50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-950',
    accentBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    gradientCard: 'from-emerald-900 via-teal-950 to-stone-950',
    perks: [
      'All Gold privileges included',
      'Guaranteed late check-out till 12:00 PM',
      'Complimentary private campfire & firewood setup session',
      '24/7 dedicated personal estate concierge host',
      '15% discount on guided jeep safaris and private chef dining',
    ],
  },
};

export const LoyaltyPointsTierWidget: React.FC<LoyaltyPointsTierWidgetProps> = ({
  loyaltyAccount,
  bookings,
  onOpenBooking,
  onNavigateToLoyalty,
}) => {
  const [showTierCriteriaModal, setShowTierCriteriaModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedBookingsCount, setSimulatedBookingsCount] = useState<number | null>(null);

  const stats = loyaltyAccount.tierStats;
  const currentTier = loyaltyAccount.tier;
  const currentDef = TIER_DEFINITIONS[currentTier];

  // If user is playing with the interactive simulator:
  const effectiveBookingsCount =
    simulatedBookingsCount !== null ? simulatedBookingsCount : stats.validBookingsCount;

  // Determine simulated tier for demo purposes if simulator is active
  let displayTier = currentTier;
  if (simulatedBookingsCount !== null) {
    if (simulatedBookingsCount >= 5) displayTier = 'Platinum';
    else if (simulatedBookingsCount >= 2) displayTier = 'Gold';
    else displayTier = 'Silver';
  }
  const activeDef = TIER_DEFINITIONS[displayTier];

  // Tier progress helpers
  const getTierStepState = (tier: LoyaltyTier) => {
    const order: LoyaltyTier[] = ['Silver', 'Gold', 'Platinum'];
    const currentIndex = order.indexOf(displayTier);
    const targetIndex = order.indexOf(tier);

    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top Header: Badge & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Tier Emblem Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              displayTier === 'Platinum'
                ? 'bg-gradient-to-br from-emerald-700 to-teal-900 text-emerald-200 border border-emerald-500/40'
                : displayTier === 'Gold'
                ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 border border-amber-400/40'
                : 'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-200 border border-slate-400/30'
            }`}
          >
            {displayTier === 'Platinum' ? (
              <Crown className="w-7 h-7" />
            ) : displayTier === 'Gold' ? (
              <Award className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${activeDef.accentBadge}`}
              >
                {activeDef.badgeLabel}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                • Categorized via Booking History
              </span>
              {simulatedBookingsCount !== null && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                  Demo Simulation: {simulatedBookingsCount} Stays
                </span>
              )}
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <span>{activeDef.title}</span>
              <span className="text-xs font-sans font-medium text-gray-500 hidden sm:inline">
                ({activeDef.subtitle})
              </span>
            </h2>

            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed max-w-2xl">
              {simulatedBookingsCount !== null
                ? `Simulating tier qualification based on ${simulatedBookingsCount} past bookings.`
                : stats.qualificationReason}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowTierCriteriaModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="View detailed Silver, Gold, and Platinum tier qualification rules"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>Tier Rules &amp; Perks</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border ${
              showSimulator
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
            }`}
            title="Test tier switching preview"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showSimulator ? 'Close Simulator' : 'Test Tier Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Quick Slider Bar (If Toggled) */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <span className="font-bold text-emerald-950">
                  Interactive Booking History Tier Preview
                </span>
                <span className="text-gray-500 text-[11px]">
                  (Drag to test how completed bookings automatically promote the guest tier)
                </span>
              </div>
              {simulatedBookingsCount !== null && (
                <button
                  type="button"
                  onClick={() => setSimulatedBookingsCount(null)}
                  className="text-xs text-emerald-900 font-bold underline hover:text-emerald-700 cursor-pointer self-start sm:self-auto"
                >
                  Reset to Actual History ({stats.validBookingsCount} Stays)
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs font-mono font-bold text-gray-600 whitespace-nowrap">
                0 Stays (Silver)
              </span>
              <input
                type="range"
                min={0}
                max={8}
                value={effectiveBookingsCount}
                onChange={(e) => setSimulatedBookingsCount(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-emerald-900 whitespace-nowrap">
                {effectiveBookingsCount} Stays ({displayTier})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
              <button
                type="button"
                onClick={() => setSimulatedBookingsCount(0)}
                className={`p-2 rounded-xl border transition-all cursor-pointer font-bold ${
                  displayTier === 'Silver'
                    ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Silver Tier (0–1 Stays)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedBookingsCount(3)}
                className={`p-2 rounded-xl border transition-all cursor-pointer font-bold ${
                  displayTier === 'Gold'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Gold Tier (2–4 Stays)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedBookingsCount(6)}
                className={`p-2 rounded-xl border transition-all cursor-pointer font-bold ${
                  displayTier === 'Platinum'
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Platinum Tier (5+ Stays)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Loyalty Balance Card + Booking History Contribution Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Digital Membership & Points Card (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg bg-gradient-to-br ${activeDef.gradientCard} flex flex-col justify-between min-h-[240px] border border-white/10`}
        >
          {/* Subtle Ambient Shapes */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <Coins className="w-28 h-28" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cloud Heaven Loyalty</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                {displayTier} Member
              </span>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                Available Loyalty Points
              </div>
              <div className="flex flex-wrap items-baseline gap-2.5 mt-0.5">
                <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  {loyaltyAccount.currentPoints.toLocaleString()}
                </span>
                <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider">
                  Points
                </span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11px] text-white/90 backdrop-blur-xs font-medium">
                <span>≈ ₹{(loyaltyAccount.currentPoints * 2).toLocaleString()} Stay Discount</span>
                <span className="text-white/50">•</span>
                <span>1 Pt = ₹2</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] uppercase text-white/60 font-semibold tracking-wider">
                Lifetime Points Earned
              </div>
              <div className="font-serif text-base font-bold text-white mt-0.5">
                {loyaltyAccount.lifetimePoints.toLocaleString()} pts
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToLoyalty}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Redeem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Booking History Contribution & Categorization Stats (7 cols) */}
        <div className="lg:col-span-7 bg-gray-50/70 border border-gray-200/70 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Booking History Categorization Metrics
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                Active Tier: {displayTier}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your tier level is automatically computed from your confirmed reservation history at Cloud Heaven Vagamon:
            </p>

            {/* 4-Stat Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5">
              <div className="p-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Total Stays
                </div>
                <div className="font-serif text-xl font-bold text-gray-900 mt-1">
                  {effectiveBookingsCount}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {effectiveBookingsCount === 1 ? 'Stay' : 'Stays'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Nights Stayed
                </div>
                <div className="font-serif text-xl font-bold text-gray-900 mt-1">
                  {stats.totalNightsStayed}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Nights in Villa</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Holiday Spend
                </div>
                <div className="font-serif text-xl font-bold text-emerald-950 mt-1">
                  ₹{Math.round(stats.totalSpendINR / 1000)}k
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  ₹{stats.totalSpendINR.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-gray-200/80 shadow-2xs text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Stay Points
                </div>
                <div className="font-serif text-xl font-bold text-amber-700 mt-1">
                  {stats.stayPointsEarned}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">From Bookings</div>
              </div>
            </div>
          </div>

          {/* Active Tier Top Benefit Highlight */}
          <div className="p-3.5 bg-white border border-gray-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-gray-900">Current Key Privilege: </span>
                <span className="text-gray-600">
                  {displayTier === 'Platinum'
                    ? 'Guaranteed Late Checkout till 12 PM & Campfire Setup'
                    : displayTier === 'Gold'
                    ? '+10% Bonus Points on Stays & Estate Tea Gift'
                    : '100 pts/night + 5% Cashback Points on Bookings'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTierCriteriaModal(true)}
              className="text-xs font-bold text-emerald-900 hover:text-emerald-700 whitespace-nowrap cursor-pointer"
            >
              All Perks →
            </button>
          </div>
        </div>
      </div>

      {/* Visual Tier Roadmap / Stepper */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-800" />
            <span>Tier Progression Track</span>
          </div>

          <div className="text-xs text-gray-500">
            {displayTier === 'Platinum' ? (
              <span className="font-bold text-emerald-800">
                Highest Loyalty Tier Achieved
              </span>
            ) : displayTier === 'Gold' ? (
              <span>
                Next Milestone:{' '}
                <strong className="text-gray-900">
                  Platinum VIP (5 Stays or 3,500 Pts)
                </strong>
              </span>
            ) : (
              <span>
                Next Milestone:{' '}
                <strong className="text-gray-900">
                  Gold Connoisseur (2 Stays or 1,500 Pts)
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* 3 Tier Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Silver Tier Step */}
          {(() => {
            const stepState = getTierStepState('Silver');
            return (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  stepState === 'current'
                    ? 'bg-slate-50 border-slate-400 shadow-sm ring-2 ring-slate-400/20'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="font-serif text-sm font-bold text-slate-900">Silver Explorer</span>
                  </div>
                  {stepState === 'completed' || stepState === 'current' ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-gray-500">
                  0 – 1 Stays • 0 – 4 Nights • Base 5% Points
                </p>
                <div className="mt-2 text-[11px] text-gray-700 font-medium">
                  • 100 pts/night stayed
                  <br />• 1 pt = ₹2 discount voucher value
                </div>
              </div>
            );
          })()}

          {/* 2. Gold Tier Step */}
          {(() => {
            const stepState = getTierStepState('Gold');
            return (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  stepState === 'current'
                    ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-2 ring-amber-400/30'
                    : stepState === 'completed'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50/50 border-dashed border-gray-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-serif text-sm font-bold text-amber-950">Valley Gold</span>
                  </div>
                  {stepState === 'completed' ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : stepState === 'current' ? (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                      Active Tier
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {Math.max(0, 2 - effectiveBookingsCount)} stays away
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  2 – 4 Stays • 5+ Nights • 1,500+ Stay Pts
                </p>
                <div className="mt-2 text-[11px] text-gray-700 font-medium">
                  • +10% bonus loyalty points on stays
                  <br />• Priority early check-in &amp; organic tea gift
                </div>
              </div>
            );
          })()}

          {/* 3. Platinum Tier Step */}
          {(() => {
            const stepState = getTierStepState('Platinum');
            return (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  stepState === 'current'
                    ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-500/30'
                    : stepState === 'completed'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50/50 border-dashed border-gray-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-serif text-sm font-bold text-emerald-950">Platinum VIP</span>
                  </div>
                  {stepState === 'current' ? (
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                      Active Tier
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {Math.max(0, 5 - effectiveBookingsCount)} stays away
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  5+ Stays • 10+ Nights • 3,500+ Stay Pts
                </p>
                <div className="mt-2 text-[11px] text-gray-700 font-medium">
                  • Guaranteed late checkout till 12 PM
                  <br />• Complimentary private campfire &amp; BBQ session
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Tier status is re-evaluated live after every completed stay or reservation update.</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToLoyalty}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-700" />
            <span>Redeem Points for Vouchers</span>
          </button>
          <button
            type="button"
            onClick={onOpenBooking}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>Book Stay &amp; Earn Pts</span>
          </button>
        </div>
      </div>

      {/* Modal: Full Tier Comparison & Categorization Rules */}
      <AnimatePresence>
        {showTierCriteriaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-100 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                    Highland Club Policy
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
                    Tier Categorization &amp; Booking History
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    How Cloud Heaven rewards loyal travelers based on reservations, nights stayed, and points accumulated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTierCriteriaModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Tiers Detailed Breakdown */}
              <div className="space-y-4">
                {Object.values(TIER_DEFINITIONS).map((def) => {
                  const isCurrent = def.tier === displayTier;
                  return (
                    <div
                      key={def.tier}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${def.accentBadge}`}
                          >
                            {def.badgeLabel}
                          </span>
                          <h4 className="font-serif text-base font-bold text-gray-900">
                            {def.title}
                          </h4>
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                            Your Current Tier
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-emerald-950 font-semibold mb-3">
                        Qualification: {def.criteriaSummary}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        {def.perks.map((p, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 space-y-1">
                <div className="font-bold text-gray-900">How Points &amp; Stays are Calculated:</div>
                <div>• Stays earn 100 points per night + 5% cashback points on final room booking amount.</div>
                <div>• Verified post-stay guest reviews earn an extra 100 bonus points.</div>
                <div>• Points can be redeemed anytime for instant discount voucher codes (1 pt = ₹2).</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTierCriteriaModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

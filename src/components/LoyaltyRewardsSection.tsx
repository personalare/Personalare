import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Sparkles,
  Gift,
  Coins,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  Tag,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Crown,
  Share2,
  Users,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { LoyaltyAccount, LoyaltyVoucher, LoyaltyTier } from '../types';

interface LoyaltyRewardsSectionProps {
  onOpenBooking: () => void;
}

const REDEMPTION_PACKAGES = [
  {
    points: 250,
    discount: 500,
    title: '₹500 Villa Stay Voucher',
    description: 'Instant discount on your next Vagamon escape.',
    badge: 'Popular',
  },
  {
    points: 500,
    discount: 1000,
    title: '₹1,000 Highland Retreat Voucher',
    description: 'Save ₹1,000 on 2+ nights weekend or weekday stays.',
    badge: 'Best Value',
  },
  {
    points: 1000,
    discount: 2500,
    title: '₹2,500 Luxury Stay Voucher',
    description: 'Substantial savings on family or group bookings.',
    badge: 'Premium',
  },
  {
    points: 2000,
    discount: 5000,
    title: '₹5,000 Grand Estate Voucher',
    description: 'Exclusive tier privilege for multiple night holidays.',
    badge: 'Elite VIP',
  },
];

const TIER_PERKS: Record<
  LoyaltyTier,
  { name: string; minPoints: number; color: string; criteria: string; perks: string[] }
> = {
  Silver: {
    name: 'Highland Silver Member',
    minPoints: 0,
    color: 'from-slate-700 to-slate-900',
    criteria: '0 – 1 Stays • 0 – 4 Nights • Welcome Tier',
    perks: [
      'Earn 100 points per night stayed at Cloud Heaven',
      'Earn 5% points on all confirmed booking values',
      'Instant points redemption: 1 Point = ₹2 Stay Credit',
      'Standard check-in at 2:00 PM & check-out at 11:00 AM',
    ],
  },
  Gold: {
    name: 'Valley Gold Member',
    minPoints: 1500,
    color: 'from-amber-600 to-amber-900',
    criteria: '2 – 4 Stays • 5 – 9 Nights • 1,500+ Stay Pts • ₹30,000+ Spend',
    perks: [
      'All Silver privileges included',
      'Complimentary organic tea estate welcome basket',
      'Priority early check-in (subject to availability)',
      '+10% bonus loyalty points on all stays',
    ],
  },
  Platinum: {
    name: 'Pine Platinum Member',
    minPoints: 3500,
    color: 'from-emerald-800 to-teal-950',
    criteria: '5+ Stays • 10+ Nights • 3,500+ Stay Pts • ₹75,000+ Spend',
    perks: [
      'All Gold privileges included',
      'Complimentary starlight campfire & BBQ setup session',
      'Guaranteed late check-out till 12:00 PM',
      'Dedicated concierge host assistance 24/7',
    ],
  },
};

export const LoyaltyRewardsSection: React.FC<LoyaltyRewardsSectionProps> = ({ onOpenBooking }) => {
  const { currentUser } = useAuth();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemSuccessVoucher, setRedeemSuccessVoucher] = useState<LoyaltyVoucher | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadAccount = () => {
    if (!currentUser) return;
    const acc = StorageService.getLoyaltyAccount(currentUser.id);
    setAccount(acc);
  };

  useEffect(() => {
    loadAccount();
    const unsubscribe = subscribeToStorage(() => {
      loadAccount();
    });
    return unsubscribe;
  }, [currentUser]);

  if (!currentUser || !account) {
    return null;
  }

  const currentTierInfo = TIER_PERKS[account.tier];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const [copiedReferralCode, setCopiedReferralCode] = useState(false);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  const referralCode = account.referralCode || `${(currentUser.name.split(' ')[0] || 'GUEST').toUpperCase()}-CHV`;
  const shareableUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralCode}` : `https://cloudheaven.in/?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferralCode(true);
    setTimeout(() => setCopiedReferralCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedReferralLink(true);
    setTimeout(() => setCopiedReferralLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! I love staying at Cloud Heaven Luxury Villa in Vagamon. Use my personal referral code *${referralCode}* to get ₹1,000 OFF your first luxury booking:\n${shareableUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRedeem = (pkg: (typeof REDEMPTION_PACKAGES)[0]) => {
    setRedeemError(null);
    setIsProcessing(true);

    setTimeout(() => {
      const res = StorageService.redeemPointsForVoucher(
        currentUser.id,
        pkg.points,
        pkg.discount,
        pkg.title
      );

      setIsProcessing(false);
      if (res.success && res.voucher) {
        setRedeemSuccessVoucher(res.voucher);
        loadAccount();
      } else {
        setRedeemError(res.message || 'Unable to redeem points at this time.');
      }
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Hero Loyalty Card & Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Digital Member Card */}
        <div
          className={`lg:col-span-2 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl bg-gradient-to-br ${currentTierInfo.color} flex flex-col justify-between min-h-[260px] border border-white/10`}
        >
          {/* Subtle Background Art */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none">
            <Coins className="w-44 h-44" />
          </div>

          {/* Top Bar of Card */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Cloud Heaven Highlands
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide mt-1">
                {currentTierInfo.name}
              </h2>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>{account.tier} Tier</span>
            </div>
          </div>

          {/* Points Balance Display */}
          <div className="relative z-10 my-4 sm:my-6">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-1">
              Available Loyalty Balance
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {account.currentPoints.toLocaleString()}
              </span>
              <span className="text-base text-emerald-300 font-bold uppercase tracking-wider">
                Points
              </span>
              <span className="text-xs px-2.5 py-1 bg-white/10 rounded-lg text-white/90 backdrop-blur-xs font-medium">
                ≈ ₹{(account.currentPoints * 2).toLocaleString()} Discount Value
              </span>
            </div>
          </div>

          {/* Card Footer: Progress to next tier & Member ID */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/80">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <span className="font-medium">
                  {account.tier === 'Platinum'
                    ? 'Maximum Elite Tier Achieved'
                    : `${account.lifetimePoints} / ${account.nextTierPoints} Lifetime Pts to Next Tier`}
                </span>
                <span className="font-bold text-white">{account.progressPercent}%</span>
              </div>
              <div className="w-full sm:w-56 h-2 bg-black/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${account.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] text-white/60">
              MEMBER #{currentUser.id.toUpperCase().slice(-8)}
            </div>
          </div>
        </div>

        {/* Quick Stats & Earning Overview */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Member Privileges
              </h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your {account.tier} status unlocks exclusive perks at Cloud Heaven Vagamon:
            </p>

            <div className="mt-3 space-y-2">
              {currentTierInfo.perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Lifetime Points
              </div>
              <div className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                {account.lifetimePoints.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Total Saved
              </div>
              <div className="font-serif text-lg font-bold text-emerald-900 mt-0.5">
                ₹{account.totalSavingsINR.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Tier Categorization & Booking History Analysis */}
      {account.tierStats && (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Tier Categorization by Booking History
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your guest tier status is determined by your verified reservations, nights stayed, and points accumulated.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {account.tier} Tier Status
              </span>
            </div>
          </div>

          {/* Qualification Reason Callout */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Active Tier Qualification: </span>
              <span className="text-emerald-900">{account.tierStats.qualificationReason}</span>
            </div>
          </div>

          {/* 4-Stat Booking History Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Total Stays
              </div>
              <div className="font-serif text-xl font-bold text-gray-900 mt-1">
                {account.tierStats.validBookingsCount}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {account.tierStats.validBookingsCount === 1 ? '1 Booking' : `${account.tierStats.validBookingsCount} Bookings`}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Nights Stayed
              </div>
              <div className="font-serif text-xl font-bold text-gray-900 mt-1">
                {account.tierStats.totalNightsStayed}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Nights in Vagamon</div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Total Spend
              </div>
              <div className="font-serif text-xl font-bold text-emerald-900 mt-1">
                ₹{account.tierStats.totalSpendINR.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Direct Stays Value</div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Stay Points Earned
              </div>
              <div className="font-serif text-xl font-bold text-amber-700 mt-1">
                {account.tierStats.stayPointsEarned.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">From Reservations</div>
            </div>
          </div>

          {/* Tier Comparison Cards (Silver vs Gold vs Platinum) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {(['Silver', 'Gold', 'Platinum'] as LoyaltyTier[]).map((t) => {
              const info = TIER_PERKS[t];
              const isCurrent = account.tier === t;
              return (
                <div
                  key={t}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        t === 'Platinum'
                          ? 'bg-emerald-100 text-emerald-900'
                          : t === 'Gold'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {t} Tier
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Current
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-sm font-bold text-gray-900">{info.name}</h4>
                  <div className="text-[11px] text-emerald-900 font-semibold mt-1">
                    {info.criteria}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-600">
                    {info.perks.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redemptions Success / Error Banners */}
      {redeemError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{redeemError}</span>
        </div>
      )}

      {/* SECTION: Redeem Points for Discount Vouchers */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-800" />
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Redeem Points for Stay Discounts
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Turn your loyalty points into voucher codes instantly applicable on any future booking.
            </p>
          </div>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
            1 Loyalty Point = ₹2 Discount Value
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REDEMPTION_PACKAGES.map((pkg) => {
            const canAfford = account.currentPoints >= pkg.points;
            return (
              <div
                key={pkg.points}
                className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  canAfford
                    ? 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                    : 'border-gray-100 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {pkg.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{pkg.points} Pts</span>
                    </div>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-gray-900">{pkg.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold">Discount</div>
                    <div className="font-serif text-xl font-bold text-emerald-900">
                      ₹{pkg.discount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford || isProcessing}
                    onClick={() => handleRedeem(pkg)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-emerald-900 hover:bg-emerald-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem Now' : 'Need More Pts'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: Refer a Friend & Earn 500 Loyalty Points */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-500/20 space-y-6">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                Friend Referral Program
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
              Refer Friends & Earn +500 Points
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Give your friends <strong className="text-white">₹1,000 off</strong> their first luxury villa booking in Vagamon, and you will earn <strong className="text-emerald-300">+500 Highland Loyalty Points</strong> (worth ₹1,000 in stay vouchers) the moment their stay is completed.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Friends Referred</div>
              <div className="font-serif text-xl font-bold text-white mt-0.5">
                {account.referralsCount || 0}
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Referral Points</div>
              <div className="font-serif text-xl font-bold text-amber-300 mt-0.5">
                +{account.referralPointsEarned || 0} pts
              </div>
            </div>
          </div>
        </div>

        {/* Shareable Code and Action Bar */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Unique Referral Code Box */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Your Personal Referral Code
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-wider mt-1 select-all">
                {referralCode}
              </div>
              <p className="text-[11px] text-white/70 mt-1">
                Share this unique voucher code with your friends to enter at checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {copiedReferralCode ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Code Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Referral Code</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Share Link & WhatsApp */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Instant Invite Link
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-xs font-mono text-emerald-200 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedReferralLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-white/70 mt-1.5">
                When friends open this link, your referral discount of ₹1,000 will be auto-applied to their booking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: 'Cloud Heaven Villa Referral',
                        text: `Use my referral code ${referralCode} to get ₹1,000 off your first stay at Cloud Heaven Villa in Vagamon!`,
                        url: shareableUrl,
                      })
                      .catch(() => handleCopyLink());
                  } else {
                    handleCopyLink();
                  }
                }}
                className="py-2 px-4 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Invite via Device Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Step Breakdown */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-white">Share Your Invite</div>
            <p className="text-[11px] text-white/70">
              Give your unique code or link to friends, colleagues, or family.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-white">Friend Gets ₹1,000 Off</div>
            <p className="text-[11px] text-white/70">
              Your friend applies your code and saves ₹1,000 on their 1st booking.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-white">You Get +500 Points</div>
            <p className="text-[11px] text-white/70">
              Receive 500 Highland Loyalty Points credited straight to your account.
            </p>
          </div>
        </div>

        {/* Referral Track Record */}
        <div className="relative z-10 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Your Referred Friends ({account.referrals?.length || 0})</span>
            </h4>
          </div>

          {!account.referrals || account.referrals.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/70 space-y-1">
              <div className="font-semibold text-white">No referrals recorded yet</div>
              <div>Share your code above with friends planning a Vagamon holiday to start receiving +500 points!</div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <tr>
                      <th className="py-2.5 px-4">Friend Name</th>
                      <th className="py-2.5 px-4">Booking Ref</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Friend Saved</th>
                      <th className="py-2.5 px-4 text-right">Points Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {account.referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-bold flex items-center justify-center">
                            {ref.referredUserName.charAt(0)}
                          </div>
                          <span>{ref.referredUserName}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-white/70">
                          {ref.bookingId}
                        </td>
                        <td className="py-2.5 px-4 text-white/60 text-[11px]">
                          {new Date(ref.completedAt || ref.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-300 font-semibold">
                          ₹{(ref.friendDiscountAmount || 1000).toLocaleString()} Off
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-300">
                          +{ref.pointsAwarded || 500} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: My Active & Redeemed Vouchers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif text-xl font-bold text-gray-900">
              My Discount Vouchers
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {account.vouchers.length} {account.vouchers.length === 1 ? 'Voucher' : 'Vouchers'}
          </span>
        </div>

        {account.vouchers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-gray-900">No Vouchers Generated Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You have {account.currentPoints} loyalty points available. Redeem them above to get instant discount codes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {account.vouchers.map((voucher) => {
              const isActive = voucher.status === 'active' && new Date(voucher.expiresAt).getTime() > Date.now();
              const isUsed = voucher.status === 'used';
              const isCopied = copiedCode === voucher.code;

              return (
                <div
                  key={voucher.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white'
                      : 'border-gray-100 bg-gray-50/50 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isUsed
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isActive ? 'Active & Ready' : isUsed ? 'Used in Stay' : 'Expired'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Expires {new Date(voucher.expiresAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="font-serif text-lg font-bold text-emerald-900">
                        ₹{voucher.discountAmount.toLocaleString()} Off
                      </div>
                    </div>

                    {/* Voucher Code Box */}
                    <div className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Promo / Voucher Code
                        </div>
                        <div className="font-mono text-sm sm:text-base font-bold text-gray-900 tracking-wider">
                          {voucher.code}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(voucher.code)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-gray-600" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500">{voucher.description}</p>
                  </div>

                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={onOpenBooking}
                        className="text-xs font-bold uppercase tracking-wider text-emerald-900 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Apply & Book Villa Stay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: Points Activity History Statement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Loyalty Points Activity History
            </h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Activity Description</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Points Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {account.transactions.map((tx) => {
                  const isPositive = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5 text-gray-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-gray-900 font-semibold">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'earned_referral'
                              ? 'bg-purple-100 text-purple-800'
                              : tx.type === 'earned_stay'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'earned_bonus'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {tx.type === 'earned_referral'
                            ? 'Referral Reward'
                            : tx.type === 'earned_stay'
                            ? 'Stay Reward'
                            : tx.type === 'earned_bonus'
                            ? 'Bonus'
                            : 'Redemption'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPositive ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isPositive ? `+${tx.points}` : tx.points} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Redemption Success Modal */}
      <AnimatePresence>
        {redeemSuccessVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 text-center relative"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Gift className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                  Congratulations!
                </span>
                <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">
                  Voucher Generated
                </h3>
                <p className="text-xs text-gray-500 mt-1.5">
                  You redeemed {redeemSuccessVoucher.pointsRedeemed} points for a ₹
                  {redeemSuccessVoucher.discountAmount.toLocaleString()} discount on your next villa reservation.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Your Voucher Code
                </div>
                <div className="font-mono text-xl font-bold text-gray-900 tracking-wider">
                  {redeemSuccessVoucher.code}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(redeemSuccessVoucher.code)}
                  className="mx-auto px-4 py-1.5 bg-white border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === redeemSuccessVoucher.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRedeemSuccessVoucher(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRedeemSuccessVoucher(null);
                    onOpenBooking();
                  }}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Book Stay Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

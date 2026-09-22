import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Printer,
  Send,
  Coins,
  Award,
  Gift,
  Star,
  MessageSquare,
  ThumbsUp,
  Edit3,
  Trash2,
  Heart,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { WelcomeGuidePdfService } from '../services/welcomeGuidePdfService';
import {
  Booking,
  EmailNotification,
  WhatsAppNotification,
  LoyaltyAccount,
  Review,
} from '../types';
import { BookingSuccessModal } from './BookingSuccessModal';
import { EmailViewModal } from './EmailViewModal';
import { WhatsAppMessageModal } from './WhatsAppMessageModal';
import { LoyaltyRewardsSection } from './LoyaltyRewardsSection';
import { PostStayFeedbackModal } from './PostStayFeedbackModal';
import { GuestBalancePaymentModal } from './GuestBalancePaymentModal';
import { LoyaltyPointsTierWidget } from './LoyaltyPointsTierWidget';
import { BellRing, MessageCircle, CheckCheck, ExternalLink, CreditCard, QrCode } from 'lucide-react';

interface CustomerPortalProps {
  onOpenBooking: () => void;
  onOpenWelcomeGuide?: (opts?: any) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onOpenBooking,
  onOpenWelcomeGuide,
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews' | 'loyalty' | 'notifications'>('bookings');
  const [selectedVoucherBooking, setSelectedVoucherBooking] = useState<Booking | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [selectedWhatsAppModalBooking, setSelectedWhatsAppModalBooking] = useState<Booking | null>(null);
  const [selectedWhatsAppModalType, setSelectedWhatsAppModalType] = useState<
    'confirmation' | 'checkin_reminder' | 'checkout_reminder'
  >('confirmation');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);

  // Post-Stay Feedback Modal state
  const [feedbackModalBooking, setFeedbackModalBooking] = useState<Booking | null>(null);
  const [feedbackModalExistingReview, setFeedbackModalExistingReview] = useState<Review | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  // Guest UPI Balance Payment modal
  const [selectedBookingForBalancePay, setSelectedBookingForBalancePay] = useState<Booking | null>(null);

  const loadData = () => {
    if (currentUser) {
      setLoyaltyAccount(StorageService.getLoyaltyAccount(currentUser.id));
      setUserReviews(StorageService.getReviewsByUserId(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(() => {
      loadData();
    });
    return unsub;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white border border-[#e7e5e4] rounded-2xl shadow-sm max-w-md mx-auto">
          <User className="w-12 h-12 text-[#8c7b64] mx-auto mb-3" />
          <h3 className="font-serif text-2xl font-bold text-[#1c1917]">Customer Sign In Required</h3>
          <p className="text-xs text-[#78716c] mt-2 mb-6">
            Please log in with your customer account to view your past and upcoming reservations.
          </p>
        </div>
      </div>
    );
  }

  const userBookings = StorageService.getBookingsByUserId(currentUser.id);
  const contact = StorageService.getContactDetails();

  // Helper to check if a booking checkout has passed
  const isBookingCompleted = (b: Booking): boolean => {
    if (b.status !== 'confirmed') return false;
    const checkoutTime = new Date(`${b.checkOutDate}T11:00:00`).getTime();
    return Date.now() >= checkoutTime;
  };

  // Find completed bookings without reviews
  const pendingReviewBookings = userBookings.filter(
    (b) => isBookingCompleted(b) && !StorageService.getReviewByBookingId(b.id)
  );

  const handleCancelBooking = (bookingId: string) => {
    StorageService.updateBookingStatus(bookingId, 'cancelled');
    setCancelModalBooking(null);
    setFeedbackMsg('Reservation successfully cancelled.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const openReviewModal = (booking: Booking, existing?: Review) => {
    setFeedbackModalBooking(booking);
    setFeedbackModalExistingReview(existing || StorageService.getReviewByBookingId(booking.id) || null);
  };

  const handleReviewSuccess = (review: Review, isNew: boolean) => {
    setFeedbackModalBooking(null);
    setFeedbackModalExistingReview(null);
    loadData();
    setFeedbackMsg(
      isNew
        ? '🎉 Thank you for your review! +100 Highland Loyalty Points have been credited to your account.'
        : 'Your review has been updated successfully.'
    );
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to remove this review?')) {
      StorageService.deleteReview(reviewId);
      loadData();
      setFeedbackMsg('Review removed.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-gray-900">
      {/* Header Profile Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-white flex items-center justify-center font-serif text-2xl font-bold border border-emerald-800/40 shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
                Guest Member
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-700 font-semibold">
                {loyaltyAccount ? `${loyaltyAccount.tier} Tier` : 'Active Account'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
              Welcome, {currentUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {currentUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {currentUser.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {loyaltyAccount && (
            <button
              onClick={() => setActiveTab('loyalty')}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Loyalty Points
                </div>
                <div className="text-xs font-bold text-amber-900">
                  {loyaltyAccount.currentPoints.toLocaleString()} pts
                </div>
              </div>
            </button>
          )}

          {onOpenWelcomeGuide && (
            <button
              onClick={() =>
                onOpenWelcomeGuide({
                  guestName: currentUser?.name,
                })
              }
              className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              title="Download 3-Page PDF Guest Welcome Guide & Vagamon Itinerary"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Welcome Guide (PDF)</span>
            </button>
          )}

          <button
            onClick={onOpenBooking}
            className="px-5 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" /> Book New Stay
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Pending Review Prompt Banner */}
      {pendingReviewBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Post-Stay Feedback Available
                </span>
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" /> +100 Points Reward
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-gray-900 mt-1">
                How was your recent stay at Cloud Heaven?
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Your checkout was on{' '}
                <strong className="text-gray-900">{pendingReviewBookings[0].checkOutDate}</strong> ({pendingReviewBookings[0].villaTypeLabel || '2 BHK Villa'}). Share your experience to help future travelers!
              </p>
            </div>
          </div>

          <button
            onClick={() => openReviewModal(pendingReviewBookings[0])}
            className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Write Review &amp; Claim 100 Pts</span>
          </button>
        </motion.div>
      )}

      {/* Loyalty Points & Booking History Tier Categorization Display */}
      {loyaltyAccount && (
        <LoyaltyPointsTierWidget
          loyaltyAccount={loyaltyAccount}
          bookings={userBookings}
          onOpenBooking={onOpenBooking}
          onNavigateToLoyalty={() => setActiveTab('loyalty')}
        />
      )}

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span><span className="hidden sm:inline">My </span>Reservations</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {userBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'reviews'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><span className="hidden sm:inline">Post-Stay </span>Reviews</span>
          {userReviews.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'reviews' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {userReviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'loyalty'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span><span className="hidden sm:inline">Highland </span>Loyalty</span>
          {loyaltyAccount && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'loyalty' ? 'bg-emerald-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {loyaltyAccount.currentPoints} pts
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><span className="hidden sm:inline">Automated </span>Dispatches</span>
        </button>
      </div>

      {/* Tab 1: Loyalty Rewards Section */}
      {activeTab === 'loyalty' && (
        <LoyaltyRewardsSection onOpenBooking={onOpenBooking} />
      )}

      {/* Tab 2: Post-Stay Feedback & Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
                  Verified Guest Feedback Center
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                My Reviews &amp; Stay Experiences
              </h2>
              <p className="text-xs text-gray-500 max-w-xl">
                After completing a stay at Cloud Heaven, verified guests can rate their experience and write a review. Each submitted review rewards +100 Highland Club loyalty points!
              </p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl shrink-0">
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-gray-900">
                  {userReviews.length}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  Reviews Submitted
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>
                    {userReviews.length > 0
                      ? (userReviews.reduce((a, r) => a + (r.rating || 5), 0) / userReviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  Avg Given Rating
                </div>
              </div>
            </div>
          </div>

          {/* Stays Awaiting Review */}
          {pendingReviewBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Completed Stays Ready for Review ({pendingReviewBookings.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingReviewBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 bg-gradient-to-br from-amber-50/70 to-emerald-50/70 border border-amber-200/80 rounded-3xl space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                        {b.id}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Stay Completed &bull; {b.totalNights} Nights
                      </span>
                    </div>

                    <div>
                      <div className="font-serif text-base font-bold text-gray-900">
                        {b.villaTypeLabel || (b.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa')}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Checked Out on <strong>{b.checkOutDate}</strong> ({b.guests.adults} Guests)
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" /> +100 Loyalty Points Reward
                      </span>
                      <button
                        onClick={() => openReviewModal(b)}
                        className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Write Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User's Submitted Reviews List */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Submitted Feedback &amp; Published Reviews
            </h3>

            {userReviews.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-gray-900">No Reviews Written Yet</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Once your checkout date for a reservation passes, you can rate your experience and write a review right here to earn loyalty bonus points.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userReviews.map((rev) => {
                  const matchingBooking = userBookings.find((b) => b.id === rev.bookingId);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {rev.rating}/5.0
                          </span>
                          {rev.recommended && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> Recommended
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {rev.bookingId && (
                            <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              Stay #{rev.bookingId}
                            </span>
                          )}
                          <span>{rev.date}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-serif text-lg font-bold text-gray-900">
                          "{rev.highlight}"
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                          "{rev.comment}"
                        </p>
                      </div>

                      {rev.categoryRatings && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                          <div className="p-2 bg-gray-50 rounded-xl text-center">
                            <div className="text-gray-400 text-[10px] font-medium">Cleanliness</div>
                            <div className="font-bold text-gray-800">{rev.categoryRatings.cleanliness}★</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl text-center">
                            <div className="text-gray-400 text-[10px] font-medium">Infinity Pool</div>
                            <div className="font-bold text-gray-800">{rev.categoryRatings.poolExperience}★</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl text-center">
                            <div className="text-gray-400 text-[10px] font-medium">Hospitality</div>
                            <div className="font-bold text-gray-800">{rev.categoryRatings.hospitality}★</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl text-center">
                            <div className="text-gray-400 text-[10px] font-medium">Views &amp; Mist</div>
                            <div className="font-bold text-gray-800">{rev.categoryRatings.viewsLocation}★</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl text-center col-span-2 sm:col-span-1">
                            <div className="text-gray-400 text-[10px] font-medium">Value</div>
                            <div className="font-bold text-gray-800">{rev.categoryRatings.valueForMoney}★</div>
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Guest &bull; {rev.userLocation}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {matchingBooking && (
                            <button
                              onClick={() => openReviewModal(matchingBooking, rev)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Review
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Reservations & Policies */}
      {activeTab === 'bookings' && (
        <div className="space-y-8">
          {/* Resort Policies Reminder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-900">Check-In Time: 2:00 PM</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Villa caretaker prepares infinity pool &amp; fresh tea plantation welcome drink.
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-900">Check-Out Time: 11:00 AM</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Late checkout subject to villa availability and prior host approval.
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-900">Direct Contacts</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Booking: <strong>{contact.phone}</strong> | Caretaker: <strong>{contact.caretakerPhone || '+91 73589 56101'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                My Reservations &amp; Stays
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {userBookings.length} {userBookings.length === 1 ? 'Booking' : 'Bookings'} found
              </span>
            </div>

            {userBookings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">No Reservations Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  You haven't booked any stays at Cloud Heaven yet. Select your check-in and check-out dates to experience our private pool villa.
                </p>
                <button
                  onClick={onOpenBooking}
                  className="px-6 py-3 bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-300" /> Select Dates &amp; Book Villa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userBookings.map((booking) => {
                  const isConfirmed = booking.status === 'confirmed';
                  const isCancelled = booking.status === 'cancelled';
                  const hasCheckedOut = isBookingCompleted(booking);
                  const existingReview = StorageService.getReviewByBookingId(booking.id);

                  // Calculate points earned for this booking
                  const pointsEarned = isConfirmed
                    ? booking.totalNights * 100 + Math.round(booking.finalAmount * 0.05)
                    : 0;

                  return (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-5 transition-all hover:border-gray-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {booking.id}
                            </span>
                            <span className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                              {booking.villaTypeLabel || (booking.villaType === '3bhk' ? '3 BHK Villa (12 Pax)' : '2 BHK Villa (9 Pax)')}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isConfirmed
                                  ? hasCheckedOut
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-emerald-50 text-emerald-800'
                                  : isCancelled
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {hasCheckedOut ? 'Completed Stay' : booking.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            {isConfirmed && pointsEarned > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-500" />
                                <span>+{pointsEarned} Loyalty Pts</span>
                              </span>
                            )}
                          </div>

                          {/* Check In / Out Dates Highlight */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                Check-In (2:00 PM)
                              </div>
                              <div className="font-serif text-lg font-bold text-gray-900">
                                {booking.checkInDate}
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                Check-Out (11:00 AM)
                              </div>
                              <div className="font-serif text-lg font-bold text-gray-900">
                                {booking.checkOutDate}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                            <span>
                              <strong className="text-gray-900">{booking.totalNights}</strong> Nights &bull;{' '}
                              <strong className="text-gray-900">{booking.guests.adults}</strong> Adults
                              {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
                            </span>
                            {booking.addons.length > 0 && (
                              <span>
                                &bull; Add-ons: {booking.addons.map((a) => a.name).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side Pricing & Voucher Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 shrink-0">
                          <div className="text-left lg:text-right">
                            <div className="text-xs text-gray-500 font-medium">Total Stay Price</div>
                            <div className="font-serif text-2xl font-bold text-gray-900">
                              ₹{booking.finalAmount.toLocaleString()}
                            </div>

                            {/* Payment Status & Advance / Balance details */}
                            {booking.paymentStatus === 'partially_paid' && (
                              <div className="mt-1 space-y-0.5">
                                <div className="text-[11px] text-emerald-800 font-semibold">
                                  Advance Paid: ₹{(booking.advancePaid || 0).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-amber-800 font-bold">
                                  Remaining Due: ₹{(booking.balanceAmount || 0).toLocaleString()}
                                </div>
                              </div>
                            )}

                            {booking.paymentStatus === 'paid' && (
                              <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Paid
                              </div>
                            )}

                            {booking.paymentStatus === 'pending' && (
                              <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-800 text-[10px] font-bold rounded-full border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" /> Payment Pending
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* If balance is due and booking is confirmed, show Pay Due via UPI */}
                            {isConfirmed && (booking.paymentStatus === 'partially_paid' || booking.paymentStatus === 'pending') && ((booking.balanceAmount ?? booking.finalAmount) > 0) && (
                              <button
                                onClick={() => setSelectedBookingForBalancePay(booking)}
                                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Pay Due (₹{((booking.balanceAmount ?? booking.finalAmount) || 0).toLocaleString()})</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedVoucherBooking(booking)}
                              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-800" /> Voucher
                            </button>

                            <button
                              onClick={() => {
                                if (onOpenWelcomeGuide) {
                                  onOpenWelcomeGuide({
                                    guestName: booking.userName,
                                    bookingRef: booking.id,
                                    checkInDate: booking.checkInDate,
                                    checkOutDate: booking.checkOutDate,
                                    villaType:
                                      booking.villaTypeLabel ||
                                      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa'),
                                  });
                                } else {
                                  WelcomeGuidePdfService.downloadPdf({
                                    guestName: booking.userName,
                                    bookingRef: booking.id,
                                    checkInDate: booking.checkInDate,
                                    checkOutDate: booking.checkOutDate,
                                    villaType:
                                      booking.villaTypeLabel ||
                                      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa'),
                                  });
                                }
                              }}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Download personalized 3-Page PDF Welcome Guide"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-800" /> Guide (PDF)
                            </button>

                            <button
                              onClick={() => {
                                const emails = NotificationService.getEmailLogsByBookingId(booking.id);
                                const custEmail = emails.find((e) => e.type === 'customer_confirmation') || emails[0];
                                if (custEmail) {
                                  setSelectedEmail(custEmail);
                                }
                              }}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-emerald-700" /> Email
                            </button>

                            <button
                              onClick={() => {
                                setSelectedWhatsAppModalBooking(booking);
                                setSelectedWhatsAppModalType('confirmation');
                              }}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" /> WhatsApp
                            </button>

                            {isConfirmed && !hasCheckedOut && (
                              <button
                                onClick={() => setCancelModalBooking(booking)}
                                className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Automated Stay Reminders & Quick Dispatches */}
                      {isConfirmed && (
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 -mx-5 -mb-5 px-5 py-3 rounded-b-3xl text-xs">
                          <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <BellRing className="w-4 h-4 text-emerald-700" />
                            <span>Automated Reminders:</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                NotificationService.sendCheckInReminder(booking.id);
                                setSelectedWhatsAppModalBooking(booking);
                                setSelectedWhatsAppModalType('checkin_reminder');
                                setFeedbackMsg('🌄 Check-in reminder dispatched via Email & WhatsApp!');
                                setTimeout(() => setFeedbackMsg(null), 5000);
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            >
                              <span>🌄 Send Check-In Reminder (2 PM)</span>
                            </button>

                            <button
                              onClick={() => {
                                NotificationService.sendCheckOutReminder(booking.id);
                                setSelectedWhatsAppModalBooking(booking);
                                setSelectedWhatsAppModalType('checkout_reminder');
                                setFeedbackMsg('🌤️ Check-out reminder dispatched via Email & WhatsApp!');
                                setTimeout(() => setFeedbackMsg(null), 5000);
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            >
                              <span>🌤️ Send Check-Out Reminder (11 AM)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Post-Stay Feedback Banner / Review Card if Checkout has Passed */}
                      {isConfirmed && hasCheckedOut && (
                        <div className="pt-3 border-t border-gray-100">
                          {existingReview ? (
                            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    {[...Array(existingReview.rating || 5)].map((_, i) => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                  </div>
                                  <span className="text-xs font-bold text-emerald-950">
                                    Your Review: "{existingReview.highlight}"
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                    +100 Pts Credited
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 italic line-clamp-1">
                                  "{existingReview.comment}"
                                </p>
                              </div>

                              <button
                                onClick={() => openReviewModal(booking, existingReview)}
                                className="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-700" /> Edit Review
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-50/50 to-emerald-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                                    <span>Checkout Completed &bull; Rate your stay &amp; share feedback</span>
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-1.5 py-0.5 rounded">
                                      +100 Pts Reward
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    Tell fellow travelers about the infinity pool, views, and caretaker hospitality.
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => openReviewModal(booking)}
                                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                <span>Rate &amp; Review Stay</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Automated Notifications & Reminders */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
                  Automated Communication Engine
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Dispatched Emails &amp; WhatsApp Reminders
              </h2>
              <p className="text-xs text-gray-500 max-w-xl">
                Whenever you book a stay, Cloud Heaven automatically issues booking vouchers, WhatsApp itineraries, caretaker alerts, and scheduled check-in / check-out reminders.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Multi-Channel Automation Active</span>
            </div>
          </div>

          {/* Email Notifications List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-800" />
              <span>Email Confirmations &amp; Reminder Vouchers</span>
            </h3>

            {NotificationService.getEmailLogsByRecipient(currentUser.email).length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                No email dispatches recorded for {currentUser.email} yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {NotificationService.getEmailLogsByRecipient(currentUser.email).map((emailLog) => (
                  <div
                    key={emailLog.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-gray-50/50 px-3 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            emailLog.type === 'customer_confirmation'
                              ? 'bg-emerald-100 text-emerald-900'
                              : emailLog.type === 'checkin_reminder'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {emailLog.type === 'customer_confirmation'
                            ? 'Booking Confirmation'
                            : emailLog.type === 'checkin_reminder'
                            ? 'Check-In Reminder'
                            : 'Check-Out Reminder'}
                        </span>
                        <span className="font-mono text-gray-500 font-medium">#{emailLog.bookingId}</span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(emailLog.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-bold text-gray-900">{emailLog.subject}</div>
                    </div>

                    <button
                      onClick={() => setSelectedEmail(emailLog)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-700" /> View Email
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp Communications List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              <span>WhatsApp Direct Messages &amp; Scheduled Prompts</span>
            </h3>

            {userBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                No active bookings to generate WhatsApp messages.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                        Ref #{b.id}
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        {b.checkInDate} to {b.checkOutDate}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        Guest Phone: <strong className="text-gray-900">{b.userPhone}</strong>
                      </div>
                      <div>
                        Villa: <strong className="text-gray-900">{b.villaTypeLabel || '2 BHK Luxury Villa'}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedWhatsAppModalBooking(b);
                          setSelectedWhatsAppModalType('confirmation');
                        }}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        💬 Voucher
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWhatsAppModalBooking(b);
                          setSelectedWhatsAppModalType('checkin_reminder');
                        }}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        🌄 Check-In (2 PM)
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWhatsAppModalBooking(b);
                          setSelectedWhatsAppModalType('checkout_reminder');
                        }}
                        className="p-2 bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        🌤️ Check-Out (11 AM)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Cancel Reservation {cancelModalBooking.id}?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to cancel your stay from{' '}
              <strong className="text-gray-900">{cancelModalBooking.checkInDate}</strong> to{' '}
              <strong className="text-gray-900">{cancelModalBooking.checkOutDate}</strong>? These dates will be freed up for other guests.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(cancelModalBooking.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                Yes, Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Stay Feedback Modal */}
      <PostStayFeedbackModal
        isOpen={Boolean(feedbackModalBooking)}
        booking={feedbackModalBooking}
        existingReview={feedbackModalExistingReview}
        onClose={() => {
          setFeedbackModalBooking(null);
          setFeedbackModalExistingReview(null);
        }}
        onSubmitSuccess={handleReviewSuccess}
      />

      {/* Voucher Modal */}
      <BookingSuccessModal
        isOpen={!!selectedVoucherBooking}
        booking={selectedVoucherBooking}
        onClose={() => setSelectedVoucherBooking(null)}
        onViewMyBookings={() => setSelectedVoucherBooking(null)}
      />

      {/* Email View Modal */}
      {selectedEmail && (
        <EmailViewModal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          email={selectedEmail}
        />
      )}

      {/* WhatsApp Message Modal */}
      {selectedWhatsAppModalBooking && (
        <WhatsAppMessageModal
          isOpen={Boolean(selectedWhatsAppModalBooking)}
          onClose={() => setSelectedWhatsAppModalBooking(null)}
          booking={selectedWhatsAppModalBooking}
          defaultType={selectedWhatsAppModalType}
        />
      )}

      {/* Guest UPI Balance Settlement Modal */}
      <GuestBalancePaymentModal
        isOpen={Boolean(selectedBookingForBalancePay)}
        booking={selectedBookingForBalancePay}
        onClose={() => setSelectedBookingForBalancePay(null)}
        onPaymentSuccess={(updated) => {
          setSelectedBookingForBalancePay(null);
          loadData();
          setFeedbackMsg(`Payment recorded successfully for booking #${updated.id}!`);
          setTimeout(() => setFeedbackMsg(null), 4000);
        }}
      />
    </div>
  );
};

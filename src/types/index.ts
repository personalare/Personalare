export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  createdAt: string;
  referralCode?: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  mode: 'upi' | 'cash' | 'bank_transfer' | 'card' | 'net_banking';
  referenceId?: string;
  notes?: string;
  recordedBy?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  villaType?: '2bhk' | '3bhk';
  villaTypeLabel?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  checkInTime: string; // "2:00 PM"
  checkOutTime: string; // "11:00 AM"
  guests: {
    adults: number;
    children: number;
  };
  totalNights: number;
  basePricePerNight: number;
  addons: BookingAddon[];
  totalAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  specialRequests?: string;
  createdAt: string;

  // Payment & Source tracking
  bookingSource?: 'website' | 'offline_admin' | 'phone_walkin';
  paymentMode?: 'upi' | 'cash' | 'bank_transfer' | 'card' | 'net_banking';
  paymentStatus?: 'paid' | 'partially_paid' | 'pending';
  advancePaid?: number;
  balanceAmount?: number;
  upiTransactionId?: string;
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi';
  paymentNotes?: string;
  paymentHistory?: PaymentRecord[];

  // Referral System Tracking
  referralCode?: string;
  referredByUserId?: string;
  referralDiscountAmount?: number;
  referralRewardPointsEarned?: number;

  // Vagamon Seasonal Weather & Festival Advisory
  seasonalAdvisory?: string;
  seasonType?: 'monsoon' | 'festival' | 'both';
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  blockedBy: string;
  createdAt: string;
}

export interface VillaDetails {
  name: string;
  location: string;
  tagline: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  basePricePerNight: number; // 8000 (2BHK)
  bhk2Price: number; // 8000
  bhk2MaxGuests: number; // 9 pax
  bhk3Price: number; // 11000
  bhk3MaxGuests: number; // 12 pax
  weekendPricePerNight: number;
  taxRatePercent: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  poolType: string;
  images: {
    hero: string;
    pool: string;
    bedroom: string;
    living: string;
    balcony: string;
    mistValley: string;
  };
}

export interface ContactDetails {
  phone: string; // Booking phone: 8925014660
  altPhone: string;
  caretakerName: string;
  caretakerPhone: string; // Caretaker: 7358956101
  email: string; // cloudheavenresort@gmail.com
  supportEmail: string;
  whatsapp: string; // 8925014660
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
}

export interface Review {
  id: string;
  bookingId?: string;
  userId?: string;
  userName: string;
  userLocation: string;
  rating: number; // 1 to 5
  categoryRatings?: {
    cleanliness: number;
    hospitality: number;
    poolExperience: number;
    viewsLocation: number;
    valueForMoney: number;
  };
  date: string;
  highlight: string;
  comment: string;
  favoriteAmenities?: string[];
  recommended?: boolean;
  villaType?: '2bhk' | '3bhk';
  createdAt?: string;
}

export type GalleryCategory = 'all' | 'interior' | 'exterior' | 'pool' | 'scenic';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'exterior' | 'pool' | 'scenic';
  categoryLabel: string;
  description: string;
  imageUrl: string;
  highResUrl: string;
  altText: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  featured?: boolean;
}

export type NotificationType =
  | 'customer_confirmation'
  | 'admin_booking_alert'
  | 'admin_cancellation_alert'
  | 'checkin_reminder'
  | 'checkout_reminder';

export interface EmailNotification {
  id: string;
  type: NotificationType;
  bookingId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  sentAt: string;
  status: 'sent' | 'delivered';
  metadata: {
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    guestName: string;
    guestPhone: string;
    finalAmount: number;
    adults: number;
    children: number;
    villaTypeLabel?: string;
  };
}

export interface WhatsAppNotification {
  id: string;
  type: NotificationType;
  bookingId: string;
  recipientPhone: string;
  recipientName: string;
  recipientRole: 'guest' | 'caretaker' | 'admin';
  messageText: string;
  directWhatsAppUrl: string;
  sentAt: string;
  status: 'dispatched' | 'sent' | 'delivered';
  metadata: {
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    guestName: string;
    finalAmount: number;
    villaTypeLabel?: string;
  };
}

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'reminder' | 'warning';
  channel: 'email' | 'whatsapp' | 'system';
  bookingId?: string;
  timestamp: string;
  read?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum';

export interface BookingHistoryTierStats {
  totalBookings: number;
  validBookingsCount: number;
  completedBookingsCount: number;
  totalNightsStayed: number;
  totalSpendINR: number;
  stayPointsEarned: number;
  bonusPointsEarned: number;
  tierQualifiedBy: 'bookings_count' | 'nights_stayed' | 'stay_points' | 'spend_total' | 'welcome';
  qualificationReason: string;
  nextTier: LoyaltyTier | null;
  bookingsNeededForNextTier: number;
  nightsNeededForNextTier: number;
  pointsNeededForNextTier: number;
  spendNeededForNextTier: number;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned_stay' | 'earned_bonus' | 'redeemed_discount' | 'earned_referral';
  points: number; // positive for earned, negative for redeemed
  description: string;
  date: string;
  bookingId?: string;
  referralId?: string;
}

export interface LoyaltyVoucher {
  id: string;
  userId: string;
  code: string;
  pointsRedeemed: number;
  discountAmount: number; // In INR ₹
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  expiresAt: string;
  description: string;
  usedInBookingId?: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  bookingId: string;
  bookingAmount: number;
  pointsAwarded: number; // Extra loyalty points awarded to referrer (e.g., 500 pts)
  friendDiscountAmount: number; // Discount provided to friend on their 1st booking (e.g., ₹1,000)
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface LoyaltyAccount {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  nextTierPoints: number;
  progressPercent: number;
  totalSavingsINR: number;
  referralPointsEarned: number;
  referralsCount: number;
  referralCode: string;
  transactions: LoyaltyTransaction[];
  vouchers: LoyaltyVoucher[];
  referrals: Referral[];
  tierStats: BookingHistoryTierStats;
}

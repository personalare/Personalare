import {
  Booking,
  BlockedDate,
  VillaDetails,
  ContactDetails,
  User,
  GalleryItem,
  Review,
  LoyaltyAccount,
  LoyaltyTier,
  LoyaltyTransaction,
  LoyaltyVoucher,
  PaymentRecord,
  BookingHistoryTierStats,
  Referral,
} from '../types';
import {
  DEFAULT_VILLA,
  DEFAULT_CONTACT,
  INITIAL_USERS,
  INITIAL_BLOCKED_DATES,
  INITIAL_BOOKINGS,
  GALLERY_PHOTOS,
  REVIEWS,
  INITIAL_REFERRALS,
} from '../data/mockData';
import { EmailService } from './emailService';
import { NotificationService } from './notificationService';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'cloudheaven_users_v1',
  CURRENT_USER: 'cloudheaven_current_user_v1',
  BOOKINGS: 'cloudheaven_bookings_v1',
  BLOCKED_DATES: 'cloudheaven_blocked_dates_v1',
  VILLA: 'cloudheaven_villa_v1',
  CONTACT: 'cloudheaven_contact_v1',
  LOYALTY_VOUCHERS: 'cloudheaven_loyalty_vouchers_v1',
  GALLERY: 'cloudheaven_gallery_v1',
  REVIEWS: 'cloudheaven_reviews_v1',
  REFERRALS: 'cloudheaven_referrals_v1',
};

// Listeners for reactive UI updates
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export const subscribeToStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// ----------------------------------------------------
// Firestore Real-Time Sync & Initialization
// ----------------------------------------------------
let firestoreInitialized = false;

function initFirestoreSync() {
  if (firestoreInitialized) return;
  firestoreInitialized = true;

  try {
    // 1. Sync Bookings Collection
    const bookingsCol = collection(db, 'bookings');
    onSnapshot(
      bookingsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteBookings: Booking[] = [];
          snapshot.forEach((docSnap) => {
            remoteBookings.push(docSnap.data() as Booking);
          });
          // Sort latest first
          remoteBookings.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          safeSet(STORAGE_KEYS.BOOKINGS, remoteBookings);
        } else {
          // If Firestore is brand new, seed with initial bookings
          INITIAL_BOOKINGS.forEach((b) => {
            setDoc(doc(db, 'bookings', b.id), b).catch(console.warn);
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'bookings')
    );

    // 2. Sync Blocked Dates Collection
    const blockedCol = collection(db, 'blocked_dates');
    onSnapshot(
      blockedCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteBlocked: BlockedDate[] = [];
          snapshot.forEach((docSnap) => {
            remoteBlocked.push(docSnap.data() as BlockedDate);
          });
          safeSet(STORAGE_KEYS.BLOCKED_DATES, remoteBlocked);
        } else {
          INITIAL_BLOCKED_DATES.forEach((b) => {
            setDoc(doc(db, 'blocked_dates', b.id), b).catch(console.warn);
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'blocked_dates')
    );

    // 3. Sync Villa Settings
    const villaDoc = doc(db, 'settings', 'villa');
    onSnapshot(
      villaDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          safeSet(STORAGE_KEYS.VILLA, docSnap.data() as VillaDetails);
        } else {
          setDoc(villaDoc, DEFAULT_VILLA).catch(console.warn);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/villa')
    );

    // 4. Sync Contact Settings
    const contactDoc = doc(db, 'settings', 'contact');
    onSnapshot(
      contactDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          safeSet(STORAGE_KEYS.CONTACT, docSnap.data() as ContactDetails);
        } else {
          setDoc(contactDoc, DEFAULT_CONTACT).catch(console.warn);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/contact')
    );

    // 5. Sync Users
    const usersCol = collection(db, 'users');
    onSnapshot(
      usersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers: User[] = [];
          snapshot.forEach((docSnap) => {
            remoteUsers.push(docSnap.data() as User);
          });
          safeSet(STORAGE_KEYS.USERS, remoteUsers);
        } else {
          INITIAL_USERS.forEach((u) => {
            setDoc(doc(db, 'users', u.id), u).catch(console.warn);
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'users')
    );

    // 6. Sync Gallery Photos
    const galleryDoc = doc(db, 'settings', 'gallery');
    onSnapshot(
      galleryDoc,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.photos) {
          safeSet(STORAGE_KEYS.GALLERY, docSnap.data().photos as GalleryItem[]);
        } else {
          setDoc(galleryDoc, { photos: GALLERY_PHOTOS }).catch(console.warn);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/gallery')
    );

    // 7. Sync Reviews Collection
    const reviewsCol = collection(db, 'reviews');
    onSnapshot(
      reviewsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteReviews: Review[] = [];
          snapshot.forEach((docSnap) => {
            remoteReviews.push(docSnap.data() as Review);
          });
          safeSet(STORAGE_KEYS.REVIEWS, remoteReviews);
        } else {
          // If brand new, seed reviews
          REVIEWS.forEach((r) => {
            setDoc(doc(db, 'reviews', r.id), r).catch(console.warn);
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'reviews')
    );

    // 8. Sync Referrals Collection
    const referralsCol = collection(db, 'referrals');
    onSnapshot(
      referralsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteReferrals: Referral[] = [];
          snapshot.forEach((docSnap) => {
            remoteReferrals.push(docSnap.data() as Referral);
          });
          safeSet(STORAGE_KEYS.REFERRALS, remoteReferrals);
        } else {
          INITIAL_REFERRALS.forEach((r) => {
            setDoc(doc(db, 'referrals', r.id), r).catch(console.warn);
          });
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'referrals')
    );
  } catch (err) {
    console.warn('Firestore initial sync deferred:', err);
  }
}

// Start Firestore real-time synchronization
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

export const StorageService = {
  // Users
  getUsers: (): User[] => {
    return safeGet<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserReferralCode: (user: User): string => {
    if (user.referralCode) return user.referralCode;
    const cleanName = (user.name.trim().split(' ')[0] || 'GUEST').toUpperCase().replace(/[^A-Z]/g, '');
    return `${cleanName || 'GUEST'}-CHV`;
  },

  saveUser: (user: User): User => {
    if (!user.referralCode) {
      const cleanName = (user.name.trim().split(' ')[0] || 'GUEST').toUpperCase().replace(/[^A-Z]/g, '');
      user.referralCode = `${cleanName || 'GUEST'}-CHV`;
    }

    const users = StorageService.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    safeSet(STORAGE_KEYS.USERS, users);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'users', user.id), user).catch(console.warn);
    } catch (e) {
      console.warn('User cloud sync notice:', e);
    }

    return user;
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = StorageService.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  getCurrentUser: (): User | null => {
    return safeGet<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: User | null): void => {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Bookings
  getBookings: (): Booking[] => {
    return safeGet<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  getBookingsByUserId: (userId: string): Booking[] => {
    const bookings = StorageService.getBookings();
    return bookings.filter((b) => b.userId === userId);
  },

  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const bookings = StorageService.getBookings();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    const finalAmt = bookingData.finalAmount || 0;
    const advance = bookingData.advancePaid !== undefined ? bookingData.advancePaid : finalAmt;
    const balance =
      bookingData.balanceAmount !== undefined
        ? bookingData.balanceAmount
        : Math.max(0, finalAmt - advance);
    const paymentStat =
      bookingData.paymentStatus ||
      (advance >= finalAmt ? 'paid' : advance > 0 ? 'partially_paid' : 'pending');

    const initialHistory: PaymentRecord[] =
      bookingData.paymentHistory && bookingData.paymentHistory.length > 0
        ? bookingData.paymentHistory
        : advance > 0
        ? [
            {
              id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              amount: advance,
              date: new Date().toISOString(),
              mode: bookingData.paymentMode || 'upi',
              referenceId: bookingData.upiTransactionId || `PAY-${randomSuffix}`,
              notes:
                bookingData.paymentNotes ||
                (advance < finalAmt
                  ? `Part payment of ₹${advance.toLocaleString()} received. Balance ₹${balance.toLocaleString()} due at check-in.`
                  : 'Full payment completed successfully.'),
              recordedBy: bookingData.bookingSource === 'offline_admin' ? 'Admin' : 'Guest',
            },
          ]
        : [];

    const newBooking: Booking = {
      ...bookingData,
      id: `CHV-${randomSuffix}`,
      advancePaid: advance,
      balanceAmount: balance,
      paymentStatus: paymentStat,
      paymentHistory: initialHistory,
      createdAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    safeSet(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync to Firestore database
    try {
      setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch(console.warn);
    } catch (e) {
      console.warn('Booking cloud sync notice:', e);
    }

    // Automatically trigger booking confirmation email to customer, WhatsApp voucher, and alert to admin
    try {
      NotificationService.sendBookingConfirmation(newBooking);
    } catch (e) {
      console.error('Failed to trigger notification service dispatch:', e);
      try {
        EmailService.sendBookingConfirmation(newBooking);
      } catch (err) {
        console.error('Failed fallback email notification:', err);
      }
    }

    // Process referral system if friend booked using a referral code
    if (newBooking.referralCode) {
      try {
        const validation = StorageService.validateReferralCode(
          newBooking.referralCode,
          newBooking.userId,
          newBooking.userEmail
        );
        if (validation.valid && validation.referrer) {
          const referrerUser = validation.referrer;
          const referralRecord: Referral = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            referrerUserId: referrerUser.id,
            referrerName: referrerUser.name,
            referrerEmail: referrerUser.email,
            referralCode: newBooking.referralCode.trim().toUpperCase(),
            referredUserId: newBooking.userId,
            referredUserName: newBooking.userName,
            referredUserEmail: newBooking.userEmail,
            bookingId: newBooking.id,
            bookingAmount: newBooking.finalAmount,
            pointsAwarded: validation.pointsAwarded || 500,
            friendDiscountAmount: newBooking.referralDiscountAmount || 1000,
            status: 'completed',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          };
          StorageService.saveReferral(referralRecord);

          // Update booking with referrer ID if missing
          if (!newBooking.referredByUserId) {
            newBooking.referredByUserId = referrerUser.id;
          }

          // In-app celebration notification for the referrer
          NotificationService.addAppNotification({
            title: '🎉 Referral Reward: +500 Loyalty Points!',
            message: `${newBooking.userName} just completed their first reservation (${newBooking.id}) with your referral code ${newBooking.referralCode}! 500 Highland Loyalty Points have been credited to your account.`,
            type: 'success',
            channel: 'system',
            bookingId: newBooking.id,
          });
        }
      } catch (refErr) {
        console.warn('Referral recording notice:', refErr);
      }
    }

    return newBooking;
  },

  recordPayment: (
    bookingId: string,
    payment: {
      amount: number;
      mode: 'upi' | 'cash' | 'bank_transfer' | 'card' | 'net_banking';
      referenceId?: string;
      notes?: string;
      recordedBy?: string;
    }
  ): Booking | null => {
    const bookings = StorageService.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    const b = bookings[index];
    const newRecord: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amount: payment.amount,
      date: new Date().toISOString(),
      mode: payment.mode,
      referenceId: payment.referenceId || `REF-${Date.now().toString().slice(-6)}`,
      notes: payment.notes || `Payment of ₹${payment.amount.toLocaleString()} received`,
      recordedBy: payment.recordedBy || 'Admin',
    };

    const updatedHistory = [...(b.paymentHistory || []), newRecord];
    const newAdvancePaid = (b.advancePaid || 0) + payment.amount;
    const newBalance = Math.max(0, b.finalAmount - newAdvancePaid);
    const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

    bookings[index] = {
      ...b,
      advancePaid: newAdvancePaid,
      balanceAmount: newBalance,
      paymentStatus: newStatus,
      paymentHistory: updatedHistory,
      paymentMode: payment.mode,
      ...(payment.referenceId ? { upiTransactionId: payment.referenceId } : {}),
      paymentNotes: payment.notes
        ? `${b.paymentNotes ? b.paymentNotes + ' | ' : ''}${payment.notes}`
        : b.paymentNotes,
    };

    safeSet(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'bookings', bookingId), bookings[index], { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn('Booking payment update cloud sync notice:', e);
    }

    return bookings[index];
  },

  updateBookingStatus: (bookingId: string, status: Booking['status']): boolean => {
    const bookings = StorageService.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index >= 0) {
      bookings[index].status = status;
      safeSet(STORAGE_KEYS.BOOKINGS, bookings);

      // Sync status update to Firestore
      try {
        setDoc(doc(db, 'bookings', bookingId), bookings[index], { merge: true }).catch(console.warn);
      } catch (e) {
        console.warn('Booking update cloud sync notice:', e);
      }
      return true;
    }
    return false;
  },

  deleteBooking: (bookingId: string): boolean => {
    const bookings = StorageService.getBookings();
    const filtered = bookings.filter((b) => b.id !== bookingId);
    safeSet(STORAGE_KEYS.BOOKINGS, filtered);

    // Remove from Firestore
    try {
      deleteDoc(doc(db, 'bookings', bookingId)).catch(console.warn);
    } catch (e) {
      console.warn('Booking delete cloud sync notice:', e);
    }
    return true;
  },

  // Blocked Dates
  getBlockedDates: (): BlockedDate[] => {
    return safeGet<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
  },

  addBlockedDate: (dateStr: string, reason: string, blockedBy = 'Admin'): BlockedDate => {
    const blockedDates = StorageService.getBlockedDates();
    const existingIndex = blockedDates.findIndex((b) => b.date === dateStr);
    const newEntry: BlockedDate = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      reason: reason.trim() || 'Blocked by Admin',
      blockedBy,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      blockedDates[existingIndex] = newEntry;
    } else {
      blockedDates.push(newEntry);
    }

    safeSet(STORAGE_KEYS.BLOCKED_DATES, blockedDates);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'blocked_dates', newEntry.id), newEntry).catch(console.warn);
    } catch (e) {
      console.warn('Blocked date cloud sync notice:', e);
    }

    return newEntry;
  },

  removeBlockedDate: (dateStr: string): boolean => {
    const blockedDates = StorageService.getBlockedDates();
    const entryToRemove = blockedDates.find((b) => b.date === dateStr);
    const filtered = blockedDates.filter((b) => b.date !== dateStr);
    safeSet(STORAGE_KEYS.BLOCKED_DATES, filtered);

    // Remove from Firestore
    if (entryToRemove) {
      try {
        deleteDoc(doc(db, 'blocked_dates', entryToRemove.id)).catch(console.warn);
      } catch (e) {
        console.warn('Blocked date delete sync notice:', e);
      }
    }
    return true;
  },

  // Villa & Contact Details
  getVillaDetails: (): VillaDetails => {
    const data = safeGet<VillaDetails>(STORAGE_KEYS.VILLA, DEFAULT_VILLA);
    return {
      ...DEFAULT_VILLA,
      ...data,
      basePricePerNight: data.basePricePerNight === 18500 ? 8000 : (data.basePricePerNight || 8000),
      bhk2Price: data.bhk2Price || 8000,
      bhk2MaxGuests: data.bhk2MaxGuests || 9,
      bhk3Price: data.bhk3Price || 11000,
      bhk3MaxGuests: data.bhk3MaxGuests || 12,
    };
  },

  saveVillaDetails: (details: VillaDetails): void => {
    safeSet(STORAGE_KEYS.VILLA, details);
    try {
      setDoc(doc(db, 'settings', 'villa'), details).catch(console.warn);
    } catch (e) {
      console.warn('Villa details sync notice:', e);
    }
  },

  getContactDetails: (): ContactDetails => {
    const data = safeGet<ContactDetails>(STORAGE_KEYS.CONTACT, DEFAULT_CONTACT);
    return {
      ...DEFAULT_CONTACT,
      ...data,
      phone: data.phone && !data.phone.includes('94471') ? data.phone : DEFAULT_CONTACT.phone,
      caretakerPhone: data.caretakerPhone || DEFAULT_CONTACT.caretakerPhone,
      email: data.email && !data.email.includes('reservations@') ? data.email : DEFAULT_CONTACT.email,
      whatsapp: data.whatsapp && !data.whatsapp.includes('94471') ? data.whatsapp : DEFAULT_CONTACT.whatsapp,
    };
  },

  saveContactDetails: (details: ContactDetails): void => {
    safeSet(STORAGE_KEYS.CONTACT, details);
    try {
      setDoc(doc(db, 'settings', 'contact'), details).catch(console.warn);
    } catch (e) {
      console.warn('Contact details sync notice:', e);
    }
  },

  // Gallery Photos
  getGalleryPhotos: (): GalleryItem[] => {
    return safeGet<GalleryItem[]>(STORAGE_KEYS.GALLERY, GALLERY_PHOTOS);
  },

  saveGalleryPhotos: (photos: GalleryItem[]): void => {
    safeSet(STORAGE_KEYS.GALLERY, photos);
    try {
      setDoc(doc(db, 'settings', 'gallery'), { photos }).catch(console.warn);
    } catch (e) {
      console.warn('Gallery photos sync notice:', e);
    }
  },

  addGalleryPhoto: (photo: GalleryItem): void => {
    const list = StorageService.getGalleryPhotos();
    const updated = [photo, ...list];
    StorageService.saveGalleryPhotos(updated);
  },

  updateGalleryPhoto: (id: string, updated: Partial<GalleryItem>): void => {
    const list = StorageService.getGalleryPhotos();
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updated };
      StorageService.saveGalleryPhotos([...list]);
    }
  },

  deleteGalleryPhoto: (id: string): void => {
    const list = StorageService.getGalleryPhotos();
    const filtered = list.filter((p) => p.id !== id);
    StorageService.saveGalleryPhotos(filtered);
  },

  resetGalleryPhotos: (): void => {
    StorageService.saveGalleryPhotos(GALLERY_PHOTOS);
  },

  // ----------------------------------------------------
  // Guest Reviews & Post-Stay Feedback System
  // ----------------------------------------------------
  getReviews: (): Review[] => {
    return safeGet<Review[]>(STORAGE_KEYS.REVIEWS, REVIEWS);
  },

  saveReviews: (reviews: Review[]): void => {
    safeSet(STORAGE_KEYS.REVIEWS, reviews);
  },

  addReview: (review: Review): void => {
    const list = StorageService.getReviews();
    const existsIndex = list.findIndex(
      (r) => (review.id && r.id === review.id) || (review.bookingId && r.bookingId === review.bookingId)
    );
    let updated: Review[];
    if (existsIndex >= 0) {
      updated = [...list];
      updated[existsIndex] = { ...updated[existsIndex], ...review };
    } else {
      updated = [review, ...list];
    }
    StorageService.saveReviews(updated);
    try {
      setDoc(doc(db, 'reviews', review.id), review).catch(console.warn);
    } catch (e) {
      console.warn('Review save firestore notice:', e);
    }
  },

  updateReview: (id: string, updatedFields: Partial<Review>): void => {
    const list = StorageService.getReviews();
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedFields };
      StorageService.saveReviews([...list]);
      try {
        setDoc(doc(db, 'reviews', id), list[idx]).catch(console.warn);
      } catch (e) {
        console.warn('Review update firestore notice:', e);
      }
    }
  },

  deleteReview: (id: string): void => {
    const list = StorageService.getReviews();
    const filtered = list.filter((r) => r.id !== id);
    StorageService.saveReviews(filtered);
    try {
      deleteDoc(doc(db, 'reviews', id)).catch(console.warn);
    } catch (e) {
      console.warn('Review delete firestore notice:', e);
    }
  },

  getReviewByBookingId: (bookingId: string): Review | undefined => {
    const list = StorageService.getReviews();
    return list.find((r) => r.bookingId === bookingId);
  },

  getReviewsByUserId: (userId: string): Review[] => {
    const list = StorageService.getReviews();
    return list.filter((r) => r.userId === userId);
  },

  // Availability verification helper
  isDateAvailable: (dateStr: string): { available: boolean; reason?: string } => {
    // 1. Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr + 'T00:00:00');
    if (targetDate < today) {
      return { available: false, reason: 'Past date' };
    }

    // 2. Check if blocked by admin
    const blockedDates = StorageService.getBlockedDates();
    const blocked = blockedDates.find((b) => b.date === dateStr);
    if (blocked) {
      return { available: false, reason: `Blocked: ${blocked.reason}` };
    }

    // 3. Check if occupied by existing confirmed booking
    const bookings = StorageService.getBookings();
    for (const booking of bookings) {
      if (booking.status === 'cancelled') continue;
      // Stays occupy nights from checkInDate up to (but not including) checkOutDate
      if (dateStr >= booking.checkInDate && dateStr < booking.checkOutDate) {
        return { available: false, reason: 'Reserved by Guest' };
      }
    }

    return { available: true };
  },

  // ----------------------------------------------------
  // Loyalty Points & Highland Rewards System
  // ----------------------------------------------------
  getLoyaltyVouchers: (userId?: string): LoyaltyVoucher[] => {
    const vouchers = safeGet<LoyaltyVoucher[]>(STORAGE_KEYS.LOYALTY_VOUCHERS, []);
    if (!userId) return vouchers;
    return vouchers.filter((v) => v.userId === userId);
  },

  saveLoyaltyVoucher: (voucher: LoyaltyVoucher): void => {
    const vouchers = safeGet<LoyaltyVoucher[]>(STORAGE_KEYS.LOYALTY_VOUCHERS, []);
    const idx = vouchers.findIndex((v) => v.id === voucher.id || v.code === voucher.code);
    if (idx >= 0) {
      vouchers[idx] = voucher;
    } else {
      vouchers.unshift(voucher);
    }
    safeSet(STORAGE_KEYS.LOYALTY_VOUCHERS, vouchers);
  },

  getLoyaltyAccount: (userId: string): LoyaltyAccount => {
    const userBookings = StorageService.getBookingsByUserId(userId);
    const validBookings = userBookings.filter((b) => b.status !== 'cancelled');
    const userVouchers = StorageService.getLoyaltyVouchers(userId);

    const transactions: LoyaltyTransaction[] = [];

    // 1. Welcome Membership Bonus (250 pts on registration)
    transactions.push({
      id: `tx_welcome_${userId}`,
      userId,
      type: 'earned_bonus',
      points: 250,
      description: 'Highland Club Welcome Membership Bonus',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    let stayPointsTotal = 0;

    // 2. Points earned per stay: 100 pts per night + 5% of stay amount in points
    validBookings.forEach((booking) => {
      const nightPoints = booking.totalNights * 100;
      const spendPoints = Math.round(booking.finalAmount * 0.05);
      const earned = nightPoints + spendPoints;
      stayPointsTotal += earned;

      transactions.push({
        id: `tx_stay_${booking.id}`,
        userId,
        type: 'earned_stay',
        points: earned,
        description: `Stay Points: ${booking.totalNights} Night(s) Stay (${booking.id})`,
        date: booking.createdAt,
        bookingId: booking.id,
      });
    });

    // 3. Points earned for post-stay reviews: 100 pts per verified review
    const userReviews = StorageService.getReviewsByUserId(userId);
    let reviewPointsTotal = 0;
    userReviews.forEach((review) => {
      reviewPointsTotal += 100;
      transactions.push({
        id: `tx_rev_${review.id}`,
        userId,
        type: 'earned_bonus',
        points: 100,
        description: `Verified Guest Review Bonus (+100 pts) - ${review.highlight || 'Stay Feedback'}`,
        date: review.createdAt || review.date || new Date().toISOString(),
        bookingId: review.bookingId,
      });
    });

    // 4. Points earned from Referring Friends (+500 pts per completed 1st booking)
    const userReferrals = StorageService.getReferralsByReferrer(userId);
    const completedReferrals = userReferrals.filter((r) => r.status === 'completed');
    let referralPointsTotal = 0;
    completedReferrals.forEach((ref) => {
      const pts = ref.pointsAwarded || 500;
      referralPointsTotal += pts;
      transactions.push({
        id: `tx_ref_${ref.id}`,
        userId,
        type: 'earned_referral',
        points: pts,
        description: `Friend Referral Bonus (+${pts} pts): ${ref.referredUserName} completed 1st booking (${ref.bookingId})`,
        date: ref.completedAt || ref.createdAt,
        bookingId: ref.bookingId,
        referralId: ref.id,
      });
    });

    // 5. Points redeemed for discount vouchers
    let redeemedPointsTotal = 0;
    let totalSavingsINR = 0;

    userVouchers.forEach((v) => {
      redeemedPointsTotal += v.pointsRedeemed;
      if (v.status === 'used') {
        totalSavingsINR += v.discountAmount;
      }
      transactions.push({
        id: `tx_red_${v.id}`,
        userId,
        type: 'redeemed_discount',
        points: -v.pointsRedeemed,
        description: `Redeemed for ₹${v.discountAmount.toLocaleString()} Discount Voucher (${v.code})`,
        date: v.createdAt,
      });
    });

    // Sort transactions newest first
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lifetimePoints = 250 + stayPointsTotal + reviewPointsTotal + referralPointsTotal;
    const currentPoints = Math.max(0, lifetimePoints - redeemedPointsTotal);

    // Booking History Statistics
    const totalBookings = userBookings.length;
    const validBookingsCount = validBookings.length;
    const completedBookingsCount = validBookings.filter(
      (b) => b.status === 'completed' || new Date(`${b.checkOutDate}T11:00:00`).getTime() <= Date.now()
    ).length;
    const totalNightsStayed = validBookings.reduce((acc, b) => acc + (b.totalNights || 1), 0);
    const totalSpendINR = validBookings.reduce((acc, b) => acc + (b.finalAmount || 0), 0);

    // Categorize into Silver, Gold, or Platinum tiers based on booking history:
    // • Platinum Tier: 5+ bookings OR 10+ nights stayed OR 3,500+ stay points OR ₹75,000+ total spend
    // • Gold Tier: 2+ bookings OR 5+ nights stayed OR 1,500+ stay points OR ₹30,000+ total spend
    // • Silver Tier: 0 to 1 booking / < 5 nights / < 1,500 stay points
    let tier: LoyaltyTier = 'Silver';
    let tierQualifiedBy: BookingHistoryTierStats['tierQualifiedBy'] = 'welcome';
    let qualificationReason = 'Silver Explorer: Welcome tier for new and emerging guests.';
    let nextTier: LoyaltyTier | null = 'Gold';
    let nextTierPoints = 1500;
    let progressPercent = 0;
    let bookingsNeededForNextTier = 0;
    let nightsNeededForNextTier = 0;
    let pointsNeededForNextTier = 0;
    let spendNeededForNextTier = 0;

    if (validBookingsCount >= 5 || totalNightsStayed >= 10 || stayPointsTotal >= 3500 || totalSpendINR >= 75000) {
      tier = 'Platinum';
      nextTier = null;
      nextTierPoints = 3500;
      progressPercent = 100;
      bookingsNeededForNextTier = 0;
      nightsNeededForNextTier = 0;
      pointsNeededForNextTier = 0;
      spendNeededForNextTier = 0;

      if (validBookingsCount >= 5) {
        tierQualifiedBy = 'bookings_count';
        qualificationReason = `Platinum VIP Status achieved with ${validBookingsCount} bookings on record!`;
      } else if (totalNightsStayed >= 10) {
        tierQualifiedBy = 'nights_stayed';
        qualificationReason = `Platinum VIP Status achieved with ${totalNightsStayed} nights stayed in Vagamon!`;
      } else if (stayPointsTotal >= 3500) {
        tierQualifiedBy = 'stay_points';
        qualificationReason = `Platinum VIP Status achieved with ${stayPointsTotal.toLocaleString()} stay points earned!`;
      } else {
        tierQualifiedBy = 'spend_total';
        qualificationReason = `Platinum VIP Status achieved with ₹${totalSpendINR.toLocaleString()} total holiday spend!`;
      }
    } else if (validBookingsCount >= 2 || totalNightsStayed >= 5 || stayPointsTotal >= 1500 || totalSpendINR >= 30000) {
      tier = 'Gold';
      nextTier = 'Platinum';
      nextTierPoints = 3500;
      bookingsNeededForNextTier = Math.max(0, 5 - validBookingsCount);
      nightsNeededForNextTier = Math.max(0, 10 - totalNightsStayed);
      pointsNeededForNextTier = Math.max(0, 3500 - stayPointsTotal);
      spendNeededForNextTier = Math.max(0, 75000 - totalSpendINR);

      const pByBookings = Math.round(((validBookingsCount - 2) / 3) * 100);
      const pByNights = Math.round(((totalNightsStayed - 5) / 5) * 100);
      const pByPoints = Math.round(((stayPointsTotal - 1500) / 2000) * 100);
      progressPercent = Math.min(99, Math.max(15, Math.max(pByBookings, pByNights, pByPoints)));

      if (validBookingsCount >= 2) {
        tierQualifiedBy = 'bookings_count';
        qualificationReason = `Gold Status achieved with ${validBookingsCount} bookings on record!`;
      } else if (totalNightsStayed >= 5) {
        tierQualifiedBy = 'nights_stayed';
        qualificationReason = `Gold Status achieved with ${totalNightsStayed} nights stayed!`;
      } else if (stayPointsTotal >= 1500) {
        tierQualifiedBy = 'stay_points';
        qualificationReason = `Gold Status achieved with ${stayPointsTotal.toLocaleString()} stay points earned!`;
      } else {
        tierQualifiedBy = 'spend_total';
        qualificationReason = `Gold Status achieved with ₹${totalSpendINR.toLocaleString()} total holiday spend!`;
      }
    } else {
      tier = 'Silver';
      nextTier = 'Gold';
      nextTierPoints = 1500;
      bookingsNeededForNextTier = Math.max(1, 2 - validBookingsCount);
      nightsNeededForNextTier = Math.max(1, 5 - totalNightsStayed);
      pointsNeededForNextTier = Math.max(0, 1500 - stayPointsTotal);
      spendNeededForNextTier = Math.max(0, 30000 - totalSpendINR);

      const pByBookings = Math.round((validBookingsCount / 2) * 100);
      const pByNights = Math.round((totalNightsStayed / 5) * 100);
      const pByPoints = Math.round((stayPointsTotal / 1500) * 100);
      progressPercent = Math.min(99, Math.max(0, Math.max(pByBookings, pByNights, pByPoints)));

      if (validBookingsCount === 1) {
        tierQualifiedBy = 'bookings_count';
        qualificationReason = `Silver Member with 1 booking recorded. Complete 1 more booking to unlock Gold Tier!`;
      } else {
        tierQualifiedBy = 'welcome';
        qualificationReason = `Silver Explorer Member. Book your first luxury stay to start earning tier rewards!`;
      }
    }

    const userObj = StorageService.getUsers().find((u) => u.id === userId);
    const referralCode = userObj ? StorageService.getUserReferralCode(userObj) : 'FRIEND-CHV';

    const tierStats: BookingHistoryTierStats = {
      totalBookings,
      validBookingsCount,
      completedBookingsCount,
      totalNightsStayed,
      totalSpendINR,
      stayPointsEarned: stayPointsTotal,
      bonusPointsEarned: 250 + reviewPointsTotal + referralPointsTotal,
      tierQualifiedBy,
      qualificationReason,
      nextTier,
      bookingsNeededForNextTier,
      nightsNeededForNextTier,
      pointsNeededForNextTier,
      spendNeededForNextTier,
    };

    return {
      userId,
      currentPoints,
      lifetimePoints,
      tier,
      nextTierPoints,
      progressPercent,
      totalSavingsINR,
      referralPointsEarned: referralPointsTotal,
      referralsCount: completedReferrals.length,
      referralCode,
      transactions,
      vouchers: userVouchers,
      referrals: userReferrals,
      tierStats,
    };
  },

  redeemPointsForVoucher: (
    userId: string,
    pointsToRedeem: number,
    discountAmount: number,
    description: string
  ): { success: boolean; voucher?: LoyaltyVoucher; message?: string } => {
    const account = StorageService.getLoyaltyAccount(userId);
    if (account.currentPoints < pointsToRedeem) {
      return {
        success: false,
        message: `Insufficient points balance. You currently have ${account.currentPoints} pts, but ${pointsToRedeem} pts are required.`,
      };
    }

    const randomCode = `CHV-${discountAmount}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6); // Valid for 6 months

    const voucher: LoyaltyVoucher = {
      id: `vch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      code: randomCode,
      pointsRedeemed: pointsToRedeem,
      discountAmount,
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      description,
    };

    StorageService.saveLoyaltyVoucher(voucher);
    return {
      success: true,
      voucher,
      message: `Successfully redeemed ${pointsToRedeem} points for a ₹${discountAmount.toLocaleString()} discount voucher!`,
    };
  },

  validateLoyaltyVoucher: (
    code: string
  ): { valid: boolean; discountAmount: number; voucher?: LoyaltyVoucher; message?: string } => {
    const cleanCode = code.trim().toUpperCase();
    const vouchers = safeGet<LoyaltyVoucher[]>(STORAGE_KEYS.LOYALTY_VOUCHERS, []);
    const found = vouchers.find((v) => v.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Invalid loyalty voucher code.' };
    }

    if (found.status === 'used') {
      return { valid: false, discountAmount: 0, message: 'This discount voucher has already been used.' };
    }

    if (new Date(found.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: 'This loyalty voucher has expired.' };
    }

    return {
      valid: true,
      discountAmount: found.discountAmount,
      voucher: found,
      message: `Loyalty Voucher Applied: ₹${found.discountAmount.toLocaleString()} off your stay!`,
    };
  },

  markLoyaltyVoucherUsed: (code: string, bookingId: string): void => {
    const cleanCode = code.trim().toUpperCase();
    const vouchers = safeGet<LoyaltyVoucher[]>(STORAGE_KEYS.LOYALTY_VOUCHERS, []);
    const idx = vouchers.findIndex((v) => v.code.toUpperCase() === cleanCode);
    if (idx >= 0) {
      vouchers[idx].status = 'used';
      vouchers[idx].usedInBookingId = bookingId;
      safeSet(STORAGE_KEYS.LOYALTY_VOUCHERS, vouchers);
    }
  },

  // -------------------------------------------------------------
  // REFERRAL SYSTEM METHODS
  // -------------------------------------------------------------
  getReferrals: (): Referral[] => {
    return safeGet<Referral[]>(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
  },

  getReferralsByReferrer: (referrerUserId: string): Referral[] => {
    const list = StorageService.getReferrals();
    return list.filter((r) => r.referrerUserId === referrerUserId);
  },

  saveReferral: (referral: Referral): void => {
    const list = StorageService.getReferrals();
    const idx = list.findIndex((r) => r.id === referral.id);
    let updated: Referral[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...updated[idx], ...referral };
    } else {
      updated = [referral, ...list];
    }
    safeSet(STORAGE_KEYS.REFERRALS, updated);
    try {
      setDoc(doc(db, 'referrals', referral.id), referral).catch(console.warn);
    } catch (e) {
      console.warn('Referral firestore sync notice:', e);
    }
  },

  validateReferralCode: (
    code: string,
    currentUserId?: string,
    userEmail?: string
  ): {
    valid: boolean;
    referrer?: User;
    discountAmount: number;
    pointsAwarded: number;
    message: string;
  } => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        discountAmount: 0,
        pointsAwarded: 0,
        message: 'Please enter a referral code.',
      };
    }

    const users = StorageService.getUsers();
    const referrer = users.find(
      (u) =>
        (u.referralCode && u.referralCode.toUpperCase() === cleanCode) ||
        `${(u.name.trim().split(' ')[0] || 'GUEST').toUpperCase().replace(/[^A-Z]/g, '')}-CHV` === cleanCode
    );

    if (!referrer) {
      return {
        valid: false,
        discountAmount: 0,
        pointsAwarded: 0,
        message: `Referral code "${cleanCode}" was not recognized. Please check with your friend.`,
      };
    }

    // Prevent self-referral
    if (
      (currentUserId && referrer.id === currentUserId) ||
      (userEmail && referrer.email.toLowerCase() === userEmail.trim().toLowerCase())
    ) {
      return {
        valid: false,
        discountAmount: 0,
        pointsAwarded: 0,
        message: 'You cannot use your own referral code.',
      };
    }

    // Must be first booking for this guest
    const allBookings = StorageService.getBookings();
    const priorBookings = allBookings.filter(
      (b) =>
        b.status !== 'cancelled' &&
        ((currentUserId && b.userId === currentUserId) ||
          (userEmail && b.userEmail.toLowerCase() === userEmail.trim().toLowerCase()))
    );

    if (priorBookings.length > 0) {
      return {
        valid: false,
        discountAmount: 0,
        pointsAwarded: 0,
        message: 'Friend referral discounts and rewards are exclusively valid on your first booking at Cloud Heaven.',
      };
    }

    return {
      valid: true,
      referrer,
      discountAmount: 1000,
      pointsAwarded: 500,
      message: `Referral code applied! You receive ₹1,000 off your first stay, and ${referrer.name} earns +500 loyalty points upon booking completion.`,
    };
  },

  // Reset to sample initial state if needed
  resetToDefaults: (): void => {
    safeSet(STORAGE_KEYS.USERS, INITIAL_USERS);
    safeSet(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    safeSet(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
    safeSet(STORAGE_KEYS.VILLA, DEFAULT_VILLA);
    safeSet(STORAGE_KEYS.CONTACT, DEFAULT_CONTACT);
    safeSet(STORAGE_KEYS.REVIEWS, REVIEWS);
    safeSet(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
  },
};

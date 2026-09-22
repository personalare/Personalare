import { VillaDetails, ContactDetails, BookingAddon, Review, User, BlockedDate, Booking, GalleryItem, Referral } from '../types';

export const DEFAULT_VILLA: VillaDetails = {
  name: 'Cloud Heaven',
  location: 'Vagamon, Idukki, Kerala',
  tagline: 'Private Luxury Villa Amidst The Misty Valley',
  description:
    'Perched gracefully on the emerald cliffs of Vagamon, Cloud Heaven is an exclusive private estate sanctuary. Offering 2BHK (up to 9 guests @ ₹8,000/night) and 3BHK (up to 12 guests @ ₹11,000/night) private luxury stays with an expansive private pool gazing over rolling tea plantations and swirling cloud beds, scenic lounges, evening campfire, off-road jeep safari, arrival/departure cab assistance, and personal caretaker support.',
  checkInTime: '2:00 PM',
  checkOutTime: '11:00 AM',
  basePricePerNight: 8000, // INR for 2BHK (9 Pax)
  bhk2Price: 8000, // 9 pax
  bhk2MaxGuests: 9,
  bhk3Price: 11000, // 12 pax
  bhk3MaxGuests: 12,
  weekendPricePerNight: 8500,
  taxRatePercent: 12,
  maxGuests: 12,
  bedrooms: 3,
  bathrooms: 4,
  poolType: 'Private Temperature-Controlled Infinity Pool',
  images: {
    hero: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80', // luxury modern villa overlooking hills
    pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', // luxury private infinity pool overlooking mountains
    bedroom: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', // luxury master suite
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', // minimalist modern living room
    balcony: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', // outdoor deck / villa view
    mistValley: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', // misty mountains
  },
};

export const DEFAULT_CONTACT: ContactDetails = {
  phone: '+91 89250 14660', // Booking
  altPhone: '+91 73589 56101', // Caretaker
  caretakerName: 'Resort Caretaker',
  caretakerPhone: '+91 73589 56101',
  email: 'cloudheavenresort@gmail.com',
  supportEmail: 'cloudheavenresort@gmail.com',
  whatsapp: '+91 89250 14660',
  address: 'Cliff View Ridge, Kurisumala Ashram Road, Vagamon, Idukki District',
  landmark: 'Near Pine Forest & Kurisumala View Point',
  city: 'Vagamon',
  state: 'Kerala',
  pincode: '685503',
  googleMapsUrl: 'https://maps.google.com/?q=Vagamon+Kerala',
};

export const AVAILABLE_ADDONS: BookingAddon[] = [
  {
    id: 'campfire',
    name: 'Campfire Setup & Firewood',
    price: 750,
    description: 'Evening private campfire setup with seasoned firewood on the lawn overlooking the misty valley.',
  },
  {
    id: 'jeep-safari',
    name: 'Off-Road Vagamon Jeep Safari',
    price: 3000,
    description: 'Guided 3-hour 4x4 private adventure to Kolahalamedu waterfalls, hidden pine valleys & misty peaks.',
  },
  {
    id: 'cab-booking',
    name: 'Cab Booking for Arrival & Departure',
    price: 2500,
    description: 'Comfortable private chauffeur cab for Cochin Airport, Kottayam Railway Station, or local sightseeing.',
  },
  {
    id: 'floating-breakfast',
    name: 'Floating Pool Breakfast Platter',
    price: 1500,
    description: 'Artisanal tropical breakfast platter served on a floating wicker basket in the private infinity pool.',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Resort Admin',
    email: 'cloudheavenresort@gmail.com',
    phone: '+91 89250 14660',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    referralCode: 'ADMIN-CHV',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Mathew',
    email: 'sarah.mathew@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    createdAt: '2026-07-15T10:30:00Z',
    referralCode: 'SARAH-CHV',
  },
  {
    id: 'usr_rahul',
    name: 'Rahul Nair',
    email: 'rahul.nair@example.com',
    phone: '+91 91234 56789',
    role: 'customer',
    createdAt: '2026-08-01T14:20:00Z',
    referralCode: 'RAHUL-CHV',
  },
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref_sample_1',
    referrerUserId: 'usr_sarah',
    referrerName: 'Sarah Mathew',
    referrerEmail: 'sarah.mathew@example.com',
    referralCode: 'SARAH-CHV',
    referredUserId: 'usr_ananya',
    referredUserName: 'Ananya Verma',
    referredUserEmail: 'ananya.verma@example.com',
    bookingId: 'CHV-48201',
    bookingAmount: 18000,
    pointsAwarded: 500,
    friendDiscountAmount: 1000,
    status: 'completed',
    createdAt: '2026-08-18T11:20:00Z',
    completedAt: '2026-08-20T14:00:00Z',
  },
];

export const INITIAL_BLOCKED_DATES: BlockedDate[] = [
  {
    id: 'blk_1',
    date: '2026-08-28',
    reason: 'Private Infinity Pool Deep Cleaning & Maintenance',
    blockedBy: 'Admin',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'blk_2',
    date: '2026-08-29',
    reason: 'Annual Monsoon Estate Landscaping Restoration',
    blockedBy: 'Admin',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'blk_3',
    date: '2026-09-12',
    reason: 'Owner VIP Private Family Event',
    blockedBy: 'Admin',
    createdAt: '2026-08-12T11:00:00Z',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'CHV-94281',
    userId: 'usr_sarah',
    userName: 'Sarah Mathew',
    userEmail: 'sarah.mathew@example.com',
    userPhone: '+91 98765 43210',
    villaType: '2bhk',
    villaTypeLabel: '2 BHK Luxury Villa (Up to 9 Pax)',
    checkInDate: '2026-08-24',
    checkOutDate: '2026-08-26',
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    guests: { adults: 4, children: 1 },
    totalNights: 2,
    basePricePerNight: 8000,
    addons: [
      {
        id: 'floating-breakfast',
        name: 'Floating Pool Breakfast',
        price: 1800,
        description: 'Artisanal tropical breakfast platter served on a floating wicker basket in the private pool.',
      },
    ],
    totalAmount: 17800,
    taxAmount: 2136,
    finalAmount: 19936,
    status: 'confirmed',
    specialRequests: 'Late arrival around 4 PM. Extra pool towels requested.',
    createdAt: '2026-08-14T15:00:00Z',
    bookingSource: 'website',
    paymentMode: 'upi',
    paymentStatus: 'paid',
    advancePaid: 19936,
    balanceAmount: 0,
    upiTransactionId: 'UPI982347102941',
    upiApp: 'gpay',
    paymentNotes: 'Full payment completed online via UPI GPay',
    paymentHistory: [
      {
        id: 'pay_1',
        amount: 19936,
        date: '2026-08-14T15:05:00Z',
        mode: 'upi',
        referenceId: 'UPI982347102941',
        notes: 'Online Website Booking (GPay)',
        recordedBy: 'Guest',
      },
    ],
  },
  {
    id: 'CHV-81042',
    userId: 'usr_rahul',
    userName: 'Rahul Nair',
    userEmail: 'rahul.nair@example.com',
    userPhone: '+91 91234 56789',
    villaType: '3bhk',
    villaTypeLabel: '3 BHK Luxury Villa (Up to 12 Pax)',
    checkInDate: '2026-09-04',
    checkOutDate: '2026-09-07',
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    guests: { adults: 6, children: 0 },
    totalNights: 3,
    basePricePerNight: 11000,
    addons: [
      {
        id: 'bonfire-bbq',
        name: 'Private Bonfire & Live BBQ Night',
        price: 3500,
        description: 'Campfire setup on the private lawn with marinated chef specialties.',
      },
      {
        id: 'jeep-safari',
        name: 'Vagamon Off-Road Jeep Trek',
        price: 2800,
        description: 'Guided 3-hour 4x4 private excursion.',
      },
    ],
    totalAmount: 39300,
    taxAmount: 4716,
    finalAmount: 44016,
    status: 'confirmed',
    specialRequests: 'Celebrating 5th wedding anniversary.',
    createdAt: '2026-08-16T18:45:00Z',
    bookingSource: 'offline_admin',
    paymentMode: 'upi',
    paymentStatus: 'partially_paid',
    advancePaid: 20000,
    balanceAmount: 24016,
    upiTransactionId: 'UPI771298401923',
    upiApp: 'phonepe',
    paymentNotes: '₹20,000 advance received via PhonePe. Balance ₹24,016 due on check-in.',
    paymentHistory: [
      {
        id: 'pay_2',
        amount: 20000,
        date: '2026-08-16T18:50:00Z',
        mode: 'upi',
        referenceId: 'UPI771298401923',
        notes: 'Advance part payment received by Admin (PhonePe)',
        recordedBy: 'Admin',
      },
    ],
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    userName: 'Dr. Anand Varma',
    userLocation: 'Kochi, Kerala',
    rating: 5,
    date: 'August 2026',
    highlight: 'Pure privacy with the mist swirling right into the pool',
    comment:
      'Cloud Heaven is unlike any resort in Vagamon. You get the whole villa entirely to yourself. Swimming in the temperature-regulated infinity pool with clouds drifting right above your head is magical. Check-in at 2 PM was seamless and the caretaker made stellar Kerala cuisine.',
  },
  {
    id: 'rev_2',
    userName: 'Priya & Siddharth Rao',
    userLocation: 'Bangalore, Karnataka',
    rating: 5,
    date: 'July 2026',
    highlight: 'The ultimate luxury hideaway in the Western Ghats',
    comment:
      'We stayed for 3 nights. The rooms are spotless and designed with tasteful minimalism. Watching the sunrise from the private deck while having morning coffee was our favorite part. 10/10 recommendation!',
  },
  {
    id: 'rev_3',
    userName: 'Michael & Elena D’Souza',
    userLocation: 'Dubai, UAE',
    rating: 5,
    date: 'June 2026',
    highlight: 'Private pool villa bliss for our family reunion',
    comment:
      'Spacious 3 king suites, incredible mountain views, private campfire with barbecue, and total peace without crowded lobbies. We are definitely coming back next season.',
  },
];

export const GALLERY_PHOTOS: GalleryItem[] = [
  // --- Villa Interior ---
  {
    id: 'gal-int-1',
    title: 'Master Pine Suite',
    category: 'interior',
    categoryLabel: 'Villa Interior',
    description: 'Ultra-luxury king suite with custom teak finishes, down bedding, and wrap-around glass overlooking pine slopes.',
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=90',
    altText: 'Master king bedroom with large glass windows looking into forest at Cloud Heaven',
    featured: true,
  },
  {
    id: 'gal-int-2',
    title: 'Panoramic Living Lounge',
    category: 'interior',
    categoryLabel: 'Villa Interior',
    description: 'Double-height ceiling living hall with plush low-profile sofas, fireplace hearth, and uninterrupted valley views.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90',
    altText: 'Spacious minimalist living lounge with teak wood elements and large windows',
    featured: true,
  },
  {
    id: 'gal-int-3',
    title: 'Ensuite Stone Spa Bathroom',
    category: 'interior',
    categoryLabel: 'Villa Interior',
    description: 'Natural riverstone spa bathroom with freestanding soaking tub and skylight rain shower.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2000&q=90',
    altText: 'Luxury modern ensuite bathroom with deep soaking tub and rain shower',
  },
  {
    id: 'gal-int-4',
    title: 'Gourmet Teak Dining & Kitchen',
    category: 'interior',
    categoryLabel: 'Villa Interior',
    description: 'Handcrafted solid teak dining table seating 10, equipped with modern induction bar and specialty coffee station.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
    altText: 'Modern open kitchen and warm wooden dining table inside Cloud Heaven villa',
  },

  // --- Villa Exterior ---
  {
    id: 'gal-ext-1',
    title: 'Contemporary Estate Architecture',
    category: 'exterior',
    categoryLabel: 'Villa Exterior',
    description: 'Striking bioclimatic architecture blending exposed stone, dark timber, and expansive glass cantilevered over the hill.',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=90',
    altText: 'Modern luxury architectural villa perched on green hillside at Cloud Heaven Vagamon',
    featured: true,
  },
  {
    id: 'gal-ext-2',
    title: 'Misty Sunrise Balcony Deck',
    category: 'exterior',
    categoryLabel: 'Villa Exterior',
    description: 'Spacious cantilevered timber deck with lounge seating to watch early morning cloud inversions roll in.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90',
    altText: 'Outdoor terrace balcony looking over green hills and mist at sunrise',
  },
  {
    id: 'gal-ext-3',
    title: 'Private Campfire Lawn & BBQ Pit',
    category: 'exterior',
    categoryLabel: 'Villa Exterior',
    description: 'Manicured tropical lawn fitted with a circular stone fire pit and outdoor dining under starry hill skies.',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=90',
    altText: 'Lush green estate lawn with stone paths and peaceful outdoor sitting areas',
  },
  {
    id: 'gal-ext-4',
    title: 'Stone Walkway & Tea Garden Courtyard',
    category: 'exterior',
    categoryLabel: 'Villa Exterior',
    description: 'Private pathway winding through cardamom plants, wild ferns, and estate tea shrubs leading to the entrance.',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=90',
    altText: 'Architectural facade with private courtyard and mountain greenery',
  },

  // --- Swimming Pool ---
  {
    id: 'gal-pool-1',
    title: 'Valley Infinity Edge Pool',
    category: 'pool',
    categoryLabel: 'Swimming Pool',
    description: 'Private temperature-regulated infinity pool seemingly spilling straight into the deep Vagamon valley.',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=2000&q=90',
    altText: 'Private infinity swimming pool overlooking mountains at Cloud Heaven',
    featured: true,
  },
  {
    id: 'gal-pool-2',
    title: 'Floating Pool Breakfast Experience',
    category: 'pool',
    categoryLabel: 'Swimming Pool',
    description: 'Artisanal tropical breakfast platter served on a floating woven basket inside the heated infinity pool.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=90',
    altText: 'Floating breakfast platter with fresh fruits and pastries in resort swimming pool',
  },
  {
    id: 'gal-pool-3',
    title: 'Poolside Timber Sun Deck',
    category: 'pool',
    categoryLabel: 'Swimming Pool',
    description: 'Solid teak recliners, parasols, and plush bath sheets for post-swim relaxation in the hill breeze.',
    imageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=2000&q=90',
    altText: 'Sun deck loungers by the crystal clear swimming pool overlooking natural scenery',
  },
  {
    id: 'gal-pool-4',
    title: 'Evening Ambient Night Lighting',
    category: 'pool',
    categoryLabel: 'Swimming Pool',
    description: 'Warm underwater fiber-optic lighting casting a celestial glow over the swimming pool under foggy skies.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=90',
    altText: 'Illuminated infinity pool at dusk with glowing warm lights and mountain silhouette',
  },

  // --- Scenic Views of Vagamon ---
  {
    id: 'gal-scenic-1',
    title: 'Vagamon Pine Forest Canopy',
    category: 'scenic',
    categoryLabel: 'Scenic Views of Vagamon',
    description: 'Towering pine forest located 5 minutes from the villa, bathed in mystical morning fog and sun rays.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=90',
    altText: 'Sunbeams piercing through majestic pine trees in Vagamon pine forest',
    featured: true,
  },
  {
    id: 'gal-scenic-2',
    title: 'Emerald Tea Plantation Valleys',
    category: 'scenic',
    categoryLabel: 'Scenic Views of Vagamon',
    description: 'Undulating carpet of emerald tea gardens cascading down the mist-blanketed Western Ghats slopes.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=90',
    altText: 'Rolling green tea plantations in the misty hills of Vagamon Kerala',
  },
  {
    id: 'gal-scenic-3',
    title: 'Kurisumala Cloud Inversions',
    category: 'scenic',
    categoryLabel: 'Scenic Views of Vagamon',
    description: 'Thick white sea of clouds blanketing the valley below while peaks rise like islands into the blue sky.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=90',
    altText: 'Cloud inversion over rugged mountain peaks in the Western Ghats',
  },
  {
    id: 'gal-scenic-4',
    title: 'Golden Sunset over Vagamon Ridge',
    category: 'scenic',
    categoryLabel: 'Scenic Views of Vagamon',
    description: 'Spectacular sunset painting the misty hill horizon in vibrant amber, rose, and gold hues.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=90',
    altText: 'Warm golden sunset sky over mountain ridge with clouds',
  },
];

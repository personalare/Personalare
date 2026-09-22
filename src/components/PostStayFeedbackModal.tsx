import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Bed,
  Waves,
  Coffee,
  Flame,
  Compass,
  ThumbsUp,
  Award,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Booking, Review } from '../types';
import { StorageService } from '../services/storageService';

interface PostStayFeedbackModalProps {
  isOpen: boolean;
  booking: Booking | null;
  existingReview?: Review | null;
  onClose: () => void;
  onSubmitSuccess: (review: Review, isNew: boolean) => void;
}

const AMENITY_TAGS = [
  { id: 'pool', label: 'Private Infinity Pool', icon: Waves },
  { id: 'mist', label: 'Misty Valley Views', icon: Compass },
  { id: 'campfire', label: 'Evening Campfire Setup', icon: Flame },
  { id: 'hospitality', label: 'Caretaker & Kerala Food', icon: Coffee },
  { id: 'safari', label: 'Off-Road Jeep Safari', icon: Compass },
  { id: 'suites', label: 'Spacious King Master Suites', icon: Bed },
  { id: 'privacy', label: 'Total Privacy & Seclusion', icon: ShieldCheck },
  { id: 'cleanliness', label: 'Spotless Hygiene & Luxury', icon: Sparkles },
];

const RATING_DESCRIPTIONS: Record<number, { label: string; desc: string; color: string }> = {
  5: {
    label: 'Exceptional (5/5)',
    desc: 'Heaven on Earth! Breathtaking valley views, pristine private pool, and unmatched serenity.',
    color: 'text-amber-500',
  },
  4: {
    label: 'Wonderful (4/5)',
    desc: 'Very enjoyable and relaxing stay with great amenities and hospitable service.',
    color: 'text-emerald-600',
  },
  3: {
    label: 'Average (3/5)',
    desc: 'Decent stay overall, met basic expectations with a few areas for improvement.',
    color: 'text-amber-600',
  },
  2: {
    label: 'Below Expectations (2/5)',
    desc: 'Encountered multiple inconveniences during the stay.',
    color: 'text-orange-600',
  },
  1: {
    label: 'Disappointing (1/5)',
    desc: 'Substantial issues experienced during the reservation.',
    color: 'text-rose-600',
  },
};

export const PostStayFeedbackModal: React.FC<PostStayFeedbackModalProps> = ({
  isOpen,
  booking,
  existingReview,
  onClose,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Category breakdown ratings
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 5,
    hospitality: 5,
    poolExperience: 5,
    viewsLocation: 5,
    valueForMoney: 5,
  });

  const [highlight, setHighlight] = useState('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['pool', 'mist']);
  const [recommended, setRecommended] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      if (existingReview) {
        setRating(existingReview.rating || 5);
        setHighlight(existingReview.highlight || '');
        setComment(existingReview.comment || '');
        setUserName(existingReview.userName || booking.userName);
        setUserLocation(existingReview.userLocation || 'Kochi, Kerala');
        if (existingReview.categoryRatings) {
          setCategoryRatings(existingReview.categoryRatings);
        }
        if (existingReview.favoriteAmenities) {
          setSelectedAmenities(existingReview.favoriteAmenities);
        }
        if (typeof existingReview.recommended === 'boolean') {
          setRecommended(existingReview.recommended);
        }
      } else {
        // Defaults for new review
        setRating(5);
        setCategoryRatings({
          cleanliness: 5,
          hospitality: 5,
          poolExperience: 5,
          viewsLocation: 5,
          valueForMoney: 5,
        });
        setHighlight('Unforgettable misty valley mornings and complete private pool luxury');
        setComment(
          'Our stay at Cloud Heaven exceeded our expectations. The infinity pool overlooking the hills with morning clouds rolling in was breathtaking. The villa was immaculate, the bedrooms spacious and peaceful, and the caretaker was exceptionally helpful.'
        );
        setUserName(booking.userName || '');
        setUserLocation('Kochi, Kerala');
        setSelectedAmenities(['pool', 'mist', 'hospitality', 'privacy']);
        setRecommended(true);
      }
      setErrorMsg(null);
    }
  }, [booking, existingReview, isOpen]);

  if (!isOpen || !booking) return null;

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (cat: keyof typeof categoryRatings, val: number) => {
    setCategoryRatings((prev) => ({ ...prev, [cat]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlight.trim()) {
      setErrorMsg('Please enter a brief highlight or headline for your review.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 15) {
      setErrorMsg('Please share a few sentences about your experience (minimum 15 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isNew = !existingReview;
      const reviewDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const reviewData: Review = {
        id: existingReview?.id || `rev_${booking.id}_${Date.now().toString(36)}`,
        bookingId: booking.id,
        userId: booking.userId,
        userName: userName.trim() || booking.userName,
        userLocation: userLocation.trim() || 'Kerala, India',
        rating,
        categoryRatings,
        highlight: highlight.trim(),
        comment: comment.trim(),
        favoriteAmenities: selectedAmenities,
        recommended,
        villaType: booking.villaType || '2bhk',
        date: existingReview?.date || reviewDate,
        createdAt: existingReview?.createdAt || new Date().toISOString(),
      };

      StorageService.addReview(reviewData);

      setIsSubmitting(false);
      onSubmitSuccess(reviewData, isNew);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setIsSubmitting(false);
      setErrorMsg('Could not save your review. Please try again.');
    }
  };

  const currentDisplayRating = hoverRating || rating;
  const ratingInfo = RATING_DESCRIPTIONS[currentDisplayRating] || RATING_DESCRIPTIONS[5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-gray-900"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Guest Feedback &bull; Post-Stay Review</span>
          </div>

          <h2 className="font-serif text-2xl font-bold mt-1 text-white">
            {existingReview ? 'Update Your Stay Review' : 'How was your stay at Cloud Heaven?'}
          </h2>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 font-medium">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              {booking.checkInDate} &rarr; {booking.checkOutDate} ({booking.totalNights} Nights)
            </span>
            <span className="bg-emerald-800/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              Ref: <strong className="text-white font-mono">{booking.id}</strong>
            </span>
            <span className="bg-emerald-800/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              {booking.villaTypeLabel || (booking.villaType === '3bhk' ? '3 BHK Villa' : '2 BHK Villa')}
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reward Alert Banner */}
          {!existingReview && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-950">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <strong className="block text-xs font-bold text-amber-900">
                  Earn +100 Highland Loyalty Points!
                </strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  As a verified guest, submitting your feedback helps future travelers and instantly credits <strong>100 reward points</strong> to your Cloud Heaven account.
                </p>
              </div>
            </div>
          )}

          {/* Overall Star Rating Section */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5 text-center space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Overall Stay Rating
            </label>

            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isActive = starVal <= currentDisplayRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-xl transition-all hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                        isActive
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                          : 'text-gray-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="space-y-0.5">
              <div className={`font-serif text-base font-bold ${ratingInfo.color}`}>
                {ratingInfo.label}
              </div>
              <div className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                {ratingInfo.desc}
              </div>
            </div>
          </div>

          {/* Category Aspect Ratings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Rate Specific Aspects
              </label>
              <span className="text-[11px] text-gray-400">Click stars to rate (1 - 5)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'cleanliness', label: 'Cleanliness & Comfort' },
                { key: 'poolExperience', label: 'Private Infinity Pool' },
                { key: 'hospitality', label: 'Caretaker & Hospitality' },
                { key: 'viewsLocation', label: 'Misty Valley Views' },
                { key: 'valueForMoney', label: 'Value for Money' },
              ].map((item) => {
                const val = categoryRatings[item.key as keyof typeof categoryRatings];
                return (
                  <div
                    key={item.key}
                    className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-2xs"
                  >
                    <span className="font-medium text-gray-700 text-xs">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            handleCategoryChange(item.key as keyof typeof categoryRatings, star)
                          }
                          className="cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= val ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Headline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Review Highlight / Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="e.g., Pure bliss watching the clouds roll into our private pool"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none font-medium"
            />
          </div>

          {/* Detailed Experience Comment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Your Detailed Experience & Story <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                {comment.length} characters
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your stay, the infinity pool temperature, the mountain sunrise, caretaker hospitality, evening campfire, or dining..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Favorite Amenities Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              What did you love most? (Select highlights)
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_TAGS.map((tag) => {
                const isSelected = selectedAmenities.includes(tag.id);
                const IconComponent = tag.icon;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleAmenity(tag.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-2xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-gray-500'}`} />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendation Toggle */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Would you recommend Cloud Heaven to friends & family?
              </span>
              <span className="text-[11px] text-gray-500">
                Your recommendation helps us maintain 5-star estate standards.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecommended(true)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  recommended
                    ? 'bg-emerald-900 text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Yes, Highly
              </button>
              <button
                type="button"
                onClick={() => setRecommended(false)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                  !recommended
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Sarah Mathew"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Your City / Location
              </label>
              <input
                type="text"
                required
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                placeholder="e.g., Kochi, Kerala"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isSubmitting
                  ? 'Saving Feedback...'
                  : existingReview
                  ? 'Update Review'
                  : 'Submit Verified Review & Claim +100 Pts'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

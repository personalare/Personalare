import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Sparkles, ThumbsUp, ShieldCheck, Heart } from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Review } from '../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => StorageService.getReviews());

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setReviews(StorageService.getReviews());
    });
    return unsub;
  }, []);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Verified Guest Memories</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Stories from Cloud Heaven
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 font-medium pt-1">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-gray-900">{averageRating} / 5.0</span>
          </div>
          <span>&bull;</span>
          <span>{reviews.length} Verified Guest Experiences</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Authentic Stays
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            className="p-6 bg-white border border-gray-100 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {review.recommended && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Recommended
                  </span>
                )}
              </div>

              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 leading-snug">
                "{review.highlight}"
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{review.comment}"
              </p>

              {review.favoriteAmenities && review.favoriteAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {review.favoriteAmenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-medium border border-gray-100"
                    >
                      {amenity === 'pool'
                        ? '🏊 Infinity Pool'
                        : amenity === 'mist'
                        ? '🌫️ Misty Valley'
                        : amenity === 'campfire'
                        ? '🔥 Campfire'
                        : amenity === 'hospitality'
                        ? '🍲 Kerala Food'
                        : amenity === 'privacy'
                        ? '🌿 Total Privacy'
                        : amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  <span>{review.userName}</span>
                  {review.bookingId && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 inline" title="Verified Stay" />
                  )}
                </div>
                <div className="text-gray-400 text-[11px]">{review.userLocation}</div>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold">{review.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

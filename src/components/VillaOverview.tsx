import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Waves,
  Bed,
  Bath,
  Users,
  Mountain,
  Sun,
  ShieldCheck,
  Sparkles,
  Flame,
  Coffee,
  CheckCircle,
  FileText,
  Trees,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { VillaDetails } from '../types';

interface VillaOverviewProps {
  onOpenBooking: (initialType?: '2bhk' | '3bhk') => void;
  onOpenWelcomeGuide?: () => void;
}

export const VillaOverview: React.FC<VillaOverviewProps> = ({
  onOpenBooking,
  onOpenWelcomeGuide,
}) => {
  const [villa, setVilla] = useState<VillaDetails>(() => StorageService.getVillaDetails());

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setVilla(StorageService.getVillaDetails());
    });
    return unsub;
  }, []);

  return (
    <section id="overview" className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-16">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8"
      >
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
            Architectural Sanctuary
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-1">
            Private Pool Villa Experience
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Bed className="w-4 h-4 text-emerald-800" />
            <span className="font-bold">2 BHK @ ₹8,000 (9 Pax)</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Bed className="w-4 h-4 text-emerald-800" />
            <span className="font-bold">3 BHK @ ₹11,000 (12 Pax)</span>
          </div>
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-emerald-800" />
            <span>Private Heated Pool</span>
          </div>
        </div>
      </motion.div>

      {/* Grid of highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Visual Feature Card */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-200 aspect-[4/3] bg-emerald-950"
          >
            <img
              src={villa.images.hero}
              alt="Cloud Heaven Villa architectural exterior"
              className="w-full h-full object-cover opacity-95"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/80 backdrop-blur-md p-4 rounded-2xl text-white border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                Private Estate Isolation
              </div>
              <div className="font-serif text-lg font-semibold mt-0.5">
                Nestled on 4 Acres of Pine Slopes and Tea Meadows
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="rounded-2xl overflow-hidden shadow-xs border border-gray-200 aspect-[16/10]"
            >
              <img
                src={villa.images.bedroom}
                alt="Cloud Heaven Master Suite"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
              className="rounded-2xl overflow-hidden shadow-xs border border-gray-200 aspect-[16/10]"
            >
              <img
                src={villa.images.living}
                alt="Cloud Heaven Living Room"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>

        {/* Right Details & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="space-y-3"
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Unrivaled Privacy Above the Clouds
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              At Cloud Heaven, you never share corridors or pool decks with strangers. The entire estate, private heated infinity pool, expansive lawn, and personalized caretaker staff are dedicated exclusively to your party.
            </p>
          </motion.div>

          {/* Feature Highlights list */}
          <div className="space-y-3 pt-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-start gap-3.5 hover:border-emerald-200 hover:shadow-xs transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Private Infinity Swimming Pool</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Crystal-clear mountain pool gazing directly into the valley mist with dedicated sun deck.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-start gap-3.5 hover:border-emerald-200 hover:shadow-xs transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Private Campfire & BBQ Deck</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Evening bonfire setup under the cold Vagamon skies with live barbecue setup.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
              className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-start gap-3.5 hover:border-emerald-200 hover:shadow-xs transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Caretaker & Chef on Request</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Authentic Kerala culinary specialties cooked fresh using organic hill produce.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            className="pt-2 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => onOpenBooking('3bhk')}
              className="px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
            >
              Reserve Entire Villa
            </button>
            {onOpenWelcomeGuide && (
              <button
                type="button"
                onClick={onOpenWelcomeGuide}
                className="px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                title="Download complete PDF guide with rules and Vagamon sightseeing"
              >
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>Welcome Guide (PDF)</span>
              </button>
            )}
            <div className="text-xs text-gray-500">
              From <strong className="text-gray-900 text-sm font-bold">₹{villa.basePricePerNight.toLocaleString()}</strong> / night
            </div>
          </motion.div>
        </div>
      </div>

      {/* Estate Architectural Specifications Grid */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-gray-200"
      >
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Bed className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-gray-900">3 King Bed Chambers</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Teakwood king beds, orthopaedic bedding, private valley balconies, and floor-to-ceiling mist windows.
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Bath className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-gray-900">4 Designer Bathrooms</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            3 ensuite glass rain showers plus 1 powder room, organic herbal toiletries, and 24/7 solar hot water.
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Waves className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-gray-900">Heated Infinity Pool</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            32-ft private temperature-controlled pool gazing directly into the cascading valley cloud inversions.
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Trees className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-base font-bold text-gray-900">4-Acre Private Grounds</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Gated cliff estate with pine grove walking trails, organic spice plants, and panoramic sunset lawn.
          </p>
        </div>
      </motion.div>

      {/* Tiered Villa Configurations (2 BHK vs 3 BHK Options) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="space-y-6 pt-4"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
            Stay Configurations
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Select Your Preferred Villa Tier
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Book the entire estate with the exact number of suites you require. Both options grant 100% exclusive, private access to the grounds and heated infinity pool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 2 BHK Option */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Sanctuary Tier
                </span>
                <span className="text-xs text-gray-500 font-medium">Standard 6 &bull; Max 9 Guests</span>
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-gray-900">2 BHK Private Villa</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Ideal for small families, couples, and intimate groups who desire complete solitude with 2 private king master suites.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-emerald-950">₹8,000</span>
                <span className="text-xs text-gray-500 font-medium">/ night + taxes</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-600 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>2 King Master Suites with private balconies & ensuite baths</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Exclusive, private access to 32-ft heated infinity pool</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Full living lounge, dining deck & equipped kitchen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Caretaker assistance, 24/7 generator & fiber Wi-Fi</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onOpenBooking('2bhk')}
                className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Reserve 2 BHK (₹8,000)</span>
                <ArrowRight className="w-4 h-4 text-emerald-800" />
              </button>
            </div>
          </div>

          {/* 3 BHK Option - Featured */}
          <div className="relative bg-gradient-to-b from-emerald-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between border border-emerald-800 overflow-hidden">
            {/* Top right popular badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-emerald-300" /> Most Popular
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 text-emerald-200 text-[11px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/10">
                  Complete Estate Tier
                </span>
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-white">3 BHK Entire Villa Estate</h4>
                <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                  Complete exclusive ownership of the entire villa, all 3 suites, campfire grounds, and full 4-acre cliffside property.
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-800/80 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-white">₹11,000</span>
                <span className="text-xs text-emerald-300/80 font-medium">/ night + taxes</span>
                <span className="text-[11px] text-emerald-300 ml-auto font-medium">Up to 12 Guests</span>
              </div>

              <ul className="space-y-2.5 text-xs text-emerald-100/90 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 3 King Master Suites with private mist balconies & 4 baths</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exclusive access to 32-ft heated infinity pool & sundeck</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Campfire setup under cold Vagamon night skies with BBQ deck</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated on-site caretaker & private chef on request</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-emerald-800/80">
              <button
                type="button"
                onClick={() => onOpenBooking('3bhk')}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Reserve 3 BHK (₹11,000)</span>
                <ArrowRight className="w-4 h-4 text-emerald-950" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

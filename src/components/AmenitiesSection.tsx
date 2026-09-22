import React from 'react';
import { motion } from 'motion/react';
import {
  Waves,
  Wifi,
  Tv,
  Car,
  Utensils,
  Flame,
  Shield,
  Coffee,
  Sun,
  Compass,
  Wind,
  Sparkles,
  FileText,
  Download,
} from 'lucide-react';

interface AmenitiesSectionProps {
  onOpenWelcomeGuide?: () => void;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ onOpenWelcomeGuide }) => {
  const amenities = [
    {
      icon: Waves,
      title: 'Private Infinity Swimming Pool',
      desc: 'Exclusive private pool overlooking rolling green tea plantations and cloud cover.',
    },
    {
      icon: Flame,
      title: 'Private Lawn Campfire & BBQ',
      desc: 'Dedicated campfire stone pit with firewood, ambient lantern lighting, and BBQ grill.',
    },
    {
      icon: Utensils,
      title: 'Personal Villa Chef Service',
      desc: 'Fresh Kerala breakfast and traditional Malabar meals prepared on demand.',
    },
    {
      icon: Wifi,
      title: 'High-Speed Fiber Wi-Fi',
      desc: 'Reliable seamless connection throughout the villa for remote work or streaming.',
    },
    {
      icon: Compass,
      title: 'Off-Road Jeep Trekking',
      desc: 'Direct pickup from the villa for 4x4 trails through Kurisumala and Kolahalamedu pine woods.',
    },
    {
      icon: Car,
      title: 'Private Gated Parking',
      desc: 'Secure private covered vehicle parking for up to 4 SUVs with 24/7 security.',
    },
    {
      icon: Wind,
      title: 'Panoramic Mist Balconies',
      desc: 'Every bedroom features a private floor-to-ceiling glass deck facing the hill breeze.',
    },
    {
      icon: Shield,
      title: '24/7 On-Site Caretaker',
      desc: 'Discreet, friendly hospitality to cater to your needs and ensure complete privacy.',
    },
  ];

  return (
    <section id="amenities" className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
            Tailored For Tranquility
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Estate Amenities &amp; Privileges
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Designed with thoughtful minimalism and luxurious comfort to immerse you in Vagamon's peaceful climate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: (idx % 4) * 0.08 + Math.floor(idx / 4) * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {onOpenWelcomeGuide && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 bg-emerald-950 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-900/60"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Guest Resources &amp; Villa Manual
                </div>
                <h4 className="font-serif text-lg font-bold text-white">
                  Download the 3-Page Villa Welcome Guide (PDF)
                </h4>
                <p className="text-xs text-emerald-200/70">
                  Includes Wi-Fi credentials, infinity pool rules, BBQ/campfire guidelines, and local Vagamon attractions.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenWelcomeGuide}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-950" />
              <span>Download PDF Guide</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

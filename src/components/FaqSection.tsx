import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  Clock,
  Waves,
  ShieldCheck,
  Utensils,
  Car,
  CreditCard,
  Search,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  FileText,
  Download,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface FaqSectionProps {
  onOpenWelcomeGuide?: () => void;
}

interface FaqItem {
  id: string;
  category: 'checkin' | 'pool' | 'policies' | 'dining' | 'location' | 'payments';
  question: string;
  answer: string;
  highlights?: string[];
  importantNote?: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'checkin-times',
    category: 'checkin',
    question: 'What are the standard Check-in and Check-out timings?',
    answer:
      'Our standard Check-in time is 2:00 PM and Check-out is 11:00 AM. This 3-hour window allows our dedicated housekeeping team to deep-clean the villa, sanitize the private infinity pool, and refresh linens before welcoming our next guests.',
    highlights: [
      'Standard Check-in: 2:00 PM',
      'Standard Check-out: 11:00 AM',
      'Early check-in / late check-out subject to prior booking availability',
    ],
    importantNote: 'Please notify our caretaker in advance if you plan to arrive after 7:00 PM so we can prepare hot welcome tea and illuminate the private driveway.',
  },
  {
    id: 'checkin-id',
    category: 'checkin',
    question: 'What documents are required during check-in?',
    answer:
      'In compliance with Kerala Tourism and local hospitality regulations, all adult guests (18+) must present a valid government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driving License) upon arrival.',
    highlights: [
      'Government ID mandatory for all adult occupants',
      'Digital copies or physical cards accepted',
      'Quick contactless check-in verified by villa caretaker',
    ],
  },
  {
    id: 'pool-hours-depth',
    category: 'pool',
    question: 'What is the pool depth, operating hours, and temperature?',
    answer:
      'The private infinity pool is exclusively reserved for your group. It features a gradual depth ranging from 3.5 ft to 4.5 ft, making it comfortable for both adults and supervised older kids. The pool filtration system operates continuously, and night swimming is permitted under ambient deck illumination until 10:30 PM.',
    highlights: [
      'Depth: 3.5 ft (shallow ledge) to 4.5 ft (deep end)',
      '100% Private — no shared access with outside visitors',
      'Floating pool breakfast trays available on prior request',
    ],
    importantNote: 'Children under 12 must be accompanied and supervised by an adult at all times around the pool area.',
  },
  {
    id: 'pool-rules-dress',
    category: 'pool',
    question: 'What are the pool safety and attire guidelines?',
    answer:
      'Proper synthetic swimming attire (nylon/polyester swimwear) is recommended to maintain the crystal-clear water quality. For safety reasons, glassware, bottles, and sharp items are strictly prohibited inside or on the immediate wet pool deck; premium shatterproof acrylic glasses are provided at the poolside bar counter.',
    highlights: [
      'No glassware or porcelain items inside pool water',
      'No diving or running on wet stone decks',
      'Outdoor poolside rain shower must be used prior to entering',
    ],
  },
  {
    id: 'villa-occupancy',
    category: 'policies',
    question: 'What is the maximum guest occupancy allowed at Cloud Heaven?',
    answer:
      'The entire villa accommodates up to 10 guests across 3 master luxury suites with king-size beds, plus premium extra rollaway bedding and plush daybeds. Standard tariff covers up to 6 guests, with a nominal extra person fee for additional guests up to the 10-guest maximum.',
    highlights: [
      'Ideal for families, close-knit friends, and VIP groups',
      '3 Panoramic en-suite bedrooms with glass cliff-view balconies',
      'Baby cribs available upon advance request at zero surcharge',
    ],
  },
  {
    id: 'noise-quiet-hours',
    category: 'policies',
    question: 'What is the policy on loud music, parties, and quiet hours?',
    answer:
      'Cloud Heaven is a serene sanctuary situated high on the Kurisumala Ashram Ridge surrounded by pristine nature and tea plantations. Moderate acoustic music and Bluetooth speakers are welcome inside the villa. In accordance with local mountain noise regulations, outdoor loud music and high-decibel speakers must be lowered after 10:00 PM to preserve the peaceful valley atmosphere.',
    highlights: [
      'Outdoor quiet hours begin at 10:00 PM',
      'Indoor acoustic entertainment welcome 24/7',
      'Campfire chats and starlight lounging encouraged',
    ],
  },
  {
    id: 'smoking-alcohol-pets',
    category: 'policies',
    question: 'Are smoking, alcohol consumption, and pets allowed?',
    answer:
      'Responsible alcohol consumption by legal-age guests is permitted inside the villa and outdoor private deck areas. Smoking is permitted on outdoor balconies, lawn verandas, and campfire zones only (indoor bedrooms and living halls are 100% smoke-free). Due to delicate flora and cliff-edge safety, pets are accepted on a case-by-case basis with prior approval.',
    highlights: [
      'Dedicated open-air smoking verandas and ash-trays provided',
      'Strictly non-smoking interior suites',
      'Pet requests evaluated individually before booking confirmation',
    ],
  },
  {
    id: 'dining-chef-kitchen',
    category: 'dining',
    question: 'Is food provided, and can we cook our own meals?',
    answer:
      'A complimentary authentic Kerala breakfast (appam with stew, idiyappam, puttu, fresh hill fruits, and organic plantation tea/coffee) is served each morning. For lunch, dinner, or live BBQ nights, our private villa chef can prepare customized Malabar and continental dishes at nominal ingredient cost with advance notice. Guests also have access to a modern pantry with induction, microwave, refrigerator, and RO water filter.',
    highlights: [
      'Complimentary hot Kerala breakfast included daily',
      'Private Chef on demand for customized lunches & dinners',
      'Live Charcoal Barbecue & campfire dinner setups available',
    ],
    importantNote: 'Please communicate special dietary preferences (pure vegetarian, Jain, gluten-free, or halal) at least 24 hours prior to check-in.',
  },
  {
    id: 'road-access-parking',
    category: 'location',
    question: 'How is the road access for hatchbacks, sedans, and EV cars?',
    answer:
      'Cloud Heaven is directly accessible via a fully paved, scenic tarmac road along Kurisumala Ashram Road. All standard passenger vehicles — including hatchbacks, luxury sedans, and heavy SUVs — can comfortably drive up to the villa gates. We provide secure, covered private parking for up to 4 vehicles with a dedicated 15A power socket for EV vehicle top-ups upon request.',
    highlights: [
      'Paved all-weather road with direct villa gate access',
      'Covered private secure parking for 4 vehicles',
      'Standard 15A EV slow charging socket available',
    ],
  },
  {
    id: 'payments-cancellation',
    category: 'payments',
    question: 'What payment modes are accepted and what is the cancellation policy?',
    answer:
      'We accept all major UPI apps (Google Pay, PhonePe, Paytm), NetBanking, and credit/debit cards. A 30% advance token secures your dates instantly. Cancellations made 7 or more days prior to check-in receive a 100% full refund or free date-change voucher valid for 6 months. Cancellations within 3–6 days receive a 50% refund.',
    highlights: [
      'Secure Instant UPI, Credit Cards, and NetBanking',
      '100% Full Refund if cancelled 7+ days before arrival',
      'Free flexible date rescheduling options available',
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'checkin', label: 'Check-In & Access', icon: Clock },
  { id: 'pool', label: 'Pool Rules & Safety', icon: Waves },
  { id: 'policies', label: 'Villa House Rules', icon: ShieldCheck },
  { id: 'dining', label: 'Chef & Dining', icon: Utensils },
  { id: 'location', label: 'Roads & Parking', icon: Car },
  { id: 'payments', label: 'Tariffs & Refunds', icon: CreditCard },
];

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenWelcomeGuide }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('checkin-times');

  const contact = StorageService.getContactDetails();
  const sanitizedWhatsApp = (contact.whatsapp || contact.phone || '919447128900').replace(/\D/g, '');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.highlights?.some((h) => h.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white border-b border-gray-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold tracking-widest uppercase text-emerald-800">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Guest Assistance &amp; Policies</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Everything you need to know about staying at Cloud Heaven Private Pool Villa in Vagamon — from check-in timings and infinity pool etiquette to chef dining and road access.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., 'pool depth', 'check-in time', 'bbq', 'parking')..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 bg-gray-200/60 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-gray-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-10 text-center bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700 text-sm">No matching questions found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Couldn't find what you're looking for? Reach out directly to our concierge team.
              </p>
              <a
                href={`https://wa.me/${sanitizedWhatsApp}?text=${encodeURIComponent(
                  `Hi Cloud Heaven, I have a question regarding: "${searchQuery}"`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={false}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-white border-emerald-700 shadow-md ring-1 ring-emerald-700'
                      : 'bg-gray-50/70 border-gray-200/80 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isExpanded
                            ? 'bg-emerald-900 text-emerald-200'
                            : 'bg-white border border-gray-200 text-gray-500'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-sm sm:text-base leading-snug ${
                        isExpanded ? 'text-emerald-950' : 'text-gray-900'
                      }`}>
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? 'rotate-180 bg-emerald-100 text-emerald-900'
                          : 'bg-white border border-gray-200 text-gray-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-gray-600 space-y-4 border-t border-gray-100">
                          <p className="leading-relaxed text-gray-700">{faq.answer}</p>

                          {/* Highlights Checklist */}
                          {faq.highlights && faq.highlights.length > 0 && (
                            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                                Quick Key Takeaways:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                                {faq.highlights.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span className="font-medium">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Important Note Callout if any */}
                          {faq.importantNote && (
                            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <strong className="font-bold">Important:</strong> {faq.importantNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom Support Banner */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Personalized Concierge Assistance</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Have a customized inquiry or special request?
            </h3>
            <p className="text-xs text-emerald-200 max-w-lg">
              Our on-site estate manager is available 24/7 to assist with itinerary planning, private dining, or corporate stays.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            {onOpenWelcomeGuide && (
              <button
                type="button"
                onClick={onOpenWelcomeGuide}
                className="justify-center px-4 py-3 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                title="Download 3-Page PDF with full policies, check-in guide and Vagamon map"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Guide (PDF)</span>
              </button>
            )}

            <a
              href={`https://wa.me/${sanitizedWhatsApp}?text=${encodeURIComponent(
                'Hello Cloud Heaven team, I have an inquiry about my upcoming trip to Vagamon.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="justify-center px-4 py-3 sm:py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp Concierge</span>
            </a>

            <a
              href={`tel:${contact.phone || '+919447128900'}`}
              className="justify-center px-4 py-3 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Call Manager</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

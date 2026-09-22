import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Download,
  Printer,
  Clock,
  Wifi,
  ShieldCheck,
  Compass,
  Phone,
  MapPin,
  Sparkles,
  Waves,
  Flame,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Tv,
  Car,
  HeartHandshake,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { WelcomeGuidePdfService, WelcomeGuideOptions } from '../services/welcomeGuidePdfService';
import { StorageService } from '../services/storageService';
import { VAGAMON_ATTRACTIONS } from './LocationMapSection';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingOptions?: WelcomeGuideOptions;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  bookingOptions,
}) => {
  const [activeTab, setActiveTab] = useState<'essentials' | 'rules' | 'attractions' | 'contacts'>(
    'essentials'
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  if (!isOpen) return null;

  const contact = StorageService.getContactDetails();
  const villa = StorageService.getVillaDetails();

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      WelcomeGuidePdfService.downloadPdf(bookingOptions);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText('cloudheaven@mist');
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-emerald-950/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden my-auto text-gray-900 max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8 sm:pr-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Guest Welcome Kit
                  </span>
                  <span className="text-xs text-emerald-200/70 hidden sm:inline">
                    PDF Edition Available
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Cloud Heaven Welcome Guide
                </h2>
                <p className="text-xs text-emerald-100/80 max-w-xl">
                  {bookingOptions?.guestName
                    ? `Personalized stay guidebook for ${bookingOptions.guestName}`
                    : 'Check-in instructions, villa amenities, house rules & local Vagamon sightseeing recommendations.'}
                </p>
              </div>

              {/* Action Buttons: PDF Download & Print */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>{isDownloading ? 'Generating...' : 'Download PDF Guide'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white rounded-xl border border-emerald-700/50 transition-colors cursor-pointer"
                  title="Print Guide"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Success Toast */}
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  Welcome Guide PDF downloaded successfully to your device! Keep it handy during your trip.
                </span>
              </motion.div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('essentials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'essentials'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. Check-In &amp; Essentials</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Villa Rules &amp; Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('attractions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'attractions'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. Vagamon Attractions Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>4. Caretaker &amp; Emergency</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: CHECK-IN & VILLA ESSENTIALS */}
            {activeTab === 'essentials' && (
              <div className="space-y-6">
                {/* Timings & Arrival Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                      <Clock className="w-4 h-4 text-emerald-800" />
                      <span>Check-In &amp; Departure Timings</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-gray-600">Standard Check-In:</span>
                        <strong className="text-emerald-950 font-bold">2:00 PM onwards</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-gray-600">Standard Check-Out:</span>
                        <strong className="text-emerald-950 font-bold">11:00 AM sharp</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-gray-600">ID Requirement:</span>
                        <span className="font-semibold text-gray-900">Govt. Photo ID for all adult guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Arrival:</span>
                        <span className="font-semibold text-gray-900">Alert caretaker if arriving after 7 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Speed Wi-Fi & Credentials */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                        <Wifi className="w-4 h-4 text-emerald-700" />
                        <span>High-Speed Optical Wi-Fi</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                        150+ Mbps
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase text-gray-500 font-semibold">Network SSID</div>
                          <div className="font-mono font-bold text-emerald-900">CloudHeaven_Guest_5G</div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Auto-connect</span>
                      </div>

                      <div className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase text-gray-500 font-semibold">Password</div>
                          <div className="font-mono font-bold text-gray-900">cloudheaven@mist</div>
                        </div>
                        <button
                          onClick={handleCopyWifi}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 text-emerald-900 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedWifi ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Villa Operations & Comfort Guidelines */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Villa Comfort &amp; Appliance Instructions</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <Waves className="w-4 h-4 text-emerald-700" />
                        <span>Private Infinity Pool</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Features continuous 24/7 sand-filtration. Depths range from 3.5 ft to 4.5 ft. Night swimming with atmospheric LED illumination is open until 10:30 PM.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <Tv className="w-4 h-4 text-emerald-700" />
                        <span>Smart Entertainment &amp; Audio</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        55" 4K Google TV pre-configured with streaming apps (Netflix, Prime Video, Hotstar). Bluetooth party soundbar in the living hall for acoustic music.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-700" />
                        <span>Hot Water &amp; Geysers</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Each ensuite bathroom has an instant storage water geyser. Switch on 15 minutes before bathing. Mountain spring filtered water is safe for washing.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-700" />
                        <span>Covered Parking &amp; EV Socket</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        Secure on-site covered parking for up to 4 passenger cars. A standard 15A slow charging socket is available upon notifying the caretaker.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Getting to the Villa */}
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-800" />
                      <span>Estate Address &amp; Navigation Coordinates</span>
                    </div>
                    <p className="text-gray-700">
                      {contact.address}, {contact.landmark}, {contact.city}, {contact.state} - {contact.pincode}
                    </p>
                  </div>
                  <a
                    href={contact.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: VILLA RULES & POLICIES */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Preserving Hill Sanctuary Harmony:</strong>
                    <span>
                      Cloud Heaven is an exclusive private estate sanctuary. We kindly ask our guests to observe these house rules to safeguard guest safety, mountain wildlife, and valley peacefulness.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Quiet Hours (10:00 PM – 06:00 AM)</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      In accordance with local Western Ghats eco-regulations, outdoor loud music and high-decibel speakers must end by 10:00 PM. Indoor conversation and acoustic music are welcome.
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>100% Smoke-Free Indoors</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      Indoor bedrooms and living areas are strictly non-smoking. Smoking is permitted on outdoor open balconies, verandas, and campfire zones with ashtrays provided.
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>Pool Safety &amp; Glassware Ban</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      No glassware or ceramic bottles are permitted inside or on the wet pool deck (unbreakable acrylic cups provided). Children under 12 must be supervised by an adult.
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>Eco-Friendly Waste Disposal</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      We support green tourism. Please segregate wet organic waste from plastic recyclables in the provided kitchen bins. Avoid discarding plastics in tea plantations.
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <span>Campfire &amp; Barbecue Safety</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      Evening campfires are lit exclusively by the villa caretaker in the dedicated garden fire pit. Please do not leave glowing embers unattended when retiring for the night.
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold">
                        6
                      </span>
                      <span>Check-Out Key Handover (11:00 AM)</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-8">
                      On the day of checkout, our caretaker will assist with luggage and collect all room keys and electronic remotes. Free date rescheduling is available for future stays.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VAGAMON ATTRACTIONS GUIDE */}
            {activeTab === 'attractions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900">
                      Curated Vagamon Sightseeing Guide
                    </h3>
                    <p className="text-xs text-gray-500">
                      Handpicked scenic viewpoints, nature reserves, tea estates, and adventure spots near Cloud Heaven.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download PDF Map</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VAGAMON_ATTRACTIONS.filter((a) => a.id !== 'cloud-heaven').map((att) => (
                    <div
                      key={att.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 flex flex-col justify-between hover:border-emerald-300 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                            {att.categoryLabel}
                          </span>
                          <span className="text-[11px] font-bold text-amber-700">
                            {att.distanceKm} km ({att.driveTimeMin} mins drive)
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-gray-900">{att.name}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{att.description}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500 italic truncate max-w-[200px]">
                          ✨ {att.highlight}
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(att.googleMapsQuery)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-900 font-bold flex items-center gap-1 hover:underline shrink-0"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CARETAKER & EMERGENCY CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <HeartHandshake className="w-4 h-4" />
                    <span>24/7 On-Property Caretaker</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold">
                    Need anything during your stay? We are right here.
                  </h3>
                  <p className="text-xs text-emerald-100/80 max-w-xl">
                    Our on-site caretaker is stationed 24 hours a day on the estate to assist with key handover, breakfast preparation, extra linens, campfire lighting, hot tea, or emergency assistance.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
                    <a
                      href={`tel:${(contact.caretakerPhone || '+91 73589 56101').replace(/\s+/g, '')}`}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Caretaker: {contact.caretakerPhone || '+91 73589 56101'}</span>
                    </a>

                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-emerald-300" />
                      <span>Central Desk: {contact.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Emergency Services Directory Table */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="font-serif text-lg font-bold text-gray-900">
                    Local Emergency &amp; Medical Directory
                  </h4>

                  <div className="divide-y divide-gray-100 text-xs">
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">Primary Health Centre (PHC Vagamon)</div>
                        <div className="text-gray-500">OPD &amp; Emergency First Aid • 4.0 km away</div>
                      </div>
                      <a href="tel:04869248230" className="font-mono font-bold text-emerald-900 hover:underline">
                        04869-248230 / 108
                      </a>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">St. Joseph Hospital (Elappara)</div>
                        <div className="text-gray-500">24-Hour Casualty &amp; Medical ICU • 14 km away</div>
                      </div>
                      <a href="tel:04869242224" className="font-mono font-bold text-emerald-900 hover:underline">
                        04869-242224
                      </a>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">Vagamon Police Station</div>
                        <div className="text-gray-500">Police Station Road, Vagamon Junction</div>
                      </div>
                      <a href="tel:04869248233" className="font-mono font-bold text-emerald-900 hover:underline">
                        04869-248233 / 112
                      </a>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">City Medicals (24/7 Pharmacy)</div>
                        <div className="text-gray-500">Pine Forest Road, Vagamon • 2.5 km away</div>
                      </div>
                      <a href="tel:+919447281900" className="font-mono font-bold text-emerald-900 hover:underline">
                        +91 94472 81900
                      </a>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">4x4 Off-Road Jeep Safari &amp; Cab Chauffeur</div>
                        <div className="text-gray-500">Resort Concierge Desk Pickup</div>
                      </div>
                      <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="font-mono font-bold text-emerald-900 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Full 3-Page Official PDF Kit available for offline reading.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Guide'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

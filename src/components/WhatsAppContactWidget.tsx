import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Calendar,
  Coffee,
  Compass,
  Users,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface TemplateOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  text: string;
}

export const WhatsAppContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('availability');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestDates, setGuestDates] = useState<string>('');
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  const contact = StorageService.getContactDetails();
  const villa = StorageService.getVillaDetails();

  // Strip non-numeric characters for WhatsApp international format
  const sanitizedWhatsAppNumber = (contact.whatsapp || contact.phone || '919447128900').replace(/\D/g, '');

  const templates: TemplateOption[] = [
    {
      id: 'availability',
      title: 'Villa Availability & Pricing',
      icon: <Calendar className="w-4 h-4 text-emerald-600" />,
      text: `Hello Cloud Heaven Team, I would like to inquire about villa availability and tariff rates for Cloud Heaven Private Pool Villa in Vagamon.`,
    },
    {
      id: 'special-request',
      title: 'Chef, Floating Breakfast & BBQ',
      icon: <Coffee className="w-4 h-4 text-amber-600" />,
      text: `Hello, I am interested in booking Cloud Heaven with special add-ons (Floating Breakfast in Pool / Private BBQ Night / Personal Chef). Could you provide details?`,
    },
    {
      id: 'group',
      title: 'Family / VIP Group Stay',
      icon: <Users className="w-4 h-4 text-purple-600" />,
      text: `Hi, we are planning a private luxury getaway for our family/group (up to 10 guests) at Cloud Heaven Vagamon. Could you assist with customized arrangements?`,
    },
    {
      id: 'trek',
      title: 'Directions & Jeep Safari',
      icon: <Compass className="w-4 h-4 text-sky-600" />,
      text: `Hello, I'd like to learn more about access to Cloud Heaven on Kurisumala Ashram Road and booking the guided 4x4 Jeep Trek excursion.`,
    },
  ];

  // Set default template text
  useEffect(() => {
    const currentTpl = templates.find((t) => t.id === selectedTemplate);
    if (currentTpl && !customMessage) {
      setCustomMessage(currentTpl.text);
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (tpl: TemplateOption) => {
    setSelectedTemplate(tpl.id);
    let composed = tpl.text;
    if (guestName.trim()) {
      composed = `Hi, my name is ${guestName.trim()}. ` + composed;
    }
    if (guestDates.trim()) {
      composed += ` Preferred travel dates: ${guestDates.trim()}.`;
    }
    setCustomMessage(composed);
  };

  const handleSendWhatsApp = () => {
    let finalMessage = customMessage.trim();
    if (!finalMessage) {
      const active = templates.find((t) => t.id === selectedTemplate);
      finalMessage = active ? active.text : 'Hello Cloud Heaven, I would like to inquire about a booking.';
    }

    // Add signature if name was given and not already in message
    if (guestName.trim() && !finalMessage.toLowerCase().includes(guestName.toLowerCase())) {
      finalMessage = `[From: ${guestName.trim()}]\n\n` + finalMessage;
    }

    if (guestDates.trim() && !finalMessage.includes(guestDates.trim())) {
      finalMessage += `\nPreferred Dates: ${guestDates.trim()}`;
    }

    const encodedText = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/${sanitizedWhatsAppNumber}?text=${encodedText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setShowNotificationBadge(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* WhatsApp Popup Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-4 sm:p-5 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                    <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">Cloud Heaven Concierge</h3>
                  </div>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Typically replies within minutes</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close chat popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Intro message bubble */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl rounded-tl-none space-y-1">
                <p className="text-gray-800 leading-relaxed font-medium">
                  👋 Welcome to Cloud Heaven, Vagamon! How can our resort team assist you today?
                </p>
                <span className="text-[10px] text-emerald-800 font-semibold block text-right">
                  Resort Manager • Online
                </span>
              </div>

              {/* Inquiry Type Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Select Inquiry Topic:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white shadow-xs'
                          }`}
                        >
                          {tpl.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block truncate">{tpl.title}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Quick Fields */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Dates (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next weekend"
                    value={guestDates}
                    onChange={(e) => setGuestDates(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-700 transition-colors"
                  />
                </div>
              </div>

              {/* Custom Message Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Message Preview:
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 focus:bg-white focus:outline-hidden focus:border-emerald-700 transition-colors resize-none leading-relaxed"
                  placeholder="Type your question or request here..."
                />
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Start WhatsApp Chat</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotificationBadge(false);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative p-3.5 sm:p-4 rounded-full text-white shadow-xl transition-all flex items-center justify-center cursor-pointer ${
          isOpen
            ? 'bg-gray-900 shadow-gray-900/30 ring-4 ring-gray-200'
            : 'bg-[#25D366] hover:bg-[#20bd5a] shadow-[#25D366]/40 ring-4 ring-emerald-100 hover:ring-emerald-200'
        }`}
        aria-label="Chat on WhatsApp with Cloud Heaven"
      >
        {/* Pulsing ring when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center gap-2">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider pr-1">
              Chat on WhatsApp
            </span>
          </div>
        )}

        {/* Unread Alert Ping */}
        {!isOpen && showNotificationBadge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-white items-center justify-center border-2 border-white">
              1
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

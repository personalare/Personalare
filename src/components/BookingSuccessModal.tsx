import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Mail,
  MessageCircle,
  BellRing,
  ExternalLink,
  ChevronRight,
  Sparkle,
  FileText,
  Download,
} from 'lucide-react';
import { Booking, ContactDetails, EmailNotification } from '../types';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { WelcomeGuidePdfService } from '../services/welcomeGuidePdfService';
import { EmailViewModal } from './EmailViewModal';
import { WhatsAppMessageModal } from './WhatsAppMessageModal';

interface BookingSuccessModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onViewMyBookings: () => void;
  onOpenWelcomeGuide?: (opts?: any) => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  booking,
  onClose,
  onViewMyBookings,
  onOpenWelcomeGuide,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isDownloadingGuide, setIsDownloadingGuide] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState<
    'confirmation' | 'checkin_reminder' | 'checkout_reminder'
  >('confirmation');

  const [activeBooking, setActiveBooking] = useState<Booking | null>(booking);

  useEffect(() => {
    if (booking) {
      setActiveBooking(booking);
    }
  }, [booking]);

  const currentBooking = booking || activeBooking;
  const contact: ContactDetails = StorageService.getContactDetails();

  if (!currentBooking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWelcomeGuide = () => {
    setIsDownloadingGuide(true);
    try {
      WelcomeGuidePdfService.downloadPdf({
        guestName: currentBooking.userName,
        bookingRef: currentBooking.id,
        checkInDate: currentBooking.checkInDate,
        checkOutDate: currentBooking.checkOutDate,
        villaType: currentBooking.villaTypeLabel || (currentBooking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa'),
      });
    } finally {
      setIsDownloadingGuide(false);
    }
  };

  const handleOpenEmail = () => {
    const emails = NotificationService.getEmailLogsByBookingId(currentBooking.id);
    const customerEmail = emails.find((e) => e.type === 'customer_confirmation') || emails[0];
    if (customerEmail) {
      setSelectedEmail(customerEmail);
    }
  };

  const handleOpenWhatsApp = (type: 'confirmation' | 'checkin_reminder' | 'checkout_reminder' = 'confirmation') => {
    setWhatsAppType(type);
    setShowWhatsAppModal(true);
  };

  const directGuestWaUrl = NotificationService.createWhatsAppLink(
    currentBooking.userPhone,
    NotificationService.formatCustomerBookingWhatsApp(currentBooking)
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop with smooth blur and fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={onClose}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog Card with smooth, subtle upward fade & scale */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1], // refined luxury cubic bezier curve
              }}
              className="relative z-10 w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden my-auto text-gray-900"
            >
              {/* Header Banner */}
              <div className="bg-emerald-950 text-white p-6 sm:p-8 text-center relative border-b border-emerald-900">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 text-emerald-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer transition-colors"
                  aria-label="Close confirmation"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs text-white mx-auto mb-3">
                  CH
                </div>
                <motion.div
                  initial={{ scale: 0.65, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <CheckCircle className="w-7 h-7" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold">
                    Reservation Confirmed
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-white">
                    Cloud Heaven, Vagamon
                  </h2>
                  <p className="text-xs text-emerald-300 mt-1.5 font-medium">
                    Booking Voucher Reference: <strong className="text-white tracking-wider font-mono">{currentBooking.id}</strong>
                  </p>
                </motion.div>
              </div>

            {/* Automated Dispatch Alerts Bar */}
            <div className="bg-emerald-900/10 border-b border-emerald-900/15 px-5 py-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Email voucher dispatched to <strong>{currentBooking.userEmail}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEmail}
                  className="text-xs font-bold text-emerald-900 hover:text-emerald-700 bg-white border border-emerald-300 px-3 py-1 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
                >
                  Preview Email
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950 border-t border-emerald-900/10 pt-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 fill-[#25D366]" />
                  <span>
                    WhatsApp voucher generated for <strong>{currentBooking.userPhone}</strong> &amp; Caretaker Babu
                  </span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href={directGuestWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-3 py-1 rounded-lg shadow-2xs transition-colors whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" /> Open WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp('confirmation')}
                    className="text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-6">
              {/* Timings & Automated Reminder Schedule Highlight Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-900">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Check-In Schedule (Strict)
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {currentBooking.checkInDate}
                    </div>
                    <div className="text-xs text-emerald-900 font-bold mt-0.5">
                      Time: {currentBooking.checkInTime}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <BellRing className="w-3 h-3 text-emerald-600" />
                      <span>Reminder scheduled for morning of arrival</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-900">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Check-Out Schedule (Strict)
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {currentBooking.checkOutDate}
                    </div>
                    <div className="text-xs text-emerald-900 font-bold mt-0.5">
                      Time: {currentBooking.checkOutTime}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <BellRing className="w-3 h-3 text-emerald-600" />
                      <span>Reminder scheduled at 9:00 AM on checkout</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest & Villa Details */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Accommodation:</span>
                  <span className="font-bold text-emerald-900">
                    {currentBooking.villaTypeLabel || (currentBooking.villaType === '3bhk' ? '3 BHK Luxury Villa (Up to 12 Pax)' : '2 BHK Luxury Villa (Up to 9 Pax)')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Lead Guest:</span>
                  <span className="font-bold text-gray-900">{currentBooking.userName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Contact Email:</span>
                  <span className="font-bold text-gray-900">{currentBooking.userEmail}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Contact Phone:</span>
                  <span className="font-bold text-gray-900">{currentBooking.userPhone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Guests:</span>
                  <span className="font-bold text-gray-900">
                    {currentBooking.guests.adults} Adults, {currentBooking.guests.children} Children
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Total Duration:</span>
                  <span className="font-bold text-gray-900">{currentBooking.totalNights} Nights</span>
                </div>
                {currentBooking.addons.length > 0 && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-medium">Experiences Added:</span>
                    <span className="font-bold text-gray-900">
                      {currentBooking.addons.map((a) => a.name).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                  <span>Total Tariff:</span>
                  <span className="text-gray-900">₹{currentBooking.finalAmount.toLocaleString()}</span>
                </div>

                {currentBooking.paymentStatus === 'partially_paid' ? (
                  <>
                    <div className="flex justify-between text-xs font-semibold text-emerald-800">
                      <span>Advance Paid:</span>
                      <span>₹{(currentBooking.advancePaid || 0).toLocaleString()} ({currentBooking.paymentMode?.toUpperCase() || 'UPI'})</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <span>Balance Due at Check-in:</span>
                      <span>₹{(currentBooking.balanceAmount || 0).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <span>Payment Status:</span>
                    <span>Paid in Full ({currentBooking.paymentMode?.toUpperCase() || 'UPI'})</span>
                  </div>
                )}

                {currentBooking.upiTransactionId && (
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>UPI Reference (UTR):</span>
                    <span className="font-bold text-gray-700">{currentBooking.upiTransactionId}</span>
                  </div>
                )}
              </div>

              {/* Quick Reminders Dispatch Triggers */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Upcoming Stay Reminders
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Automated &amp; On-Demand
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp('checkin_reminder')}
                    className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-left transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">🌄 Check-In Reminder</div>
                      <div className="text-[10px] text-gray-500">2:00 PM Arrival, Route &amp; Pool Prep</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp('checkout_reminder')}
                    className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-left transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">🌤️ Check-Out Reminder</div>
                      <div className="text-[10px] text-gray-500">11:00 AM Key Handover &amp; +100 Pts Review</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Resort Location & Caretaker info */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-gray-700">
                <MapPin className="w-5 h-5 shrink-0 text-emerald-800 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-gray-900 block font-bold">Getting to Cloud Heaven:</strong>
                  <div>{contact.address}, {contact.landmark}, {contact.city}, {contact.state}.</div>
                  <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-emerald-950 font-bold text-xs">
                    <span>📞 Booking Desk: <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="underline">{contact.phone}</a></span>
                    <span>🌿 Caretaker: <a href={`tel:${(contact.caretakerPhone || '+91 73589 56101').replace(/\s+/g, '')}`} className="underline">{contact.caretakerPhone || '+91 73589 56101'}</a></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-gray-500" /> Print Voucher
                </button>

                <button
                  type="button"
                  onClick={handleDownloadWelcomeGuide}
                  disabled={isDownloadingGuide}
                  className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-950 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Download 3-Page PDF Welcome Guide with check-in instructions & Vagamon attractions"
                >
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>{isDownloadingGuide ? 'Saving...' : 'Welcome Guide (PDF)'}</span>
                </button>

                {onOpenWelcomeGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenWelcomeGuide({
                        guestName: currentBooking.userName,
                        bookingRef: currentBooking.id,
                        checkInDate: currentBooking.checkInDate,
                        checkOutDate: currentBooking.checkOutDate,
                        villaType:
                          currentBooking.villaTypeLabel ||
                          (currentBooking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa'),
                      });
                    }}
                    className="px-3 py-2.5 text-xs text-gray-600 hover:text-emerald-900 font-semibold transition-colors cursor-pointer"
                  >
                    Preview Guide
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onViewMyBookings();
                  }}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
                >
                  Go to My Reservations
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Embedded Email Preview Modal */}
      {selectedEmail && (
        <EmailViewModal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          email={selectedEmail}
        />
      )}

      {/* Embedded WhatsApp Message Modal */}
      {showWhatsAppModal && (
        <WhatsAppMessageModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          booking={currentBooking}
          defaultType={whatsAppType}
        />
      )}
    </>
  );
};


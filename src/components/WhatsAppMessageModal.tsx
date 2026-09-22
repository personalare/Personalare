import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Send,
  Phone,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { Booking, WhatsAppNotification } from '../types';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storageService';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  notification?: WhatsAppNotification | null;
  defaultType?: 'confirmation' | 'checkin_reminder' | 'checkout_reminder';
}

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({
  isOpen,
  onClose,
  booking,
  notification,
  defaultType = 'confirmation',
}) => {
  const [activeTab, setActiveTab] = useState<'confirmation' | 'checkin_reminder' | 'checkout_reminder'>(
    defaultType
  );
  const [recipientRole, setRecipientRole] = useState<'guest' | 'caretaker'>('guest');
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!booking && !notification)) return null;

  const contact = StorageService.getContactDetails();

  // If a booking is provided, generate message dynamically based on current tab
  let messageText = '';
  let targetPhone = '';
  let targetName = '';

  if (booking) {
    if (activeTab === 'confirmation') {
      if (recipientRole === 'guest') {
        messageText = NotificationService.formatCustomerBookingWhatsApp(booking);
        targetPhone = booking.userPhone;
        targetName = booking.userName;
      } else {
        messageText = NotificationService.formatCaretakerBookingAlertWhatsApp(booking);
        targetPhone = contact.caretakerPhone || '+91 73589 56101';
        targetName = contact.caretakerName || 'Caretaker Babu';
      }
    } else if (activeTab === 'checkin_reminder') {
      messageText = NotificationService.formatCheckInReminderWhatsApp(booking);
      targetPhone = booking.userPhone;
      targetName = booking.userName;
    } else {
      messageText = NotificationService.formatCheckOutReminderWhatsApp(booking);
      targetPhone = booking.userPhone;
      targetName = booking.userName;
    }
  } else if (notification) {
    messageText = notification.messageText;
    targetPhone = notification.recipientPhone;
    targetName = notification.recipientName;
  }

  const waLink = NotificationService.createWhatsAppLink(targetPhone, messageText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden my-auto text-gray-900 flex flex-col max-h-[92vh]"
        >
          {/* WhatsApp Themed Header */}
          <div className="bg-[#075E54] text-white px-6 py-4 flex items-center justify-between relative shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-inner">
                <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">WhatsApp Messaging Hub</h3>
                  <span className="px-2 py-0.5 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-[10px] font-bold rounded-full uppercase">
                    Auto-Dispatched
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 font-medium">
                  To: <strong className="text-white">{targetName}</strong> ({targetPhone})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector if Booking is available */}
          {booking && (
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('confirmation')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'confirmation'
                      ? 'bg-emerald-900 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Booking Voucher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('checkin_reminder');
                    setRecipientRole('guest');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'checkin_reminder'
                      ? 'bg-emerald-900 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Check-In Reminder (2 PM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('checkout_reminder');
                    setRecipientRole('guest');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'checkout_reminder'
                      ? 'bg-emerald-900 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Check-Out Reminder (11 AM)
                </button>
              </div>

              {activeTab === 'confirmation' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-500">Recipient:</span>
                  <div className="flex bg-white p-0.5 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setRecipientRole('guest')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        recipientRole === 'guest'
                          ? 'bg-[#075E54] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientRole('caretaker')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        recipientRole === 'caretaker'
                          ? 'bg-[#075E54] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Caretaker Babu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Chat Preview Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#E5DDD5] space-y-4">
            <div className="flex justify-center">
              <span className="bg-white/80 backdrop-blur-xs text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full shadow-2xs">
                {activeTab === 'confirmation'
                  ? 'AUTOMATED BOOKING VOUCHER'
                  : activeTab === 'checkin_reminder'
                  ? 'CHECK-IN REMINDER DISPATCH (2:00 PM)'
                  : 'CHECK-OUT REMINDER DISPATCH (11:00 AM)'}
              </span>
            </div>

            {/* Chat Bubble */}
            <div className="max-w-[90%] sm:max-w-[82%] ml-auto bg-[#DCF8C6] rounded-2xl rounded-tr-none p-4 shadow-sm border border-[#c1e7a5] text-gray-900 space-y-2 relative">
              <div className="text-[11px] font-bold text-[#075E54] border-b border-[#075E54]/15 pb-1 flex items-center justify-between">
                <span>Cloud Heaven Resort Bot</span>
                <span className="text-[10px] text-gray-500 font-normal">Automated Dispatch</span>
              </div>

              <pre className="font-sans text-xs whitespace-pre-wrap leading-relaxed text-gray-900 selection:bg-emerald-200">
                {messageText}
              </pre>

              <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 pt-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" /> Copy WhatsApp Message
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

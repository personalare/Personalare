import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  CheckCircle2,
  Copy,
  Printer,
  ExternalLink,
  ShieldCheck,
  Send,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { EmailNotification } from '../types';
import { EmailService } from '../services/emailService';

interface EmailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailNotification | null;
}

export const EmailViewModal: React.FC<EmailViewModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState(false);

  if (!isOpen || !email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(viewMode === 'html' ? email.bodyHtml : email.bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = () => {
    EmailService.resendEmail(email.id);
    setResent(true);
    setTimeout(() => setResent(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(email.bodyHtml || email.bodyText);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-3xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-300">
                    Automated Dispatch System
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-200">
                    {email.type === 'customer_confirmation' ? 'Customer Voucher' : 'Admin Alert'}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white truncate max-w-md">
                  {email.subject}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Metadata Bar */}
          <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div>
                <span className="font-bold text-gray-700">To:</span> {email.recipientName} &lt;
                <strong className="text-emerald-900">{email.recipientEmail}</strong>&gt;
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span>
                  <strong>Sent:</strong> {new Date(email.sentAt).toLocaleString()}
                </span>
                <span>&bull;</span>
                <span>
                  <strong>Status:</strong>{' '}
                  <span className="text-emerald-700 font-bold uppercase">{email.status}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-200/80 rounded-lg p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setViewMode('html')}
                  className={`px-3 py-1 rounded transition-all ${
                    viewMode === 'html'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setViewMode('text')}
                  className={`px-3 py-1 rounded transition-all ${
                    viewMode === 'text'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>
          </div>

          {/* Email Content Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-100/50">
            {viewMode === 'html' ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                  className="w-full"
                />
              </div>
            ) : (
              <pre className="bg-white p-6 rounded-2xl border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                {email.bodyText}
              </pre>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Content' : 'Copy Content'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Email</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResend}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-300" />
                <span>{resent ? 'Confirmation Dispatched!' : 'Resend Email'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

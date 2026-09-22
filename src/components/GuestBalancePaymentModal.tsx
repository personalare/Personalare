import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Booking } from '../types';
import { StorageService } from '../services/storageService';
import { UpiPaymentCard } from './UpiPaymentCard';

interface GuestBalancePaymentModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onPaymentSuccess: (updatedBooking: Booking) => void;
}

export const GuestBalancePaymentModal: React.FC<GuestBalancePaymentModalProps> = ({
  isOpen,
  booking,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen || !booking) return null;

  const balanceDue =
    booking.balanceAmount !== undefined
      ? booking.balanceAmount
      : Math.max(0, booking.finalAmount - (booking.advancePaid || 0));

  const [utrNumber, setUtrNumber] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<
    'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi'
  >('gpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!utrNumber.trim()) {
      setError('Please enter the 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = StorageService.recordPayment(booking.id, {
        amount: balanceDue,
        mode: 'upi',
        referenceId: utrNumber.trim(),
        notes: `Guest paid balance ₹${balanceDue.toLocaleString()} via UPI (${selectedUpiApp.toUpperCase()})`,
        recordedBy: 'Guest',
      });

      if (updated) {
        onPaymentSuccess(updated);
        onClose();
      } else {
        setError('Failed to update booking balance.');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment recording failed.');
    } finally {
      setIsSubmitting(false);
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
          className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Guest Payment Portal
                </span>
                <span className="text-xs text-emerald-200 font-mono">Ref: {booking.id}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                Pay Remaining Stay Balance via UPI
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSettlePayment} className="p-6 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Summary Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="text-gray-500 font-medium">Accommodation:</div>
                <div className="font-bold text-gray-900">
                  {booking.villaTypeLabel || 'Luxury Private Pool Villa'}
                </div>
                <div className="text-gray-600 mt-0.5">
                  Stay: {booking.checkInDate} &rarr; {booking.checkOutDate} ({booking.totalNights} Nights)
                </div>
              </div>

              <div className="text-right">
                <div className="text-gray-500 font-medium">Balance Due Now:</div>
                <div className="font-serif text-2xl font-bold text-emerald-950">
                  ₹{balanceDue.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400">
                  Already Paid: ₹{(booking.advancePaid || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* UPI Payment Card */}
            <UpiPaymentCard
              amount={balanceDue}
              totalTariff={booking.finalAmount}
              bookingRef={booking.id}
              utrNumber={utrNumber}
              onUtrChange={setUtrNumber}
              selectedUpiApp={selectedUpiApp}
              onSelectUpiApp={setSelectedUpiApp}
            />

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-900/10 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Confirming Payment...' : `Confirm & Settle ₹${balanceDue.toLocaleString()}`}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

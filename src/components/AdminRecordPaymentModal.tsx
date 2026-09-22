import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { Booking } from '../types';
import { StorageService } from '../services/storageService';

interface AdminRecordPaymentModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onPaymentRecorded: (updatedBooking: Booking) => void;
}

export const AdminRecordPaymentModal: React.FC<AdminRecordPaymentModalProps> = ({
  isOpen,
  booking,
  onClose,
  onPaymentRecorded,
}) => {
  if (!isOpen || !booking) return null;

  const currentBalance = booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, booking.finalAmount - (booking.advancePaid || 0));

  const [amount, setAmount] = useState<number>(currentBalance);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'bank_transfer' | 'card'>('upi');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState(
    currentBalance > 0
      ? `Settled balance of ₹${currentBalance.toLocaleString()} at check-in`
      : 'Payment recorded'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Please enter a payment amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = StorageService.recordPayment(booking.id, {
        amount,
        mode: paymentMode,
        referenceId: referenceId.trim() || undefined,
        notes: notes.trim(),
        recordedBy: 'Admin',
      });

      if (updated) {
        onPaymentRecorded(updated);
        onClose();
      } else {
        setError('Booking not found to record payment.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment');
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
          className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative z-10 w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Payment Management
              </div>
              <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                Record Payment / Settle Balance
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Booking Snapshot */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold text-gray-900">
                <span>Booking ID: {booking.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {booking.paymentStatus === 'paid' ? 'Paid in Full' : 'Partially Paid'}
                </span>
              </div>
              <div className="text-gray-700">
                Guest: <strong>{booking.userName}</strong> ({booking.userPhone})
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-gray-600">
                <span>Total Tariff: ₹{booking.finalAmount.toLocaleString()}</span>
                <span>Already Paid: ₹{(booking.advancePaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-950 text-sm">
                <span>Remaining Balance Due:</span>
                <span className="text-amber-800 font-serif text-base">₹{currentBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Amount to Collect (₹)
                </label>
                {currentBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(currentBalance)}
                    className="text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Full Balance (₹{currentBalance.toLocaleString()})
                  </button>
                )}
              </div>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash (Direct Collection)</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Transaction Ref / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9812470123"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Payment Remark / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            {/* Payment History Log */}
            {booking.paymentHistory && booking.paymentHistory.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Previous Payment Records:
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {booking.paymentHistory.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <strong className="text-gray-900">₹{p.amount.toLocaleString()}</strong> via{' '}
                        <span className="uppercase font-semibold text-emerald-800">{p.mode}</span>
                        {p.referenceId && <span className="text-gray-500"> ({p.referenceId})</span>}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording...' : 'Confirm Payment'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

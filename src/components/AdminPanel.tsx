import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Shield,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Save,
  Users,
  Search,
  DollarSign,
  AlertTriangle,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageCircle,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import {
  Booking,
  BlockedDate,
  VillaDetails,
  ContactDetails,
  EmailNotification,
  WhatsAppNotification,
} from '../types';
import { BookingSuccessModal } from './BookingSuccessModal';
import { EmailViewModal } from './EmailViewModal';
import { WhatsAppMessageModal } from './WhatsAppMessageModal';
import { AdminPhotoManager } from './AdminPhotoManager';
import { AdminOfflineBookingModal } from './AdminOfflineBookingModal';
import { AdminRecordPaymentModal } from './AdminRecordPaymentModal';
import { Images as ImageIcon, ArrowLeft, CreditCard } from 'lucide-react';

interface AdminPanelProps {
  onBackToCustomer?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToCustomer }) => {
  const [activeTab, setActiveTab] = useState<
    'calendar' | 'bookings' | 'photos' | 'emails' | 'settings' | 'customers'
  >('calendar');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Storage states
  const [bookings, setBookings] = useState<Booking[]>(() => StorageService.getBookings());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(() => StorageService.getBlockedDates());
  const [villa, setVilla] = useState<VillaDetails>(() => StorageService.getVillaDetails());
  const [contact, setContact] = useState<ContactDetails>(() => StorageService.getContactDetails());
  const [usersList, setUsersList] = useState(() => StorageService.getUsers());
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>(() => NotificationService.getEmailLogs());
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppNotification[]>(() =>
    NotificationService.getWhatsAppLogs()
  );
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [selectedWhatsAppBooking, setSelectedWhatsAppBooking] = useState<Booking | null>(null);
  const [selectedWhatsAppType, setSelectedWhatsAppType] = useState<
    'confirmation' | 'checkin_reminder' | 'checkout_reminder'
  >('confirmation');
  const [selectedWhatsAppNotification, setSelectedWhatsAppNotification] =
    useState<WhatsAppNotification | null>(null);
  const [dispatchChannelFilter, setDispatchChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [emailFilter, setEmailFilter] = useState<
    'all' | 'customer_confirmation' | 'admin_booking_alert' | 'checkin_reminder' | 'checkout_reminder'
  >('all');

  // Date blocking form
  const [blockDateStart, setBlockDateStart] = useState('');
  const [blockDateEnd, setBlockDateEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Private Pool & Villa Maintenance');

  // Bookings filter & search
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);

  // Offline booking and payment modals
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);

  // Month navigation for calendar
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const refreshAll = () => {
    setBookings(StorageService.getBookings());
    setBlockedDates(StorageService.getBlockedDates());
    setVilla(StorageService.getVillaDetails());
    setContact(StorageService.getContactDetails());
    setUsersList(StorageService.getUsers());
    setEmailLogs(NotificationService.getEmailLogs());
    setWhatsAppLogs(NotificationService.getWhatsAppLogs());
  };

  // Calendar Helpers
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const daysInMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = formatDateKey(dateObj);

      // Check status
      const blocked = blockedDates.find((b) => b.date === dateKey);
      const booked = bookings.find(
        (b) => b.status === 'confirmed' && dateKey >= b.checkInDate && dateKey < b.checkOutDate
      );

      days.push({
        dayNumber: d,
        dateKey,
        dateObj,
        isBlocked: !!blocked,
        blockedReason: blocked?.reason,
        isBooked: !!booked,
        bookingInfo: booked,
      });
    }
    return days;
  }, [currentMonthDate, blockedDates, bookings]);

  // Handle Block Dates submission
  const handleBlockDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateStart) {
      showFeedback('Please select a start date to block.', 'error');
      return;
    }

    const startDate = new Date(blockDateStart + 'T00:00:00');
    const endDate = blockDateEnd ? new Date(blockDateEnd + 'T00:00:00') : startDate;

    if (endDate < startDate) {
      showFeedback('End date must be equal or after start date.', 'error');
      return;
    }

    let count = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateKey = formatDateKey(cur);
      StorageService.addBlockedDate(dateKey, blockReason);
      count++;
      cur.setDate(cur.getDate() + 1);
    }

    refreshAll();
    setBlockDateStart('');
    setBlockDateEnd('');
    showFeedback(`Successfully blocked ${count} date(s) with reason: "${blockReason}".`);
  };

  const handleUnblockDate = (dateStr: string) => {
    StorageService.removeBlockedDate(dateStr);
    refreshAll();
    showFeedback(`Unblocked ${dateStr}. Available for booking again.`);
  };

  const handleUpdateBookingStatus = (id: string, status: Booking['status']) => {
    StorageService.updateBookingStatus(id, status);
    refreshAll();
    showFeedback(`Booking ${id} status changed to ${status}.`);
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm(`Delete booking record ${id}?`)) {
      StorageService.deleteBooking(id);
      refreshAll();
      showFeedback(`Booking ${id} deleted.`);
    }
  };

  const handleSaveContactDetails = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveContactDetails(contact);
    refreshAll();
    showFeedback('Contact details updated successfully! These are now live across the customer site.');
  };

  const handleSaveVillaDetails = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveVillaDetails(villa);
    refreshAll();
    showFeedback('Villa rates and information updated successfully.');
  };

  // Stats
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalNightsBooked = confirmedBookings.reduce((sum, b) => sum + b.totalNights, 0);

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'confirmed' && b.status !== 'confirmed') return false;
    if (bookingFilter === 'cancelled' && b.status !== 'cancelled') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.userPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-gray-900">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Full Admin Control
            </span>
            <span className="text-xs text-emerald-300 font-medium">Cloud Heaven Estate Management</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mt-1 text-white">
            Resort Admin & Operations Dashboard
          </h1>
          <p className="text-xs text-emerald-200/80 mt-1 font-medium">
            Manage reservations, block dates for maintenance or VIP events, update live photos & gallery, and adjust pricing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Offline Booking</span>
          </button>

          {onBackToCustomer && (
            <button
              onClick={onBackToCustomer}
              className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-700/60 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customer Site</span>
            </button>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-emerald-900/60 p-2.5 sm:p-3.5 rounded-2xl border border-emerald-800/60 shadow-inner">
            <div className="text-center px-1 sm:px-2">
              <div className="text-[9px] sm:text-[10px] uppercase text-emerald-300 font-bold tracking-wider truncate">Total Revenue</div>
              <div className="text-xs sm:text-base font-bold text-white">
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="text-center px-1 sm:px-2 border-x border-emerald-800">
              <div className="text-[9px] sm:text-[10px] uppercase text-emerald-300 font-bold tracking-wider truncate">Booked Nights</div>
              <div className="text-xs sm:text-base font-bold text-white">
                {totalNightsBooked}
              </div>
            </div>
            <div className="text-center px-1 sm:px-2">
              <div className="text-[9px] sm:text-[10px] uppercase text-emerald-300 font-bold tracking-wider truncate">Blocked Dates</div>
              <div className="text-xs sm:text-base font-bold text-rose-300">
                {blockedDates.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-800" /> Calendar & Block Dates ({blockedDates.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-800" /> All Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-emerald-800" /> Photo & Gallery Manager
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'emails'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-800" /> Email Alerts & Logs ({emailLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-800" /> Resort & Contact Details
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-3 rounded-t-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-white border-t-2 border-t-emerald-800 border-x border-gray-200 text-gray-900 font-bold shadow-xs -mb-px'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-800" /> Customer Accounts ({usersList.length})
        </button>
      </div>

      {/* TAB 1: CALENDAR & BLOCK DATES */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Calendar */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Occupancy & Date Status Calendar
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Click dates to inspect status. Blocked dates prevent customer bookings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
                    )
                  }
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <span className="text-xs font-bold text-gray-900 min-w-32 text-center uppercase tracking-wider">
                  {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
                    )
                  }
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {daysInMonth.map((day, idx) => {
                if (!day) return <div key={`admin-empty-${idx}`} className="h-14" />;

                let bgClass = 'bg-gray-50 border-gray-100 text-gray-900 hover:border-gray-300';
                if (day.isBlocked) {
                  bgClass = 'bg-rose-50 border-rose-200 text-rose-900 font-bold';
                } else if (day.isBooked) {
                  bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold';
                }

                return (
                  <div
                    key={day.dateKey}
                    className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between text-xs transition-all relative ${bgClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{day.dayNumber}</span>
                      {day.isBlocked && (
                        <button
                          title="Unblock date"
                          onClick={() => handleUnblockDate(day.dateKey)}
                          className="text-[9px] px-1 py-0.2 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded font-bold cursor-pointer"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                    <div className="text-[9px] truncate font-medium">
                      {day.isBlocked ? (
                        <span className="text-rose-700 font-semibold">Blocked</span>
                      ) : day.isBooked ? (
                        <span className="text-emerald-800 font-semibold">Guest Stay</span>
                      ) : (
                        <span className="text-gray-400">Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                <span>Booked Guest Stay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                <span>Blocked by Admin</span>
              </div>
            </div>
          </div>

          {/* Block Date Action Form */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" /> Block Dates for Villa
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Instantly disable dates on customer booking calendar for pool cleaning, maintenance, or private host reservation.
              </p>

              <form onSubmit={handleBlockDates} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={blockDateStart}
                    onChange={(e) => setBlockDateStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    End Date (Optional single date or range)
                  </label>
                  <input
                    type="date"
                    value={blockDateEnd}
                    onChange={(e) => setBlockDateEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Reason for Blocking
                  </label>
                  <input
                    type="text"
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Infinity Pool Cleaning, Monsoon Maintenance"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  <Ban className="w-4 h-4" /> Block Selected Dates
                </button>
              </form>
            </div>

            {/* Currently Blocked Dates List */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="font-serif text-base font-bold text-gray-900">
                Active Blocked Dates ({blockedDates.length})
              </h4>

              {blockedDates.length === 0 ? (
                <div className="text-xs text-gray-400 py-3 text-center">
                  No dates are currently blocked.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {blockedDates.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-rose-900">{item.date}</div>
                        <div className="text-[10px] text-rose-700 font-medium">{item.reason}</div>
                      </div>
                      <button
                        onClick={() => handleUnblockDate(item.date)}
                        className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold text-[10px] uppercase rounded-lg border border-rose-200 cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Guest Reservations Manager
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Review all customer bookings, modify booking status, or inspect voucher details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsOfflineModalOpen(true)}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Offline Booking</span>
              </button>

              {/* Filter Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs">
                <button
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    bookingFilter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    bookingFilter === 'confirmed' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
                </button>
                <button
                  onClick={() => setBookingFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    bookingFilter === 'cancelled' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none w-56"
                />
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 font-medium">
              No reservations matching your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-3.5 rounded-l-2xl">ID & Guest</th>
                    <th className="p-3.5">Stay Dates (2 PM In / 11 AM Out)</th>
                    <th className="p-3.5">Guests & Addons</th>
                    <th className="p-3.5">Tariff & Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 rounded-r-2xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900">{b.id}</span>
                          {b.bookingSource === 'offline_admin' ? (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-bold rounded uppercase">
                              Offline Direct
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded uppercase">
                              Website (UPI)
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-gray-900 mt-0.5">{b.userName}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{b.userEmail} &bull; {b.userPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">
                          {b.checkInDate} &rarr; {b.checkOutDate}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                          {b.totalNights} Nights &bull; Check-in 2 PM / Out 11 AM
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-gray-700">
                          {b.guests.adults} Adults, {b.guests.children} Children
                        </div>
                        {b.addons.length > 0 && (
                          <div className="text-[10px] text-gray-500 truncate max-w-44 font-medium">
                            + {b.addons.map((a) => a.name).join(', ')}
                          </div>
                        )}
                        {b.specialRequests && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 max-w-xs truncate font-medium">
                            Note: {b.specialRequests}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">
                          ₹{b.finalAmount.toLocaleString()}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              b.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.paymentStatus === 'partially_paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.paymentStatus === 'paid'
                              ? 'Paid in Full'
                              : b.paymentStatus === 'partially_paid'
                              ? 'Part Paid'
                              : 'Pending'}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">
                            {b.paymentMode || 'UPI'}
                          </span>
                        </div>
                        {b.paymentStatus === 'partially_paid' && (
                          <div className="text-[10px] mt-1 space-y-0.5">
                            <div className="text-emerald-800 font-medium">
                              Adv: ₹{(b.advancePaid || 0).toLocaleString()}
                            </div>
                            <div className="text-amber-800 font-bold">
                              Due: ₹{(b.balanceAmount || 0).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setBookingForPayment(b)}
                          title="Record Payment / Settle Balance"
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>₹ Settle</span>
                        </button>
                        <button
                          onClick={() => setSelectedVoucher(b)}
                          title="View Official Voucher"
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          Voucher
                        </button>
                        <button
                          onClick={() => {
                            const emails = NotificationService.getEmailLogsByBookingId(b.id);
                            const customerEmail = emails.find((e) => e.type === 'customer_confirmation') || emails[0];
                            if (customerEmail) {
                              setSelectedEmail(customerEmail);
                            } else {
                              showFeedback('No logged email found for this booking.', 'error');
                            }
                          }}
                          title="Preview Dispatched Confirmation Email"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWhatsAppBooking(b);
                            setSelectedWhatsAppType('confirmation');
                          }}
                          title="Preview / Send WhatsApp Itinerary"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-[#25D366] fill-[#25D366]" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => {
                            NotificationService.sendCheckInReminder(b.id);
                            setSelectedWhatsAppBooking(b);
                            setSelectedWhatsAppType('checkin_reminder');
                            refreshAll();
                            showFeedback(`Dispatched Check-In Reminder for booking ${b.id}`);
                          }}
                          title="Send Check-In Reminder (2 PM)"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          🌄 Check-In
                        </button>
                        <button
                          onClick={() => {
                            NotificationService.sendCheckOutReminder(b.id);
                            setSelectedWhatsAppBooking(b);
                            setSelectedWhatsAppType('checkout_reminder');
                            refreshAll();
                            showFeedback(`Dispatched Check-Out Reminder for booking ${b.id}`);
                          }}
                          title="Send Check-Out Reminder (11 AM)"
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          🌤️ Check-Out
                        </button>
                        {b.status === 'confirmed' ? (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                          >
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHOTO & MEDIA GALLERY MANAGER */}
      {activeTab === 'photos' && (
        <AdminPhotoManager onFeedback={showFeedback} />
      )}

      {/* TAB: AUTOMATED MULTI-CHANNEL DISPATCH HUB & REMINDERS */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">
                  Automated Multi-Channel Dispatch Hub
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">Real-Time Email &amp; WhatsApp Automation</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">
                Booking Confirmations, WhatsApp Itineraries &amp; Reminders
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                Every reservation instantly dispatches confirmation vouchers, caretaker notifications, WhatsApp direct messages, and automated 2 PM check-in / 11 AM check-out prompts.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center min-w-28">
                <span className="text-xl font-bold text-emerald-900">{emailLogs.length}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block mt-0.5">
                  Emails Sent
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center min-w-28">
                <span className="text-xl font-bold text-emerald-900">{whatsAppLogs.length}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block mt-0.5">
                  WhatsApp Dispatches
                </span>
              </div>
            </div>
          </div>

          {/* Channel and Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-600 mr-1">Channel:</span>
              <button
                onClick={() => setDispatchChannelFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dispatchChannelFilter === 'all'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Channels ({emailLogs.length + whatsAppLogs.length})
              </button>
              <button
                onClick={() => setDispatchChannelFilter('email')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dispatchChannelFilter === 'email'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Emails ({emailLogs.length})
              </button>
              <button
                onClick={() => setDispatchChannelFilter('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dispatchChannelFilter === 'whatsapp'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp ({whatsAppLogs.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                refreshAll();
                showFeedback('Dispatch logs refreshed.');
              }}
              className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Email Logs Section */}
          {(dispatchChannelFilter === 'all' || dispatchChannelFilter === 'email') && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-800" />
                <span>Automated Email Transmissions ({emailLogs.length})</span>
              </h4>

              {emailLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                  No email dispatches recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="p-3.5">Type &amp; Status</th>
                        <th className="p-3.5">Recipient</th>
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5">Booking Ref</th>
                        <th className="p-3.5">Sent Time</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  log.type === 'customer_confirmation'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : log.type === 'checkin_reminder'
                                    ? 'bg-blue-100 text-blue-900'
                                    : log.type === 'checkout_reminder'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                {log.type === 'customer_confirmation'
                                  ? 'Customer Voucher'
                                  : log.type === 'checkin_reminder'
                                  ? 'Check-In Reminder'
                                  : log.type === 'checkout_reminder'
                                  ? 'Check-Out Reminder'
                                  : 'Admin Alert'}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900">{log.recipientName}</div>
                            <div className="text-[11px] text-gray-500">{log.recipientEmail}</div>
                          </td>
                          <td className="p-3.5 font-medium text-gray-900 max-w-xs truncate">
                            {log.subject}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-900">
                            {log.bookingId}
                          </td>
                          <td className="p-3.5 text-gray-500 whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedEmail(log)}
                              className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Preview Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Logs Section */}
          {(dispatchChannelFilter === 'all' || dispatchChannelFilter === 'whatsapp') && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
                <span>Automated WhatsApp Transmissions ({whatsAppLogs.length})</span>
              </h4>

              {whatsAppLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                  No WhatsApp dispatches recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="p-3.5">Type &amp; Status</th>
                        <th className="p-3.5">Recipient</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">Booking Ref</th>
                        <th className="p-3.5">Sent Time</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {whatsAppLogs.map((log) => {
                        const targetBooking = bookings.find((b) => b.id === log.bookingId);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    log.type === 'confirmation'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : log.type === 'checkin_reminder'
                                      ? 'bg-blue-100 text-blue-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {log.type === 'confirmation'
                                    ? 'Booking Itinerary'
                                    : log.type === 'checkin_reminder'
                                    ? 'Check-In Reminder'
                                    : 'Check-Out Reminder'}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                  {log.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-gray-900">{log.recipientName}</div>
                            </td>
                            <td className="p-3.5 font-mono text-gray-700 font-medium">
                              {log.recipientPhone}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-900">
                              {log.bookingId}
                            </td>
                            <td className="p-3.5 text-gray-500 whitespace-nowrap">
                              {new Date(log.sentAt).toLocaleString()}
                            </td>
                            <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                              {targetBooking && (
                                <button
                                  onClick={() => {
                                    setSelectedWhatsAppBooking(targetBooking);
                                    setSelectedWhatsAppType(log.type);
                                  }}
                                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                                  <span>View &amp; Resend</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESORT & CONTACT DETAILS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Details Live Editor */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-800" /> Update Live Contact Details
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Configure primary booking desk numbers, caretaker lines, and email dispatches.
              </p>
            </div>

            <form onSubmit={handleSaveContactDetails} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Booking Line
                  </label>
                  <input
                    type="text"
                    required
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    placeholder="+91 89250 14660"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Caretaker Direct Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={contact.caretakerPhone || '+91 73589 56101'}
                    onChange={(e) => setContact({ ...contact, caretakerPhone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    placeholder="+91 73589 56101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    WhatsApp Hotline
                  </label>
                  <input
                    type="text"
                    required
                    value={contact.whatsapp}
                    onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    placeholder="+91 89250 14660"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Reservations Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    placeholder="cloudheavenresort@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Full Property Address & Landmark
                </label>
                <textarea
                  rows={2}
                  required
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    City / Hill Station
                  </label>
                  <input
                    type="text"
                    value={contact.city}
                    onChange={(e) => setContact({ ...contact, city: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={contact.state}
                    onChange={(e) => setContact({ ...contact, state: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={contact.pincode}
                    onChange={(e) => setContact({ ...contact, pincode: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-300" /> Save Contact Details
              </button>
            </form>
          </div>

          {/* Villa Pricing & Rules Settings */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-800" /> 2BHK / 3BHK Rates & Villa Settings
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Configure tiered tariffs: 2 BHK (₹8,000 for 9 pax) and 3 BHK (₹11,000 for 12 pax).
              </p>
            </div>

            <form onSubmit={handleSaveVillaDetails} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-emerald-950">2 BHK Villa Pricing</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Rate per Night (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={villa.bhk2Price || 8000}
                      onChange={(e) =>
                        setVilla({
                          ...villa,
                          bhk2Price: Number(e.target.value),
                          basePricePerNight: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-800 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Max Guests (Pax)
                    </label>
                    <input
                      type="number"
                      required
                      value={villa.bhk2MaxGuests || 9}
                      onChange={(e) => setVilla({ ...villa, bhk2MaxGuests: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-emerald-950">3 BHK Villa Pricing</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Rate per Night (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={villa.bhk3Price || 11000}
                      onChange={(e) => setVilla({ ...villa, bhk3Price: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-800 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Max Guests (Pax)
                    </label>
                    <input
                      type="number"
                      required
                      value={villa.bhk3MaxGuests || 12}
                      onChange={(e) => setVilla({ ...villa, bhk3MaxGuests: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Check-In Time
                  </label>
                  <input
                    type="text"
                    required
                    value={villa.checkInTime}
                    onChange={(e) => setVilla({ ...villa, checkInTime: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Check-Out Time
                  </label>
                  <input
                    type="text"
                    required
                    value={villa.checkOutTime}
                    onChange={(e) => setVilla({ ...villa, checkOutTime: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Villa Tagline & Subheading
                </label>
                <input
                  type="text"
                  required
                  value={villa.tagline}
                  onChange={(e) => setVilla({ ...villa, tagline: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Resort Narrative & Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={villa.description}
                  onChange={(e) => setVilla({ ...villa, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-300" /> Save Villa Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Registered Customer Accounts ({usersList.length})
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Each customer maintains their own private account and reservation history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((u) => {
              const uBookings = bookings.filter((b) => b.userId === u.id);
              const uSpent = uBookings
                .filter((b) => b.status === 'confirmed')
                .reduce((s, b) => s + b.finalAmount, 0);

              return (
                <div
                  key={u.id}
                  className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white font-bold flex items-center justify-center text-sm font-serif border border-emerald-800/40">
                      {u.name.charAt(0)}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-emerald-900 text-emerald-100'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{u.name}</h4>
                    <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                    <div className="text-xs text-gray-500 font-medium">{u.phone}</div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span>
                      Stays: <strong className="text-gray-900">{uBookings.length}</strong>
                    </span>
                    <span>
                      Spend: <strong className="text-emerald-900">₹{uSpent.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voucher viewer modal */}
      <BookingSuccessModal
        isOpen={!!selectedVoucher}
        booking={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        onViewMyBookings={() => setSelectedVoucher(null)}
      />

      {/* Email Viewer Modal */}
      {selectedEmail && (
        <EmailViewModal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          email={selectedEmail}
        />
      )}

      {/* WhatsApp Message Modal */}
      {selectedWhatsAppBooking && (
        <WhatsAppMessageModal
          isOpen={Boolean(selectedWhatsAppBooking)}
          onClose={() => setSelectedWhatsAppBooking(null)}
          booking={selectedWhatsAppBooking}
          defaultType={selectedWhatsAppType}
        />
      )}

      {/* Admin Offline Direct Booking Modal */}
      <AdminOfflineBookingModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onBookingCreated={(newB) => {
          refreshAll();
          showFeedback(`Created offline direct booking #${newB.id} for ${newB.userName} with part payment!`);
        }}
      />

      {/* Admin Payment Recording & Settlement Modal */}
      <AdminRecordPaymentModal
        isOpen={!!bookingForPayment}
        booking={bookingForPayment}
        onClose={() => setBookingForPayment(null)}
        onPaymentRecorded={(updB) => {
          refreshAll();
          showFeedback(`Payment recorded for booking #${updB.id}. Remaining balance: ₹${(updB.balanceAmount || 0).toLocaleString()}`);
        }}
      />
    </div>
  );
};

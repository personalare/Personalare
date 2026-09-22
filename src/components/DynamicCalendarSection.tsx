import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Ban,
  CalendarCheck,
  PlusCircle,
  HelpCircle,
  CloudRain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { BlockedDate, Booking } from '../types';
import { detectVagamonSeasons } from '../utils/vagamonSeasons';

interface DynamicCalendarSectionProps {
  onOpenBookingWithDates: (checkIn: string, checkOut: string) => void;
  onNavigateToAdmin?: () => void;
}

export const DynamicCalendarSection: React.FC<DynamicCalendarSectionProps> = ({
  onOpenBookingWithDates,
  onNavigateToAdmin,
}) => {
  const { isAdmin } = useAuth();
  const villa = StorageService.getVillaDetails();
  const blockedDatesList = StorageService.getBlockedDates();
  const bookingsList = StorageService.getBookings();

  // Current viewed month state (starts at today's month)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Calendar interactive selection state
  const [selectedCheckIn, setSelectedCheckIn] = useState<string>('');
  const [selectedCheckOut, setSelectedCheckOut] = useState<string>('');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  // Auto detect Vagamon peak rainy / festival season for selected calendar dates
  const calendarSeasonAlert = useMemo(() => {
    return detectVagamonSeasons(selectedCheckIn, selectedCheckOut);
  }, [selectedCheckIn, selectedCheckOut]);

  // Admin Quick Block state (inline date toggle for admins)
  const [adminBlockModalDate, setAdminBlockModalDate] = useState<string | null>(null);
  const [adminBlockReason, setAdminBlockReason] = useState<string>('Routine Maintenance');

  // Format Helper: YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Evaluate single day status
  const getDateStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    if (target < today) {
      return { available: false, type: 'past' as const, label: 'Past Date' };
    }

    const blocked = blockedDatesList.find((b) => b.date === dateStr);
    if (blocked) {
      return {
        available: false,
        type: 'blocked' as const,
        label: `Blocked: ${blocked.reason}`,
        blockedItem: blocked,
      };
    }

    const booking = bookingsList.find(
      (b) => b.status !== 'cancelled' && dateStr >= b.checkInDate && dateStr < b.checkOutDate
    );
    if (booking) {
      return {
        available: false,
        type: 'reserved' as const,
        label: `Reserved by ${booking.userName}`,
        bookingItem: booking,
      };
    }

    // Determine weekend vs weekday tariff
    const dayOfWeek = target.getDay(); // 0 is Sun, 6 is Sat, 5 is Fri
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const price = isWeekend ? villa.weekendPricePerNight : villa.basePricePerNight;

    return {
      available: true,
      type: 'available' as const,
      label: 'Available for Reservation',
      price,
      isWeekend,
    };
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Month stats & days grid
  const { days, availableCount, reservedCount, blockedCount } = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArr = [];
    let avail = 0;
    let res = 0;
    let blk = 0;

    for (let i = 0; i < firstDayIndex; i++) {
      daysArr.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = formatDateKey(dateObj);
      const statusObj = getDateStatus(dateKey);

      if (statusObj.type === 'available') avail++;
      if (statusObj.type === 'reserved') res++;
      if (statusObj.type === 'blocked') blk++;

      daysArr.push({
        dayNumber: d,
        dateKey,
        dateObj,
        ...statusObj,
      });
    }

    return {
      days: daysArr,
      availableCount: avail,
      reservedCount: res,
      blockedCount: blk,
    };
  }, [currentMonthDate, blockedDatesList, bookingsList, villa]);

  // Click on a calendar day
  const handleDateClick = (dayData: NonNullable<(typeof days)[0]>) => {
    setSelectionNotice(null);

    // If Admin clicked and wants to manage block
    if (isAdmin && (dayData.type === 'blocked' || dayData.type === 'available')) {
      setAdminBlockModalDate(dayData.dateKey);
      return;
    }

    if (!dayData.available) {
      setSelectionNotice(
        dayData.type === 'reserved'
          ? `Date ${dayData.dateKey} is already reserved by another guest.`
          : `Date ${dayData.dateKey} is unavailable (${dayData.label}).`
      );
      return;
    }

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(dayData.dateKey);
      setSelectedCheckOut('');
      setSelectionNotice(`Check-in set to ${dayData.dateKey}. Now select your check-out date.`);
    } else if (selectedCheckIn && !selectedCheckOut) {
      if (dayData.dateKey <= selectedCheckIn) {
        setSelectedCheckIn(dayData.dateKey);
        setSelectedCheckOut('');
        setSelectionNotice(`Check-in updated to ${dayData.dateKey}.`);
      } else {
        // Validate intervening dates
        const start = new Date(selectedCheckIn + 'T00:00:00');
        const end = new Date(dayData.dateKey + 'T00:00:00');
        let hasConflict = false;
        const cur = new Date(start);

        while (cur < end) {
          const k = formatDateKey(cur);
          const st = getDateStatus(k);
          if (!st.available) {
            hasConflict = true;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasConflict) {
          setSelectionNotice('Selected range contains dates that are reserved or blocked. Please select another range.');
          setSelectedCheckOut('');
        } else {
          setSelectedCheckOut(dayData.dateKey);
          setSelectionNotice(`Selected stay from ${selectedCheckIn} to ${dayData.dateKey}. Ready to book!`);
        }
      }
    }
  };

  // Proceed with selected dates
  const handleProceedBooking = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onOpenBookingWithDates(selectedCheckIn, selectedCheckOut);
    }
  };

  // Admin Quick Block / Unblock Handlers
  const handleToggleAdminBlock = (dateKey: string, reason: string) => {
    const existing = blockedDatesList.find((b) => b.date === dateKey);
    if (existing) {
      StorageService.removeBlockedDate(dateKey);
    } else {
      StorageService.addBlockedDate(dateKey, reason, 'Admin Quick Tool');
    }
    setAdminBlockModalDate(null);
  };

  return (
    <section id="calendar-view" className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
              Live Availability
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
            <span className="text-xs text-gray-500 font-medium">Real-Time Villa Schedule</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
            Dynamic Availability Calendar
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl mt-2 leading-relaxed">
            Check real-time available dates, confirmed reservations, and scheduled maintenance. Select your stay dates directly on the calendar to book your luxury highland retreat.
          </p>
        </div>

        {/* Timings Badge Banner */}
        <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-emerald-300 font-bold block text-[10px] uppercase tracking-wider">
                Check-in
              </span>
              <strong className="text-sm text-white">02:00 PM</strong>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-emerald-800" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-emerald-300 font-bold block text-[10px] uppercase tracking-wider">
                Check-out
              </span>
              <strong className="text-sm text-white">11:00 AM</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Card & Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Dynamic Calendar Grid */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6 w-full">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                Monthly Schedule
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900">
                {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 sm:pb-3 border-b border-gray-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-20" />;
              }

              const isCheckIn = selectedCheckIn === day.dateKey;
              const isCheckOut = selectedCheckOut === day.dateKey;
              const isInRange =
                selectedCheckIn && selectedCheckOut && day.dateKey > selectedCheckIn && day.dateKey < selectedCheckOut;

              let cellStyle = 'bg-white hover:bg-emerald-50/60 border-gray-200 text-gray-900';
              let badge = null;

              if (day.type === 'past') {
                cellStyle = 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed';
              } else if (day.type === 'reserved') {
                cellStyle = 'bg-amber-50/90 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100';
                badge = (
                  <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 bg-amber-100/90 px-0.5 sm:px-1 rounded truncate max-w-full block">
                    Booked
                  </span>
                );
              } else if (day.type === 'blocked') {
                cellStyle = 'bg-rose-50 border-rose-200 text-rose-900 cursor-pointer hover:bg-rose-100';
                badge = (
                  <span className="text-[8px] sm:text-[9px] font-bold text-rose-800 bg-rose-100/90 px-0.5 sm:px-1 rounded truncate max-w-full block">
                    Blocked
                  </span>
                );
              } else if (day.type === 'available') {
                badge = (
                  <span className="text-[8px] sm:text-[10px] font-semibold text-emerald-800 truncate block">
                    ₹{((day.price || 18500) / 1000).toFixed(1)}k
                  </span>
                );
              }

              // Selected Range Styling
              if (isCheckIn || isCheckOut) {
                cellStyle = 'bg-emerald-900 text-white border-emerald-900 shadow-md scale-102 z-10';
                badge = (
                  <span className="text-[7px] sm:text-[9px] font-bold text-emerald-200 uppercase tracking-wider truncate block">
                    {isCheckIn ? 'Check-in' : 'Check-out'}
                  </span>
                );
              } else if (isInRange) {
                cellStyle = 'bg-emerald-100/90 border-emerald-300 text-emerald-950 font-semibold';
                badge = (
                  <span className="text-[8px] sm:text-[9px] font-bold text-emerald-800 truncate block">
                    Stay
                  </span>
                );
              }

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-14 sm:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${cellStyle}`}
                  title={`${day.dateKey} - ${day.label}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isCheckIn || isCheckOut ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {isAdmin && day.type === 'blocked' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <div className="w-full overflow-hidden">{badge}</div>
                </button>
              );
            })}
          </div>

          {/* Calendar Color Legend */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-white border border-gray-300" />
              <span>Available (Click to select)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-900" />
              <span>Selected Stay</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
              <span>Reserved by Guest</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-300" />
              <span>Blocked / Maintenance</span>
            </div>
          </div>
        </div>

        {/* Right: Stay Selection Panel & Admin Direct Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Stay Booking Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-800" /> Reserve Dates
              </h4>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Direct Selection
              </span>
            </div>

            {/* Check-In & Check-Out Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Check-In (2:00 PM)
                </span>
                <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                  {selectedCheckIn || 'Select Date'}
                </strong>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Check-Out (11:00 AM)
                </span>
                <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                  {selectedCheckOut || 'Select Date'}
                </strong>
              </div>
            </div>

            {/* Guidance / Status notice */}
            {selectionNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="font-medium">{selectionNotice}</p>
              </div>
            )}

            {/* Vagamon Seasonal Weather & Festival Notice */}
            {calendarSeasonAlert && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5">
                <CloudRain className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 border border-blue-300 rounded text-blue-900 font-semibold">
                      {calendarSeasonAlert.badge}
                    </span>
                    <span>{calendarSeasonAlert.title}</span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 leading-snug">
                    {calendarSeasonAlert.headline}
                  </p>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <button
              type="button"
              disabled={!selectedCheckIn || !selectedCheckOut}
              onClick={handleProceedBooking}
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>Book Selected Dates</span>
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Includes entire 3-suite villa, private heated pool & caretaker service.
            </p>
          </div>

          {/* Month Summary Stats */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              Month Availability Summary
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white border border-gray-200 rounded-2xl">
                <span className="text-xl font-bold text-emerald-800">{availableCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mt-0.5">
                  Available
                </span>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-2xl">
                <span className="text-xl font-bold text-amber-700">{reservedCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mt-0.5">
                  Booked
                </span>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-2xl">
                <span className="text-xl font-bold text-rose-700">{blockedCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mt-0.5">
                  Blocked
                </span>
              </div>
            </div>
          </div>

          {/* Admin Quick Action Banner */}
          {isAdmin && (
            <div className="bg-emerald-950 text-white rounded-3xl p-6 border border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Admin Controls Active
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                You can click any date on this calendar to quickly mark it as unavailable (e.g. for maintenance or private VIP events) or unblock it.
              </p>
              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Open Full Admin Panel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Block / Unblock Modal */}
      <AnimatePresence>
        {adminBlockModalDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminBlockModalDate(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Admin Date Manager</span>
                </div>
                <button
                  onClick={() => setAdminBlockModalDate(null)}
                  className="text-gray-400 hover:text-gray-900 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Target Date
                </span>
                <h4 className="font-serif text-xl font-bold text-gray-900 mt-0.5">
                  {adminBlockModalDate}
                </h4>
              </div>

              {blockedDatesList.some((b) => b.date === adminBlockModalDate) ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
                    This date is currently <strong>BLOCKED</strong>:{' '}
                    {blockedDatesList.find((b) => b.date === adminBlockModalDate)?.reason}
                  </div>
                  <button
                    onClick={() => handleToggleAdminBlock(adminBlockModalDate, '')}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Unblock Date & Make Available
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Reason for Blocking Date
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Pool Maintenance', 'Monsoon Repairs', 'Private VIP Event', 'Annual Deep Clean'].map(
                        (preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAdminBlockReason(preset)}
                            className={`p-2 rounded-lg text-xs text-left border transition-all cursor-pointer ${
                              adminBlockReason === preset
                                ? 'bg-emerald-50 border-emerald-700 text-emerald-900 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            {preset}
                          </button>
                        )
                      )}
                    </div>
                    <input
                      type="text"
                      value={adminBlockReason}
                      onChange={(e) => setAdminBlockReason(e.target.value)}
                      placeholder="Or enter custom reason"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-800 focus:bg-white outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleToggleAdminBlock(adminBlockModalDate, adminBlockReason)}
                    className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    Mark Date As Unavailable
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

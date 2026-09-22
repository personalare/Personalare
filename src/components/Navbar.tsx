import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Shield,
  LogOut,
  Calendar,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Phone,
  Clock,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentView: 'guest' | 'customer_portal' | 'admin_panel';
  onNavigate: (view: 'guest' | 'customer_portal' | 'admin_panel') => void;
  onOpenAuth: () => void;
  onOpenBooking: () => void;
  onOpenWelcomeGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenBooking,
  onOpenWelcomeGuide,
}) => {
  const { currentUser, isAdmin, logout, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contact = StorageService.getContactDetails();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    onNavigate('guest');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      {/* Top announcement bar */}
      <div className="bg-emerald-950 text-emerald-100 px-3 sm:px-8 lg:px-12 py-1.5 text-[10px] sm:text-[11px] font-medium flex items-center justify-between border-b border-emerald-900/50">
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <Clock className="w-3 h-3 shrink-0" /> Check-in: <strong>02:00 PM</strong> | Check-out: <strong>11:00 AM</strong>
          </span>
          <span className="hidden md:inline text-emerald-700">&bull;</span>
          <span className="hidden md:inline text-emerald-200/80 truncate">
            Exclusive Luxury Pool Villa in Vagamon Hills
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-emerald-200">
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-400" /> {contact.phone}
          </a>
          {/* Quick toggle between Admin and Customer View */}
          <div className="flex items-center bg-emerald-900/80 rounded-lg p-0.5 border border-emerald-800/80 text-[10px]">
            <button
              onClick={() => onNavigate('guest')}
              className={`px-2.5 py-0.5 rounded transition-all font-semibold uppercase tracking-wider cursor-pointer ${
                currentView === 'guest'
                  ? 'bg-white text-emerald-950 shadow-xs font-bold'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Customer View
            </button>
            <button
              onClick={() => {
                if (!isAdmin) {
                  const adminUser = StorageService.getUsers().find((u) => u.role === 'admin');
                  if (adminUser) switchUser(adminUser.id);
                }
                onNavigate('admin_panel');
              }}
              className={`px-2.5 py-0.5 rounded transition-all font-semibold uppercase tracking-wider cursor-pointer ${
                currentView === 'admin_panel'
                  ? 'bg-white text-emerald-950 shadow-xs font-bold'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('guest')}
          className="text-left group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 bg-emerald-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-emerald-800 transition-colors">
            CH
          </div>
          <div className="flex items-center">
            <span className="text-xl font-semibold tracking-tight text-emerald-900 block">
              Cloud Heaven
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 ml-3 hidden sm:inline font-bold">
              Vagamon
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('overview');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors cursor-pointer ${
              currentView === 'guest'
                ? 'text-emerald-900 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            The Villa
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('gallery');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Photo Gallery
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('calendar-view');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Availability Calendar
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('location-map');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Location Map
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('amenities');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Amenities
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('faq');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Policies &amp; FAQs
          </button>
          <button
            onClick={() => {
              onNavigate('customer_portal');
            }}
            className={`transition-colors cursor-pointer ${
              currentView === 'customer_portal'
                ? 'text-emerald-900 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => {
              onNavigate('guest');
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-8 sm:border-l sm:border-gray-200">
          {/* Admin Panel Quick Link */}
          {isAdmin && (
            <button
              onClick={() => onNavigate(currentView === 'admin_panel' ? 'guest' : 'admin_panel')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'admin_panel'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">Admin Mode</span>
            </button>
          )}

          {/* Welcome Guide PDF Button */}
          {onOpenWelcomeGuide && (
            <button
              onClick={onOpenWelcomeGuide}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Download Guest Welcome Guide & Vagamon Itinerary (PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-800" />
              <span>Welcome Guide</span>
              <span className="text-[9px] uppercase tracking-wider bg-emerald-800 text-white font-bold px-1.5 py-0.2 rounded">
                PDF
              </span>
            </button>
          )}

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-gray-50 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-900 font-serif font-bold text-xs sm:text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Customer'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                    {currentUser.name}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="font-bold text-gray-900">{currentUser.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{currentUser.email}</div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          onNavigate('customer_portal');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-medium text-gray-700 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" /> My Bookings
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate('admin_panel');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-medium text-gray-700 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-800" /> Admin Control Panel
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onOpenAuth();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-medium text-gray-700 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-800" /> Switch Profile
                      </button>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Book Stay CTA */}
          <button
            onClick={onOpenBooking}
            className="px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Book Stay</span>
            <span className="sm:hidden">Book</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            {/* Quick Contact & Check-in Badge on Mobile */}
            <div className="bg-emerald-950 text-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs border border-emerald-900">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>In: <strong>2:00 PM</strong> | Out: <strong>11:00 AM</strong></span>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 text-[11px]"
              >
                <Phone className="w-3 h-3 text-emerald-300" /> Call
              </a>
            </div>

            {/* Navigation Links with Icons and Full Accessibility */}
            <div className="grid grid-cols-1 gap-1 text-sm font-medium text-gray-800">
              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('overview');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>The Villa &amp; Pool</span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">3 Suites</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('gallery');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Photo &amp; Video Gallery</span>
                <span className="text-xs text-gray-400">HD Showcase</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('calendar-view');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Availability Calendar</span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">Live Dates</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('amenities');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Estate Amenities</span>
                <span className="text-xs text-gray-400">Chef &amp; Pool</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('location-map');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Location Map &amp; Sights</span>
                <span className="text-xs text-gray-400">Vagamon Hills</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('faq');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Policies &amp; FAQs</span>
                <span className="text-xs text-gray-400">Guidelines</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('guest');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-950 transition-colors flex items-center justify-between min-h-[44px] cursor-pointer"
              >
                <span>Direct Contact &amp; Caretaker</span>
                <span className="text-xs text-gray-400">Concierge</span>
              </button>
            </div>

            {/* Portal & Admin Sections */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {onOpenWelcomeGuide && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWelcomeGuide();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-950 font-bold transition-colors flex items-center justify-between min-h-[44px] border border-emerald-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-800" />
                    <span>Welcome Guide &amp; Rules (PDF)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-emerald-800 text-white px-2 py-0.5 rounded">
                    Download
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('customer_portal');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                  currentView === 'customer_portal'
                    ? 'bg-emerald-100 text-emerald-950 font-bold'
                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>My Bookings (Guest Portal)</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Vouchers</span>
              </button>

              <button
                onClick={() => {
                  if (!isAdmin) {
                    const adminUser = StorageService.getUsers().find((u) => u.role === 'admin');
                    if (adminUser) switchUser(adminUser.id);
                  }
                  onNavigate('admin_panel');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                  currentView === 'admin_panel'
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Operations Panel</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-300">Management</span>
              </button>
            </div>

            {/* Mobile Booking CTA Button */}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Book Villa Stay</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

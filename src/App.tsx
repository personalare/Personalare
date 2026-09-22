import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VillaOverview } from './components/VillaOverview';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { DynamicCalendarSection } from './components/DynamicCalendarSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { FaqSection } from './components/FaqSection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationMapSection } from './components/LocationMapSection';
import { ContactSection } from './components/ContactSection';
import { WhatsAppContactWidget } from './components/WhatsAppContactWidget';
import { MobileBottomBar } from './components/MobileBottomBar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPanel } from './components/AdminPanel';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';
import { WelcomeGuideOptions } from './services/welcomeGuidePdfService';
import { Booking } from './types';
import { StorageService, subscribeToStorage } from './services/storageService';

function MainAppContent() {
  const { currentUser, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'guest' | 'customer_portal' | 'admin_panel'>('guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isWelcomeGuideOpen, setIsWelcomeGuideOpen] = useState(false);
  const [welcomeGuideOptions, setWelcomeGuideOptions] = useState<WelcomeGuideOptions>({});
  const [initialBookingDates, setInitialBookingDates] = useState<{
    checkIn?: string;
    checkOut?: string;
    initialVillaType?: '2bhk' | '3bhk';
  }>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Re-render when storage changes (for live contact details and availability)
  const [, setStorageTick] = useState(0);
  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setStorageTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const handleOpenBooking = (checkIn?: string, checkOut?: string, initialType?: '2bhk' | '3bhk') => {
    setInitialBookingDates({ checkIn, checkOut, initialVillaType: initialType });
    setIsBookingModalOpen(true);
  };

  const handleOpenWelcomeGuide = (opts?: WelcomeGuideOptions) => {
    setWelcomeGuideOptions(opts || { guestName: currentUser?.name });
    setIsWelcomeGuideOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-emerald-900 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBooking={() => handleOpenBooking()}
        onOpenWelcomeGuide={() => handleOpenWelcomeGuide()}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full overflow-x-hidden pb-16 md:pb-0">
        {currentView === 'guest' && (
          <>
            <Hero
              onOpenBookingWithDates={handleOpenBooking}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenWelcomeGuide={() => handleOpenWelcomeGuide()}
            />
            <VillaOverview
              onOpenBooking={(type) => handleOpenBooking(undefined, undefined, type)}
              onOpenWelcomeGuide={() => handleOpenWelcomeGuide()}
            />
            <PhotoGallerySection onOpenBooking={() => handleOpenBooking()} />
            <DynamicCalendarSection
              onOpenBookingWithDates={handleOpenBooking}
              onNavigateToAdmin={() => {
                setCurrentView('admin_panel');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <AmenitiesSection onOpenWelcomeGuide={() => handleOpenWelcomeGuide()} />
            <FaqSection onOpenWelcomeGuide={() => handleOpenWelcomeGuide()} />
            <ReviewsSection />
            <LocationMapSection
              onOpenBooking={() => handleOpenBooking()}
              onOpenWelcomeGuide={() => handleOpenWelcomeGuide()}
            />
            <ContactSection onOpenWelcomeGuide={() => handleOpenWelcomeGuide()} />
          </>
        )}

        {currentView === 'customer_portal' && (
          <CustomerPortal
            onOpenBooking={() => handleOpenBooking()}
            onOpenWelcomeGuide={handleOpenWelcomeGuide}
          />
        )}

        {currentView === 'admin_panel' && (
          <AdminPanel
            onBackToCustomer={() => {
              setCurrentView('guest');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenWelcomeGuide={() => handleOpenWelcomeGuide()}
      />

      {/* Floating WhatsApp Quick Contact Widget */}
      <WhatsAppContactWidget />

      {/* Mobile Sticky Booking Bar */}
      <MobileBottomBar
        onOpenBooking={() => handleOpenBooking()}
        currentView={currentView}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onBookingSuccess={handleBookingSuccess}
        initialCheckIn={initialBookingDates.checkIn}
        initialCheckOut={initialBookingDates.checkOut}
        initialVillaType={initialBookingDates.initialVillaType}
      />

      <BookingSuccessModal
        isOpen={!!confirmedBooking}
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
        onViewMyBookings={() => {
          setConfirmedBooking(null);
          setCurrentView('customer_portal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWelcomeGuide={handleOpenWelcomeGuide}
      />

      <WelcomeGuideModal
        isOpen={isWelcomeGuideOpen}
        onClose={() => setIsWelcomeGuideOpen(false)}
        bookingOptions={welcomeGuideOptions}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

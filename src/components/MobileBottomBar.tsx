import React from 'react';
import { Sparkles, Phone, Calendar, MessageCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface MobileBottomBarProps {
  onOpenBooking: () => void;
  currentView: 'guest' | 'customer_portal' | 'admin_panel';
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenBooking,
  currentView,
}) => {
  const villa = StorageService.getVillaDetails();
  const contact = StorageService.getContactDetails();

  // Only render on guest customer view on mobile
  if (currentView !== 'guest') return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 safe-area-pb">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-900 truncate">
            ₹{villa.basePricePerNight.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">/ night</span>
        </div>
        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider truncate">
          3 Suites • Private Pool
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`tel:${contact.phone}`}
          className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center transition-colors border border-gray-200 shadow-2xs"
          aria-label="Direct Phone Call to Resort Caretaker"
        >
          <Phone className="w-4 h-4 text-emerald-900" />
        </a>

        <button
          onClick={onOpenBooking}
          className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>Book Stay</span>
        </button>
      </div>
    </div>
  );
};

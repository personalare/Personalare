import React from 'react';
import { Clock, Waves, Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface FooterProps {
  onNavigate: (view: 'guest' | 'customer_portal' | 'admin_panel') => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  onOpenWelcomeGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenAuth,
  onOpenWelcomeGuide,
}) => {
  const contact = StorageService.getContactDetails();
  const villa = StorageService.getVillaDetails();

  return (
    <footer className="bg-emerald-950 text-white pt-16 pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-emerald-900/60 pb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs text-white">
                CH
              </div>
              <span className="text-xl font-bold tracking-tight">Cloud Heaven</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold">Vagamon</span>
            </div>
            <p className="text-xs text-emerald-300/80 max-w-sm leading-relaxed">
              Private luxury pool villa estate in Vagamon, Kerala. Experience secluded hill station serenity surrounded by misty tea valleys, pine woods, and starry night skies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Standard Check-in: <strong className="text-white">{villa.checkInTime}</strong> &bull; Check-out: <strong className="text-white">{villa.checkOutTime}</strong>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Explore Resort
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button
                  onClick={() => onNavigate('guest')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  The Villa &amp; Pool
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Book Your Stay
                </button>
              </li>
              {onOpenWelcomeGuide && (
                <li>
                  <button
                    onClick={onOpenWelcomeGuide}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-emerald-400 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Welcome Guide &amp; Rules (PDF)</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    onNavigate('guest');
                    const el = document.getElementById('faq');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Policies &amp; FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('customer_portal')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Customer Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin_panel')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Admin Operations Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Direct Contact
            </h4>
            <div className="space-y-1.5 text-xs text-emerald-200/80">
              <div>Phone: <span className="text-white font-medium">{contact.phone}</span></div>
              <div>WhatsApp: <span className="text-white font-medium">{contact.whatsapp}</span></div>
              <div>Email: <span className="text-white font-medium">{contact.email}</span></div>
              <div className="text-[11px] pt-1 text-emerald-400/80">
                {contact.city}, {contact.state}, India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/70">
          <div>
            &copy; {new Date().getFullYear()} Cloud Heaven Resort, Vagamon. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Private Pool Villa</span>
            <span>&bull;</span>
            <span>Check-in 2 PM / Out 11 AM</span>
            <span>&bull;</span>
            <button
              onClick={() => onNavigate('admin_panel')}
              className="text-emerald-300 hover:underline font-semibold cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

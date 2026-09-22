import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  Navigation,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface ContactSectionProps {
  onOpenWelcomeGuide?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenWelcomeGuide }) => {
  const contact = StorageService.getContactDetails();
  const villa = StorageService.getVillaDetails();

  return (
    <section id="contact" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
            Location & Concierge
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Connect with Cloud Heaven
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            We are nestled atop the misty cliffs of Vagamon, Kerala. Our concierge team is available to assist you with route guidance, custom itineraries, and reservations.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Timings & Policies */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-xs space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Check-In & Stay Timings
            </h3>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between border-b border-gray-200/80 pb-2">
                <span>Check-In Time:</span>
                <strong className="text-gray-900 font-semibold">{villa.checkInTime}</strong>
              </div>
              <div className="flex justify-between border-b border-gray-200/80 pb-2">
                <span>Check-Out Time:</span>
                <strong className="text-gray-900 font-semibold">{villa.checkOutTime}</strong>
              </div>
              <div className="flex justify-between">
                <span>Property Privacy:</span>
                <strong className="text-emerald-800 font-bold">Entire Private Villa</strong>
              </div>
              {onOpenWelcomeGuide && (
                <div className="pt-2 border-t border-gray-200/80">
                  <button
                    type="button"
                    onClick={onOpenWelcomeGuide}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Welcome Guide (PDF)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-xs space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Direct Phone & Caretaker
            </h3>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Primary Reservations:
                </span>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm font-bold text-gray-900 hover:text-emerald-800 transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
              {contact.altPhone && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                    Alternate / Caretaker:
                  </span>
                  <a
                    href={`tel:${contact.altPhone}`}
                    className="text-xs font-semibold text-gray-800 hover:text-emerald-800 transition-colors"
                  >
                    {contact.altPhone}
                  </a>
                </div>
              )}
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  WhatsApp Concierge:
                </span>
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 mt-0.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp ({contact.whatsapp})
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Address & Location */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-xs space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Estate Location
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="leading-relaxed">
                {contact.address}, {contact.landmark}, {contact.city}, {contact.state} - {contact.pincode}
              </p>
              <div className="pt-2 border-t border-gray-200/80">
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                >
                  <Navigation className="w-3.5 h-3.5" /> Open Google Maps Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

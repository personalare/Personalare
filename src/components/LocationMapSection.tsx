import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Car,
  Clock,
  Layers,
  Sparkles,
  Mountain,
  Eye,
  Trees,
  Footprints,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

// Coordinates & Landmarks in and around Vagamon
export interface AttractionPoint {
  id: string;
  name: string;
  category: 'villa' | 'viewpoint' | 'nature' | 'adventure' | 'heritage';
  categoryLabel: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  elevationMeters: number;
  description: string;
  highlight: string;
  image: string;
  googleMapsQuery: string;
}

export const VAGAMON_ATTRACTIONS: AttractionPoint[] = [
  {
    id: 'cloud-heaven',
    name: 'Cloud Heaven Private Pool Villa',
    category: 'villa',
    categoryLabel: 'Resort Sanctuary',
    lat: 9.6875,
    lng: 76.9082,
    distanceKm: 0,
    driveTimeMin: 0,
    elevationMeters: 1100,
    description:
      'Perched on the private cliff-edge of Kurisumala Ashram Road with 180° uninterrupted panoramic views of pine valleys and cascading clouds.',
    highlight: 'Private heated infinity pool, secluded cliff-edge estate, personal butler service.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Cloud+Heaven+Vagamon+Kerala',
  },
  {
    id: 'pine-forest',
    name: 'Vagamon Pine Forest',
    category: 'nature',
    categoryLabel: 'Natural Wonder',
    lat: 9.6961,
    lng: 76.9189,
    distanceKm: 2.1,
    driveTimeMin: 6,
    elevationMeters: 1120,
    description:
      'A dense forest of towering British-planted pine trees on sloping hill gradients, famous for ethereal morning mist, movie shoots, and peaceful walking trails.',
    highlight: 'Enchanting sunbeams through towering pines, calm pine needle carpets, birdwatching.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Vagamon+Pine+Forest+Kerala',
  },
  {
    id: 'kurisumala-ashram',
    name: 'Kurisumala Ashram & Hilltop',
    category: 'viewpoint',
    categoryLabel: 'Scenic Viewpoint',
    lat: 9.6758,
    lng: 76.8995,
    distanceKm: 2.8,
    driveTimeMin: 8,
    elevationMeters: 1250,
    description:
      'Spiritual Christian monastery on a verdant hill top surrounded by dairy farms, offering a contemplative trek with 360-degree views across Sahyadri peaks.',
    highlight: 'Spectacular sunset vantage point, tranquil dairy farm meadows, cloud inversions.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Kurisumala+Ashram+Vagamon',
  },
  {
    id: 'vagamon-meadows',
    name: 'Vagamon Meadows (Green Hills)',
    category: 'nature',
    categoryLabel: 'Grassland & Lake',
    lat: 9.6912,
    lng: 76.8872,
    distanceKm: 3.6,
    driveTimeMin: 9,
    elevationMeters: 1080,
    description:
      'Rolling green velveteen hills with a central tranquil lake, perfect for serene strolls, paddle boating, and capturing idyllic landscape photography.',
    highlight: 'Silky green rolling mounds, lake paddle boating, breeze that feels like Switzerland.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Vagamon+Meadows+Kerala',
  },
  {
    id: 'murugan-mala',
    name: 'Murugan Mala (Sunrise Peak)',
    category: 'viewpoint',
    categoryLabel: 'Highland Peak',
    lat: 9.6811,
    lng: 76.9247,
    distanceKm: 3.2,
    driveTimeMin: 8,
    elevationMeters: 1200,
    description:
      'A sacred rock-cut temple atop a single large granite hillock offering sensational views of dawn breaking over endless tea estates and spice gardens.',
    highlight: 'Rock-cut heritage cave shrine, first morning sun rays, Western Ghats vistas.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Murugan+Mala+Vagamon',
  },
  {
    id: 'thangal-para',
    name: 'Thangal Para & Ancient Caves',
    category: 'heritage',
    categoryLabel: 'Heritage Landmark',
    lat: 9.6698,
    lng: 76.8834,
    distanceKm: 4.8,
    driveTimeMin: 12,
    elevationMeters: 1180,
    description:
      'A unique spherical giant boulder balanced miraculously on a high rocky cliff edge, featuring ancient cave systems and Sufi heritage.',
    highlight: 'Huge spherical boulder monument, natural cave formations, rugged cliff treks.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Thangal+Para+Vagamon',
  },
  {
    id: 'marmala-waterfall',
    name: 'Marmala / Vagamon Waterfalls',
    category: 'adventure',
    categoryLabel: 'Adventure & Falls',
    lat: 9.6612,
    lng: 76.8421,
    distanceKm: 14.5,
    driveTimeMin: 32,
    elevationMeters: 850,
    description:
      'A majestic 60-meter cascading waterfall tucked inside dense teak forests and rocky gorges, accessible via an exhilarating 4x4 Jeep excursion.',
    highlight: 'Crystal clear plunge pool, scenic jeep trail, surrounded by untouched jungle.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
    googleMapsQuery: 'Marmala+Waterfalls+Kerala',
  },
];

interface LocationMapSectionProps {
  onOpenBooking?: () => void;
  onOpenWelcomeGuide?: () => void;
}

export const LocationMapSection: React.FC<LocationMapSectionProps> = ({
  onOpenBooking,
  onOpenWelcomeGuide,
}) => {
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionPoint>(VAGAMON_ATTRACTIONS[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'viewpoint' | 'nature' | 'adventure' | 'heritage'>('all');
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isCopied, setIsCopied] = useState(false);

  const contact = StorageService.getContactDetails();

  const filteredAttractions = VAGAMON_ATTRACTIONS.filter((a) =>
    activeCategory === 'all' ? true : a.category === activeCategory || a.id === 'cloud-heaven'
  );

  // Exact coordinates for Cloud Heaven
  const villaLat = 9.6875;
  const villaLng = 76.9082;

  // Compute Google Maps Embed URL for selected attraction
  const embedMapUrl = `https://maps.google.com/maps?q=${selectedAttraction.lat},${selectedAttraction.lng}&z=${mapZoom}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&hl=en&output=embed`;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${villaLat}° N, ${villaLng}° E (${contact.address})`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section id="location-map" className="py-16 sm:py-20 bg-gray-50/50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold tracking-widest uppercase text-emerald-800">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hyperlocal Geography &amp; Coordinates</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Villa Location &amp; Vagamon Sightseeing Map
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Situated atop the private ridge of Kurisumala Ashram Road at an elevation of <strong>1,100 meters</strong>, Cloud Heaven places you within minutes of Vagamon's most scenic pine valleys, meadows, and mountain viewpoints.
            </p>
          </div>

          {/* Direct Coordinate & Navigation Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyCoordinates}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-gray-900 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Coordinates Copied!</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{villaLat}° N, {villaLng}° E</span>
                </>
              )}
            </button>

            {onOpenWelcomeGuide && (
              <button
                type="button"
                onClick={onOpenWelcomeGuide}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Download 3-Page PDF Sightseeing Guide & Villa Rules"
              >
                <Download className="w-3.5 h-3.5 text-emerald-800" />
                <span>Guide &amp; Map (PDF)</span>
              </button>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${villaLat},${villaLng}&destination_place_id=Cloud+Heaven+Vagamon`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/10 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-300" />
              <span>Get Driving Directions</span>
            </a>
          </div>
        </div>

        {/* Interactive Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Points of Interest & Distances (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-gray-100 shadow-xs">
              {[
                { id: 'all', label: 'All Places' },
                { id: 'viewpoint', label: 'Viewpoints' },
                { id: 'nature', label: 'Nature & Pines' },
                { id: 'adventure', label: 'Falls & Treks' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Attractions List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredAttractions.map((attraction) => {
                const isSelected = selectedAttraction.id === attraction.id;
                const isVilla = attraction.id === 'cloud-heaven';

                return (
                  <motion.div
                    key={attraction.id}
                    onClick={() => {
                      setSelectedAttraction(attraction);
                      if (isVilla) setMapZoom(15);
                      else setMapZoom(14);
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-white border-emerald-700 shadow-md ring-1 ring-emerald-700'
                        : isVilla
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-white border-gray-100 hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isVilla && (
                        <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-emerald-200" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isVilla
                              ? 'bg-emerald-900 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {attraction.categoryLabel}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
                          {isVilla ? (
                            <span className="text-emerald-800 font-bold">You Are Here</span>
                          ) : (
                            <>
                              <Car className="w-3 h-3 text-gray-400" />
                              <span>{attraction.driveTimeMin} min ({attraction.distanceKm} km)</span>
                            </>
                          )}
                        </div>
                      </div>

                      <h4
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-emerald-950' : 'text-gray-900'
                        }`}
                      >
                        {attraction.name}
                      </h4>

                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {attraction.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Drive Summary Card */}
            <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-300">
                  Prime Proximity
                </span>
                <span className="text-xs font-semibold text-emerald-200">
                  Kurisumala Ashram Rd
                </span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Cloud Heaven offers private car parking with direct road access suitable for all sedans, SUVs, and EV charging points upon request.
              </p>
            </div>
          </div>

          {/* RIGHT: Live Interactive Map Frame & Selected Landmark Card (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Map Container */}
            <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-xs space-y-3">
              {/* Map Controls Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-gray-900">
                    Showing: {selectedAttraction.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Layer Toggle */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl text-[11px] font-semibold text-gray-600">
                    <button
                      onClick={() => setMapType('roadmap')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapType === 'roadmap' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      onClick={() => setMapType('satellite')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapType === 'satellite' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                      title="Zoom in"
                      className="p-1 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-xs cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMapZoom((z) => Math.max(z - 1, 10))}
                      title="Zoom out"
                      className="p-1 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-xs cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Iframe */}
              <div className="w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                <iframe
                  title={`Map showing ${selectedAttraction.name}`}
                  src={embedMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />

                {/* Floating Map Legend Indicator */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-md text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-800 fill-emerald-800" />
                  <span>{selectedAttraction.name}</span>
                </div>
              </div>

              {/* Selected Attraction Deep Dive */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                      {selectedAttraction.categoryLabel}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-gray-900">
                      {selectedAttraction.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedAttraction.googleMapsQuery
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-900 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      <span>Open in Maps</span>
                    </a>

                    {onOpenBooking && (
                      <button
                        onClick={onOpenBooking}
                        className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Book Villa Stay</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedAttraction.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/80 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Altitude</span>
                    <span className="font-bold text-gray-900">{selectedAttraction.elevationMeters}m ASL</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Distance from Villa</span>
                    <span className="font-bold text-emerald-800">
                      {selectedAttraction.distanceKm === 0 ? '0 km (On-site)' : `${selectedAttraction.distanceKm} km`}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Estimated Travel</span>
                    <span className="font-bold text-gray-900">
                      {selectedAttraction.driveTimeMin === 0 ? 'Resort Estate' : `${selectedAttraction.driveTimeMin} min drive`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

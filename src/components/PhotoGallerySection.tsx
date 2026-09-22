import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Bed,
  Home,
  Waves,
  Mountain,
  Calendar,
  Share2,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { GalleryCategory, GalleryItem } from '../types';
import { StorageService, subscribeToStorage } from '../services/storageService';

interface PhotoGallerySectionProps {
  onOpenBooking: () => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ onOpenBooking }) => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [photos, setPhotos] = useState<GalleryItem[]>(() => StorageService.getGalleryPhotos());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setPhotos(StorageService.getGalleryPhotos());
    });
    return unsub;
  }, []);

  // Lightbox view state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Touch gesture support
  const touchStartXRef = useRef<number | null>(null);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Filtered photos
  const filteredPhotos = photos.filter((photo) => {
    if (activeCategory === 'all') return true;
    return photo.category === activeCategory;
  });

  const selectedPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  // Reset zoom on photo change
  useEffect(() => {
    setZoomLevel(1);
  }, [selectedPhotoIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (selectedPhotoIndex !== null && thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[selectedPhotoIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedPhotoIndex]);

  // Lightbox Navigation
  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSlideDirection('left');
    setSelectedPhotoIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
  }, [selectedPhotoIndex, filteredPhotos.length]);

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSlideDirection('right');
    setSelectedPhotoIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
  }, [selectedPhotoIndex, filteredPhotos.length]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleToggleZoom = () => {
    setZoomLevel((prev) => (prev > 1 ? 1 : 2));
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (lightboxContainerRef.current?.requestFullscreen) {
        lightboxContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(!isFullscreen);
        });
      } else {
        setIsFullscreen(!isFullscreen);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Share / Copy image link
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPhoto) return;
    navigator.clipboard.writeText(selectedPhoto.highResUrl || selectedPhoto.imageUrl);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') {
        if (zoomLevel > 1) {
          setZoomLevel(1);
        } else {
          setSelectedPhotoIndex(null);
        }
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key.toLowerCase() === 'f') handleToggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handlePrev, handleNext, zoomLevel, isFullscreen]);

  // Touch gesture listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || zoomLevel > 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (diffX > 50) {
      handleNext();
    } else if (diffX < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const categoryTabs: { key: GalleryCategory; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'all',
      label: 'All Photography',
      icon: <Images className="w-3.5 h-3.5" />,
      count: photos.length,
    },
    {
      key: 'interior',
      label: 'Villa Interior',
      icon: <Bed className="w-3.5 h-3.5" />,
      count: photos.filter((p) => p.category === 'interior').length,
    },
    {
      key: 'exterior',
      label: 'Villa Exterior',
      icon: <Home className="w-3.5 h-3.5" />,
      count: photos.filter((p) => p.category === 'exterior').length,
    },
    {
      key: 'pool',
      label: 'Swimming Pool',
      icon: <Waves className="w-3.5 h-3.5" />,
      count: photos.filter((p) => p.category === 'pool').length,
    },
    {
      key: 'scenic',
      label: 'Scenic Views of Vagamon',
      icon: <Mountain className="w-3.5 h-3.5" />,
      count: photos.filter((p) => p.category === 'scenic').length,
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-gray-50/70 border-y border-gray-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                Visual Sanctuary
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
              <span className="text-xs text-gray-500 font-medium">Curated Resort Imagery</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
              Resort &amp; Scenic Gallery
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mt-2 leading-relaxed">
              Explore the master suites, architectural facades, private infinity pool, and the misty hills of Vagamon. Click any photo to view in high-resolution full-screen mode.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="self-start md:self-auto px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span>Book Your Stay</span>
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key);
                  setSelectedPhotoIndex(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/10'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Photo Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedPhotoIndex(index)}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer aspect-[4/3] flex flex-col justify-end"
              >
                {/* Image */}
                <img
                  src={photo.imageUrl}
                  alt={photo.altText}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle Gradient Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                    {photo.categoryLabel}
                  </span>
                  {photo.featured && (
                    <span className="px-2 py-1 bg-emerald-700/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-emerald-200 border border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Text */}
                <div className="relative z-10 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <h3 className="font-serif text-base font-bold text-white leading-snug">
                    {photo.title}
                  </h3>
                  <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5 opacity-90 group-hover:opacity-100">
                    {photo.description}
                  </p>
                </div>

                {/* Expand Hover Icon & Fullscreen Prompt */}
                <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <span className="px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 hidden sm:inline">
                    View HD
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            ref={lightboxContainerRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhotoIndex(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-lg"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`relative z-10 w-full bg-neutral-950/95 border border-neutral-800 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full ${
                isFullscreen ? 'max-w-none max-h-none sm:rounded-none' : 'max-w-6xl max-h-[96vh]'
              }`}
            >
              {/* Lightbox Top Control Bar */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-neutral-800/80 flex items-center justify-between text-white bg-neutral-950/90 backdrop-blur-md">
                {/* Left Info */}
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {selectedPhoto.categoryLabel}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {selectedPhotoIndex! + 1} / {filteredPhotos.length}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-emerald-400 font-mono">
                    <Eye className="w-3 h-3 text-emerald-400" /> Ultra HD High-Res
                  </span>
                </div>

                {/* Right Action Tools */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Zoom Controls */}
                  <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5 mr-1">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                      title="Zoom Out (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 text-[11px] font-mono text-neutral-300 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                      title="Zoom In (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    {zoomLevel > 1 && (
                      <button
                        onClick={handleResetZoom}
                        className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer ml-0.5"
                        title="Reset Zoom (100%)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Share Link */}
                  <button
                    onClick={handleShare}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer relative"
                    title="Copy Photo Link"
                  >
                    {showCopiedToast ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer hidden sm:block"
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen View (F)'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {/* Reserve Villa Direct Action */}
                  <button
                    onClick={() => {
                      setSelectedPhotoIndex(null);
                      onOpenBooking();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hidden sm:flex items-center gap-1.5 shadow-sm shadow-emerald-900/40"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Reserve Villa</span>
                  </button>

                  {/* Close Modal */}
                  <button
                    onClick={() => setSelectedPhotoIndex(null)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer ml-1"
                    aria-label="Close photo viewer"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Image Canvas Stage */}
              <div className="relative flex-1 bg-black/95 flex items-center justify-center p-2 sm:p-6 overflow-hidden min-h-[300px]">
                {/* Navigation: Left arrow */}
                <button
                  onClick={handlePrev}
                  className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md"
                  aria-label="Previous photo"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Animated Image View */}
                <div
                  className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
                  onDoubleClick={handleToggleZoom}
                >
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.img
                      key={selectedPhoto.id}
                      custom={slideDirection}
                      initial={{ opacity: 0, x: slideDirection === 'right' ? 40 : -40 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: zoomLevel,
                      }}
                      exit={{ opacity: 0, x: slideDirection === 'right' ? -40 : 40 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      src={selectedPhoto.highResUrl || selectedPhoto.imageUrl}
                      alt={selectedPhoto.altText}
                      className="max-h-[62vh] sm:max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
                      referrerPolicy="no-referrer"
                      style={{
                        cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                      }}
                    />
                  </AnimatePresence>
                </div>

                {/* Navigation: Right arrow */}
                <button
                  onClick={handleNext}
                  className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md"
                  aria-label="Next photo"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Helper Key Controls Tooltip (bottom center of stage) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-3 px-3.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[11px] text-neutral-400">
                  <span>Double-click or +/- to zoom</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>Use ← → keys to navigate</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>Esc to exit</span>
                </div>
              </div>

              {/* Lightbox Footer & Thumbnail Filmstrip */}
              <div className="px-4 sm:px-6 py-3.5 bg-neutral-900 border-t border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                {/* Photo Description */}
                <div className="space-y-0.5 max-w-md">
                  <h4 className="font-serif text-base sm:text-lg font-bold text-white">
                    {selectedPhoto.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {selectedPhoto.description}
                  </p>
                </div>

                {/* Filmstrip Carousel */}
                <div
                  ref={thumbnailStripRef}
                  className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full md:max-w-lg"
                >
                  {filteredPhotos.map((thumb, idx) => {
                    const isCurrent = idx === selectedPhotoIndex;
                    return (
                      <button
                        key={thumb.id}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105 opacity-100'
                            : 'border-neutral-700/80 opacity-50 hover:opacity-90'
                        }`}
                        title={thumb.title}
                      >
                        <img
                          src={thumb.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-emerald-950/20" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

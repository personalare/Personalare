import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Star,
  ExternalLink,
  Eye,
  Filter,
  X,
  CheckCircle2,
  Info,
  Layers,
  Camera,
  Compass,
} from 'lucide-react';
import { GalleryItem, VillaDetails, GalleryCategory } from '../types';
import { StorageService } from '../services/storageService';
import { DEFAULT_VILLA, GALLERY_PHOTOS } from '../data/mockData';

interface AdminPhotoManagerProps {
  onFeedback: (text: string, type?: 'success' | 'error') => void;
}

// Curated high quality presets for 1-click photo replacement
const CURATED_PHOTO_PRESETS = [
  {
    title: 'Luxury Villa Architectural Facade',
    category: 'exterior' as const,
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80',
    description: 'Modern cantilevered architectural villa overlooking the emerald tea valleys.',
  },
  {
    title: 'Private Infinity Pool with Valley View',
    category: 'pool' as const,
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&q=80',
    description: 'Private infinity edge swimming pool gazing into the mist-covered mountain peaks.',
  },
  {
    title: 'Master King Suite Bedroom',
    category: 'interior' as const,
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80',
    description: 'Minimalist luxury bedroom with plush king bedding and valley panoramic glazing.',
  },
  {
    title: 'Sunlit Living Room & Teak Lounge',
    category: 'interior' as const,
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    description: 'Spacious lounge with handcrafted wooden furniture and natural sunlight.',
  },
  {
    title: 'Cantilevered Balcony Timber Deck',
    category: 'exterior' as const,
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    description: 'Outdoor timber viewing deck looking directly over early morning cloud beds.',
  },
  {
    title: 'Misty Vagamon Mountain Valleys',
    category: 'scenic' as const,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    description: 'Rolling green tea plantations and dense fog in the Western Ghats slopes.',
  },
  {
    title: 'Floating Pool Breakfast Basket',
    category: 'pool' as const,
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    description: 'Artisanal tropical breakfast platter served on a wicker basket floating in the pool.',
  },
  {
    title: 'Vagamon Pine Forest Sunlight',
    category: 'scenic' as const,
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    description: 'Morning sunlight piercing through towering green pine forest trees.',
  },
  {
    title: 'Campfire & Starry Night Lawn',
    category: 'exterior' as const,
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
    description: 'Lush green estate lawn with stone fire pit and outdoor dining space.',
  },
  {
    title: 'Ensuite Luxury Teak Bathtub',
    category: 'interior' as const,
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    description: 'Contemporary freestanding deep soaking bathtub with rain shower and mountain air.',
  },
  {
    title: 'Illuminated Night Swimming Pool',
    category: 'pool' as const,
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
    description: 'Warm fiber-optic pool lighting reflecting dusk twilight and fog.',
  },
  {
    title: 'Cloud Inversion & Rugged Peaks',
    category: 'scenic' as const,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    description: 'Sea of white clouds covering the valley below while emerald peaks rise above.',
  },
];

const SHOWCASE_SLOTS: {
  key: keyof VillaDetails['images'];
  label: string;
  description: string;
  aspect: string;
  defaultUrl: string;
}[] = [
  {
    key: 'hero',
    label: 'Hero Banner Main Image',
    description: 'The primary greeting image displayed at the top of the homepage and booking header.',
    aspect: '16:9 Landscape',
    defaultUrl: DEFAULT_VILLA.images.hero,
  },
  {
    key: 'pool',
    label: 'Private Infinity Pool Showcase',
    description: 'Featured in villa overview and amenity highlights showcasing the heated infinity pool.',
    aspect: '4:3 Standard',
    defaultUrl: DEFAULT_VILLA.images.pool,
  },
  {
    key: 'bedroom',
    label: 'Master King Suite Bedroom',
    description: 'Showcasing luxury king suite accommodations and panoramic windows.',
    aspect: '16:10 Wide',
    defaultUrl: DEFAULT_VILLA.images.bedroom,
  },
  {
    key: 'living',
    label: 'Living Room & Teak Lounge',
    description: 'Displayed in interior spaces showcase and guest amenity gallery.',
    aspect: '16:10 Wide',
    defaultUrl: DEFAULT_VILLA.images.living,
  },
  {
    key: 'balcony',
    label: 'Balcony Deck & Cloud View',
    description: 'Highlighted in outdoor relaxation and mountain view features.',
    aspect: '16:10 Wide',
    defaultUrl: DEFAULT_VILLA.images.balcony,
  },
  {
    key: 'mistValley',
    label: 'Misty Valley Scenic View',
    description: 'Showcasing the surrounding Vagamon pine ridges and tea plantations.',
    aspect: '16:10 Wide',
    defaultUrl: DEFAULT_VILLA.images.mistValley,
  },
];

export const AdminPhotoManager: React.FC<AdminPhotoManagerProps> = ({ onFeedback }) => {
  const [villa, setVilla] = useState<VillaDetails>(() => StorageService.getVillaDetails());
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryItem[]>(() => StorageService.getGalleryPhotos());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<GalleryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Target slot for preset selector or direct editing
  const [presetTarget, setPresetTarget] = useState<{
    type: 'showcase' | 'gallery_new' | 'gallery_edit';
    showcaseKey?: keyof VillaDetails['images'];
  } | null>(null);

  // Edit / Add Photo Modal
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [isAddingNewPhoto, setIsAddingNewPhoto] = useState(false);
  const [newPhotoForm, setNewPhotoForm] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'exterior',
    categoryLabel: 'Villa Exterior',
    description: '',
    imageUrl: '',
    highResUrl: '',
    altText: '',
    featured: false,
  });

  // Preview Lightbox
  const [previewImageUrl, setPreviewImageUrl] = useState<{ url: string; title: string } | null>(null);

  // Helper for file upload to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onFeedback('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    // Limit file size to ~3MB to avoid localStorage quota issues
    if (file.size > 3.5 * 1024 * 1024) {
      onFeedback('Image is too large. Please select an image under 3.5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        onSuccess(result);
        onFeedback('Photo successfully loaded from your device!');
      }
    };
    reader.onerror = () => {
      onFeedback('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // 1. Update Showcase Image
  const handleUpdateShowcaseImage = (key: keyof VillaDetails['images'], newUrl: string) => {
    const updated = {
      ...villa,
      images: {
        ...villa.images,
        [key]: newUrl,
      },
    };
    setVilla(updated);
    StorageService.saveVillaDetails(updated);
    onFeedback(`Updated ${key} showcase photo successfully! Changes are live across the site.`);
  };

  // Reset Showcase Image to default
  const handleResetShowcaseImage = (key: keyof VillaDetails['images']) => {
    const defaultUrl = DEFAULT_VILLA.images[key];
    handleUpdateShowcaseImage(key, defaultUrl);
  };

  // 2. Add New Gallery Photo
  const handleSaveNewGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoForm.title || !newPhotoForm.imageUrl) {
      onFeedback('Please provide a photo title and image URL.', 'error');
      return;
    }

    const category = (newPhotoForm.category || 'exterior') as 'interior' | 'exterior' | 'pool' | 'scenic';
    const categoryLabels: Record<string, string> = {
      interior: 'Villa Interior',
      exterior: 'Villa Exterior',
      pool: 'Swimming Pool',
      scenic: 'Scenic Views of Vagamon',
    };

    const newPhoto: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newPhotoForm.title.trim(),
      category,
      categoryLabel: newPhotoForm.categoryLabel || categoryLabels[category] || 'Villa Exterior',
      description: newPhotoForm.description?.trim() || 'Exclusive photo of Cloud Heaven Vagamon.',
      imageUrl: newPhotoForm.imageUrl.trim(),
      highResUrl: newPhotoForm.highResUrl?.trim() || newPhotoForm.imageUrl.trim(),
      altText: newPhotoForm.altText?.trim() || newPhotoForm.title.trim(),
      featured: !!newPhotoForm.featured,
    };

    StorageService.addGalleryPhoto(newPhoto);
    setGalleryPhotos(StorageService.getGalleryPhotos());
    setIsAddingNewPhoto(false);
    setNewPhotoForm({
      title: '',
      category: 'exterior',
      categoryLabel: 'Villa Exterior',
      description: '',
      imageUrl: '',
      highResUrl: '',
      altText: '',
      featured: false,
    });
    onFeedback(`Added "${newPhoto.title}" to photo gallery!`);
  };

  // 3. Edit Existing Gallery Photo
  const handleUpdateGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    StorageService.updateGalleryPhoto(editingPhoto.id, editingPhoto);
    setGalleryPhotos(StorageService.getGalleryPhotos());
    setEditingPhoto(null);
    onFeedback(`Updated "${editingPhoto.title}" details successfully!`);
  };

  // 4. Delete Gallery Photo
  const handleDeletePhoto = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the gallery?`)) {
      StorageService.deleteGalleryPhoto(id);
      setGalleryPhotos(StorageService.getGalleryPhotos());
      onFeedback(`Removed "${title}" from gallery.`);
    }
  };

  // 5. Toggle Featured status
  const handleToggleFeatured = (photo: GalleryItem) => {
    const updatedStatus = !photo.featured;
    StorageService.updateGalleryPhoto(photo.id, { featured: updatedStatus });
    setGalleryPhotos(StorageService.getGalleryPhotos());
    onFeedback(
      updatedStatus
        ? `Marked "${photo.title}" as Featured in highlights.`
        : `Removed Featured badge from "${photo.title}".`
    );
  };

  // 6. Reset All Gallery Photos to original default
  const handleResetAllGalleryPhotos = () => {
    if (
      window.confirm(
        'Reset all gallery photos back to the original default curated collection? This will restore all standard photos.'
      )
    ) {
      StorageService.resetGalleryPhotos();
      setGalleryPhotos(StorageService.getGalleryPhotos());
      onFeedback('Gallery photos have been reset to default.');
    }
  };

  // Filtered Gallery Photos
  const filteredPhotos = galleryPhotos.filter((p) => {
    if (activeCategoryFilter !== 'all' && p.category !== activeCategoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* SECTION 1: CORE VILLA SHOWCASE PHOTOS */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-800" />
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Main Villa Showcase Photos
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Change the core imagery displayed on the Hero banner, Infinity Pool showcase, Master Suites, and Lounge sections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVilla(DEFAULT_VILLA);
                StorageService.saveVillaDetails(DEFAULT_VILLA);
                onFeedback('Reset all showcase photos to default villa imagery.');
              }}
              className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Showcase</span>
            </button>
          </div>
        </div>

        {/* Grid of 6 Showcase Photo Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOWCASE_SLOTS.map((slot) => {
            const currentUrl = villa.images[slot.key];
            const isCustom = currentUrl !== slot.defaultUrl;

            return (
              <div
                key={slot.key}
                className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all shadow-2xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{slot.label}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-600 font-semibold">
                      {slot.aspect}
                    </span>
                  </div>

                  {/* Photo Preview Container */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-gray-900 border border-gray-200 group/img">
                    <img
                      src={currentUrl}
                      alt={slot.label}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl({ url: currentUrl, title: slot.label })}
                        className="p-2 bg-white/90 text-gray-900 rounded-xl hover:bg-white shadow-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full View
                      </button>
                    </div>

                    {isCustom && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Custom Photo
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">{slot.description}</p>
                </div>

                {/* Action Controls for this Photo */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {/* URL Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => handleUpdateShowcaseImage(slot.key, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons: Upload, Presets, Reset */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <label className="flex-1 px-2.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3 text-emerald-300" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) =>
                            handleUpdateShowcaseImage(slot.key, dataUrl)
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setPresetTarget({ type: 'showcase', showcaseKey: slot.key })
                      }
                      className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-emerald-50 hover:text-emerald-900 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Presets</span>
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleResetShowcaseImage(slot.key)}
                        title="Reset to default photo"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PHOTO GALLERY COLLECTION MANAGER */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-800" />
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Photo Gallery Collection ({galleryPhotos.length} Photos)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add new photography, re-categorize, replace high-res images, edit descriptions, and toggle featured highlights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetAllGalleryPhotos}
              className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNewPhoto(true)}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add New Photo</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: 'all', label: 'All Photos' },
                { key: 'exterior', label: 'Exterior' },
                { key: 'interior', label: 'Interior' },
                { key: 'pool', label: 'Swimming Pool' },
                { key: 'scenic', label: 'Scenic Vagamon' },
              ] as { key: GalleryCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategoryFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategoryFilter === tab.key
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search photo titles or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none w-full sm:w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Gallery Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="font-serif text-base font-bold text-gray-800">No Photos Found</h4>
            <p className="text-xs text-gray-500">
              No photos matched the category filter or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Image Card */}
                  <div className="relative aspect-[16/10] bg-gray-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.altText || photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-xs text-emerald-200 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {photo.category}
                      </span>
                    </div>

                    {photo.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl({ url: photo.highResUrl || photo.imageUrl, title: photo.title })}
                        className="p-2 bg-white/90 text-gray-900 rounded-xl hover:bg-white shadow-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full View
                      </button>
                    </div>
                  </div>

                  {/* Photo Info */}
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                      {photo.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(photo)}
                      title={photo.featured ? 'Remove Featured' : 'Mark as Featured'}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        photo.featured
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-white border-gray-200 text-gray-400 hover:text-amber-600'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${photo.featured ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingPhoto(photo)}
                      title="Edit photo details"
                      className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-emerald-50 hover:text-emerald-900 text-gray-700 font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-800" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id, photo.title)}
                    title="Delete photo"
                    className="p-1.5 bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: PRESET PHOTO PICKER */}
      <AnimatePresence>
        {presetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100 shadow-2xl"
            >
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Curated High-Res Vagamon Photography
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select any pre-optimized luxury photo to apply instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPresetTarget(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CURATED_PHOTO_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (presetTarget.type === 'showcase' && presetTarget.showcaseKey) {
                        handleUpdateShowcaseImage(presetTarget.showcaseKey, preset.url);
                      } else if (presetTarget.type === 'gallery_new') {
                        setNewPhotoForm((prev) => ({
                          ...prev,
                          title: prev.title || preset.title,
                          category: preset.category,
                          imageUrl: preset.url,
                          highResUrl: preset.url,
                          description: prev.description || preset.description,
                        }));
                      } else if (presetTarget.type === 'gallery_edit' && editingPhoto) {
                        setEditingPhoto((prev) =>
                          prev
                            ? {
                                ...prev,
                                imageUrl: preset.url,
                                highResUrl: preset.url,
                              }
                            : null
                        );
                      }
                      setPresetTarget(null);
                      onFeedback(`Selected preset "${preset.title}"!`);
                    }}
                    className="border border-gray-200 rounded-2xl p-3 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white space-y-2 group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-gray-900">
                      <img
                        src={preset.thumb}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded uppercase">
                        {preset.category}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-serif text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                        {preset.title}
                      </h5>
                      <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPresetTarget(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold uppercase rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD NEW GALLERY PHOTO */}
      <AnimatePresence>
        {isAddingNewPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 shadow-2xl"
            >
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-800" /> Add New Photo to Gallery
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload an image or paste a high-resolution photo URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewPhoto(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewGalleryPhoto} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Image URL & File Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Photo Image Source *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={newPhotoForm.imageUrl || ''}
                      onChange={(e) =>
                        setNewPhotoForm((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                          highResUrl: prev.highResUrl || e.target.value,
                        }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />

                    <label className="px-3 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) =>
                            setNewPhotoForm((prev) => ({
                              ...prev,
                              imageUrl: dataUrl,
                              highResUrl: dataUrl,
                            }))
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPresetTarget({ type: 'gallery_new' })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Preset</span>
                    </button>
                  </div>

                  {newPhotoForm.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden aspect-[16/9] max-h-40 border border-gray-200 bg-gray-900">
                      <img
                        src={newPhotoForm.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Photo Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhotoForm.title || ''}
                    onChange={(e) => setNewPhotoForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Sunset Infinity Pool Glow"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                {/* Category & Label */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newPhotoForm.category || 'exterior'}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        const labels: Record<string, string> = {
                          interior: 'Villa Interior',
                          exterior: 'Villa Exterior',
                          pool: 'Swimming Pool',
                          scenic: 'Scenic Views of Vagamon',
                        };
                        setNewPhotoForm((prev) => ({
                          ...prev,
                          category: cat,
                          categoryLabel: labels[cat] || 'Villa Exterior',
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    >
                      <option value="exterior">Exterior</option>
                      <option value="interior">Interior</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="scenic">Scenic Views</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Category Display Label
                    </label>
                    <input
                      type="text"
                      value={newPhotoForm.categoryLabel || ''}
                      onChange={(e) =>
                        setNewPhotoForm((prev) => ({ ...prev, categoryLabel: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newPhotoForm.description || ''}
                    onChange={(e) =>
                      setNewPhotoForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of this area or view..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="newFeaturedToggle"
                    checked={!!newPhotoForm.featured}
                    onChange={(e) =>
                      setNewPhotoForm((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="w-4 h-4 text-emerald-900 rounded border-gray-300 focus:ring-emerald-800"
                  />
                  <label htmlFor="newFeaturedToggle" className="text-xs font-semibold text-gray-800 cursor-pointer">
                    Show as Featured Highlight in Gallery
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPhoto(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
                  >
                    Save Photo to Gallery
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT EXISTING GALLERY PHOTO */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 shadow-2xl"
            >
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-800" /> Edit Photo: {editingPhoto.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update image URL, replace photo file, or modify descriptions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateGalleryPhoto} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Image URL & File Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Image URL / File *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={editingPhoto.imageUrl}
                      onChange={(e) =>
                        setEditingPhoto((prev) =>
                          prev
                            ? {
                                ...prev,
                                imageUrl: e.target.value,
                                highResUrl: e.target.value,
                              }
                            : null
                        )
                      }
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />

                    <label className="px-3 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) =>
                            setEditingPhoto((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    imageUrl: dataUrl,
                                    highResUrl: dataUrl,
                                  }
                                : null
                            )
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPresetTarget({ type: 'gallery_edit' })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Preset</span>
                    </button>
                  </div>

                  <div className="mt-2 rounded-xl overflow-hidden aspect-[16/9] max-h-40 border border-gray-200 bg-gray-900">
                    <img
                      src={editingPhoto.imageUrl}
                      alt={editingPhoto.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Photo Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPhoto.title}
                    onChange={(e) =>
                      setEditingPhoto((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                {/* Category & Label */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingPhoto.category}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        const labels: Record<string, string> = {
                          interior: 'Villa Interior',
                          exterior: 'Villa Exterior',
                          pool: 'Swimming Pool',
                          scenic: 'Scenic Views of Vagamon',
                        };
                        setEditingPhoto((prev) =>
                          prev
                            ? {
                                ...prev,
                                category: cat,
                                categoryLabel: labels[cat] || prev.categoryLabel,
                              }
                            : null
                        );
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    >
                      <option value="exterior">Exterior</option>
                      <option value="interior">Interior</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="scenic">Scenic Views</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Category Display Label
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.categoryLabel}
                      onChange={(e) =>
                        setEditingPhoto((prev) =>
                          prev ? { ...prev, categoryLabel: e.target.value } : null
                        )
                      }
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingPhoto.description}
                    onChange={(e) =>
                      setEditingPhoto((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editFeaturedToggle"
                    checked={!!editingPhoto.featured}
                    onChange={(e) =>
                      setEditingPhoto((prev) =>
                        prev ? { ...prev, featured: e.target.checked } : null
                      )
                    }
                    className="w-4 h-4 text-emerald-900 rounded border-gray-300 focus:ring-emerald-800"
                  />
                  <label htmlFor="editFeaturedToggle" className="text-xs font-semibold text-gray-800 cursor-pointer">
                    Show as Featured Highlight in Gallery
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
                  >
                    Update Photo Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: IMAGE FULLSCREEN PREVIEW */}
      <AnimatePresence>
        {previewImageUrl && (
          <div
            onClick={() => setPreviewImageUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img
                src={previewImageUrl.url}
                alt={previewImageUrl.title}
                className="w-full h-full max-h-[80vh] object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-gray-950/90 text-white flex items-center justify-between">
                <span className="font-serif text-sm font-bold">{previewImageUrl.title}</span>
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(null)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

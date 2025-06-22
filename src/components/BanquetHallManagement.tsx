import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Save, 
  MapPin, 
  Users, 
  DollarSign,
  Camera,
  Image as ImageIcon,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Clock
} from 'lucide-react';
import { BanquetHall } from '../types';

interface BanquetHallManagementProps {
  onClose: () => void;
}

export function BanquetHallManagement({ onClose }: BanquetHallManagementProps) {
  const { banquetHalls, banquetAmenities, addBanquetHall, updateBanquetHall, deleteBanquetHall } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [showForm, setShowForm] = useState(false);
  const [editingHall, setEditingHall] = useState<BanquetHall | null>(null);
  const [selectedHall, setSelectedHall] = useState<BanquetHall | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || showPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showPreview]);

  const CustomItemManager = ({ 
    items, 
    onAdd, 
    onRemove, 
    placeholder,
    label 
  }: { 
    items: string[]; 
    onAdd: (value: string) => void; 
    onRemove: (index: number) => void; 
    placeholder: string;
    label: string;
  }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim()) {
        onAdd(newItem.trim());
        setNewItem('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        {items.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{label} ({items.length})</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">No {label.toLowerCase()} added yet</p>
            <p className="text-xs text-gray-400 mt-1">Use the input above to add items</p>
          </div>
        )}
      </div>
    );
  };

  const HallForm = () => {
    const [formData, setFormData] = useState({
      name: editingHall?.name || '',
      capacity: editingHall?.capacity || 50,
      rate: editingHall?.rate || 200,
      photos: editingHall?.photos || [],
      amenities: editingHall?.amenities || [],
      size: editingHall?.size || 100,
      location: editingHall?.location || '',
      setupOptions: editingHall?.setupOptions || [],
      cateringOptions: editingHall?.cateringOptions || [],
      availableEquipment: editingHall?.availableEquipment || [],
      minimumHours: editingHall?.minimumHours || 4,
      cancellationPolicy: editingHall?.cancellationPolicy || 'Cancellation allowed up to 48 hours before event'
    });

    const [newPhoto, setNewPhoto] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingPhoto(true);
      try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create a data URL for demo purposes
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, dataUrl]
          }));
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadingPhoto(false);
      }
    };

    const addPhotoFromUrl = () => {
      if (newPhoto.trim()) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto.trim()]
        }));
        setNewPhoto('');
      }
    };

    const removePhoto = (index: number) => {
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    };

    const toggleAmenity = (amenityName: string) => {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.includes(amenityName)
          ? prev.amenities.filter(a => a !== amenityName)
          : [...prev.amenities, amenityName]
      }));
    };

    const addCustomItem = (field: 'setupOptions' | 'cateringOptions' | 'availableEquipment', value: string) => {
      if (value.trim()) {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field] || []), value.trim()]
        }));
      }
    };

    const removeCustomItem = (field: 'setupOptions' | 'cateringOptions' | 'availableEquipment', index: number) => {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] || []).filter((_, i) => i !== index)
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingHall) {
        updateBanquetHall(editingHall.id, formData);
      } else {
        addBanquetHall(formData);
      }
      
      setShowForm(false);
      setEditingHall(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingHall ? 'Edit Banquet Hall' : 'Add New Banquet Hall'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingHall(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hall Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Ground Floor, East Wing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (guests)</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate per Hour ({hotelSettings.baseCurrency})
                    </label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size (sq ft)</label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Hours</label>
                    <input
                      type="number"
                      value={formData.minimumHours}
                      onChange={(e) => setFormData({ ...formData, minimumHours: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Management */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Photos</h4>
                
                {/* Photo Upload */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="url"
                        value={newPhoto}
                        onChange={(e) => setNewPhoto(e.target.value)}
                        placeholder="Enter photo URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={addPhotoFromUrl}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                  
                  {uploadingPhoto && (
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      <span className="text-sm">Uploading photo...</span>
                    </div>
                  )}
                </div>

                {/* Photo Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Hall photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.photos.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-center">No photos added yet</p>
                      <p className="text-sm text-gray-400 text-center">Upload photos to showcase your banquet hall</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {banquetAmenities.filter(a => a.isActive).map((amenity) => (
                    <label key={amenity.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.name)}
                        onChange={() => toggleAmenity(amenity.name)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Setup Options */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Setup Options</h4>
                <CustomItemManager
                  items={formData.setupOptions || []}
                  onAdd={(value) => addCustomItem('setupOptions', value)}
                  onRemove={(index) => removeCustomItem('setupOptions', index)}
                  placeholder="e.g., Theater Style, Banquet Style, U-Shape"
                  label="Setup Options"
                />
              </div>

              {/* Catering Options */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Catering Options</h4>
                <CustomItemManager
                  items={formData.cateringOptions || []}
                  onAdd={(value) => addCustomItem('cateringOptions', value)}
                  onRemove={(index) => removeCustomItem('cateringOptions', index)}
                  placeholder="e.g., Buffet Service, Plated Dinner, Cocktail Reception"
                  label="Catering Options"
                />
              </div>

              {/* Available Equipment */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Equipment</h4>
                <CustomItemManager
                  items={formData.availableEquipment || []}
                  onAdd={(value) => addCustomItem('availableEquipment', value)}
                  onRemove={(index) => removeCustomItem('availableEquipment', index)}
                  placeholder="e.g., Projector, Microphone, Podium"
                  label="Available Equipment"
                />
              </div>

              {/* Cancellation Policy */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h4>
                <textarea
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter cancellation policy details..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHall(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingHall ? 'Update Hall' : 'Create Hall'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const HallPreview = () => {
    if (!selectedHall) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            {selectedHall.photos.length > 0 && (
              <img
                src={selectedHall.photos[0]}
                alt={selectedHall.name}
                className="w-full h-80 object-cover rounded-t-2xl"
              />
            )}
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedHall(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedHall.name}</h2>
                {selectedHall.location && (
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedHall.location}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedHall.rate)}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hall Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Capacity: {selectedHall.capacity} guests</span>
                  </div>
                  {selectedHall.size && (
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span>Size: {selectedHall.size} sq ft</span>
                    </div>
                  )}
                  {selectedHall.minimumHours && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>Minimum booking: {selectedHall.minimumHours} hours</span>
                    </div>
                  )}
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHall.amenities.map((amenity) => (
                    <span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                {selectedHall.setupOptions && selectedHall.setupOptions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Setup Options</h4>
                    <div className="space-y-2">
                      {selectedHall.setupOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedHall.cateringOptions && selectedHall.cateringOptions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Catering Options</h4>
                    <div className="space-y-2">
                      {selectedHall.cateringOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedHall.availableEquipment && selectedHall.availableEquipment.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Equipment</h4>
                    <div className="space-y-2">
                      {selectedHall.availableEquipment.map((equipment, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{equipment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedHall.photos.length > 1 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedHall.photos.slice(1).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${selectedHall.name} ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedHall.cancellationPolicy && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
                <p className="text-gray-700">{selectedHall.cancellationPolicy}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Banquet Hall Management</h2>
              <p className="text-gray-600 mt-2">Manage your banquet halls, amenities, and configurations</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hall</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Halls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banquetHalls.map((hall) => (
              <div key={hall.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {hall.photos.length > 0 ? (
                    <img
                      src={hall.photos[0]}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{hall.name}</h3>
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(hall.rate)}/hr</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Up to {hall.capacity} guests</span>
                    </div>
                    {hall.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{hall.location}</span>
                      </div>
                    )}
                    {hall.size && (
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{hall.size} sq ft</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hall.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {hall.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{hall.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedHall(hall);
                        setShowPreview(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingHall(hall);
                        setShowForm(true);
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this hall?')) {
                          deleteBanquetHall(hall.id);
                        }
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {banquetHalls.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
                <Users className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Banquet Halls</h3>
                <p className="text-gray-600 text-center mb-6">Get started by adding your first banquet hall</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Hall</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && <HallForm />}
      {showPreview && <HallPreview />}
    </div>
  );
}
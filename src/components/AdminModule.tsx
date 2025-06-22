import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BrandingSettings } from './BrandingSettings';
import { ShiftManagement } from './ShiftManagement';
import { 
  Users, 
  Settings, 
  Palette, 
  Shield, 
  Database,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Bed,
  Home,
  MapPin,
  Star,
  Camera,
  Utensils,
  Music,
  Clock,
  Calendar,
  X,
  Image as ImageIcon,
  Move,
  RotateCcw
} from 'lucide-react';

export function AdminModule() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const { branding, updateBranding, exportBranding, importBranding } = useBranding();
  const { 
    rooms, 
    addRoom, 
    updateRoom, 
    deleteRoom, 
    banquetHalls, 
    addBanquetHall, 
    updateBanquetHall, 
    deleteBanquetHall, 
    restaurantTables, 
    addRestaurantTable, 
    updateRestaurantTable, 
    deleteRestaurantTable 
  } = useHotel();
  const { hotelSettings, updateHotelSettings, currencies } = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'users' | 'branding' | 'rooms' | 'banquet' | 'restaurant' | 'shifts' | 'settings'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [showBanquetForm, setShowBanquetForm] = useState(false);
  const [editingBanquet, setEditingBanquet] = useState<any>(null);
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update branding with current timestamp
      updateBranding({ 
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin'
      });
      
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleQuickSave = () => {
    handleSave();
  };

  const handleExportData = () => {
    const exportData = {
      branding,
      hotelSettings,
      users: users.map(u => ({ ...u, password: undefined })), // Remove passwords
      rooms,
      banquetHalls,
      restaurantTables,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vervconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.branding) {
            importBranding(JSON.stringify(data.branding));
          }
          if (data.hotelSettings) {
            updateHotelSettings(data.hotelSettings);
          }
          alert('Data imported successfully!');
          handleSave(); // Auto-save after import
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Image URL validator
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) !== null;
    } catch {
      return false;
    }
  };

  // Image Gallery Component
  const ImageGallery = ({ 
    images, 
    onAdd, 
    onRemove, 
    onReorder, 
    title = "Images",
    maxImages = 10 
  }: {
    images: string[];
    onAdd: (url: string) => void;
    onRemove: (index: number) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    title?: string;
    maxImages?: number;
  }) => {
    const [newImageUrl, setNewImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (images.length >= maxImages) {
          alert(`Maximum ${maxImages} images allowed`);
          return;
        }
        
        setUploadingImage(true);
        try {
          const imageUrl = await handleImageUpload(file);
          onAdd(imageUrl);
        } catch (error) {
          alert('Failed to upload image');
        } finally {
          setUploadingImage(false);
        }
      }
    };

    const handleAddImageUrl = () => {
      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }
      
      if (newImageUrl && isValidImageUrl(newImageUrl)) {
        onAdd(newImageUrl);
        setNewImageUrl('');
      } else {
        alert('Please enter a valid image URL (jpg, png, gif, webp, svg)');
      }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        onReorder(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{title}</label>
        
        {/* Current Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {images.map((photo, index) => (
              <div 
                key={index} 
                className="relative group cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="relative">
                  <img
                    src={photo}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg';
                    }}
                  />
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="bg-blue-500 text-white rounded-full p-2">
                        <Move className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary Image Indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Primary
                    </div>
                  )}
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Image Options */}
        {images.length < maxImages && (
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Add {title.toLowerCase()}</p>
              <p className="text-xs text-gray-500">
                {images.length}/{maxImages} images • First image will be the primary image
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploadingImage && (
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Uploading image...
                </p>
              )}
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Or Add Image URL</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!newImageUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP, SVG
              </p>
            </div>

            {/* Sample Images */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Add Sample Images</p>
              <div className="grid grid-cols-2 gap-2">
                {title.toLowerCase().includes('room') ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onAdd('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg')}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Modern Room
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd('https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg')}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Luxury Suite
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onAdd('https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg')}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Grand Ballroom
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd('https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg')}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Conference Hall
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UserForm = () => {
    const [formData, setFormData] = useState({
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      role: editingUser?.role || 'front-desk',
      department: editingUser?.department || '',
      phoneNumber: editingUser?.phoneNumber || '',
      emergencyContact: editingUser?.emergencyContact || '',
      notes: editingUser?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
        updateUser(editingUser.id, formData);
      } else {
        addUser(formData);
      }
      setShowUserForm(false);
      setEditingUser(null);
      handleSave(); // Auto-save after user changes
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <h3 className="text-2xl font-bold mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="front-desk">Front Desk</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="restaurant">Restaurant</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingUser ? 'Update' : 'Create'} User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RoomForm = () => {
    const [formData, setFormData] = useState({
      number: editingRoom?.number || '',
      type: editingRoom?.type || 'single',
      rate: editingRoom?.rate || 0,
      floor: editingRoom?.floor || 1,
      maxOccupancy: editingRoom?.maxOccupancy || 2,
      size: editingRoom?.size || 25,
      bedType: editingRoom?.bedType || 'Queen',
      view: editingRoom?.view || 'City',
      smokingAllowed: editingRoom?.smokingAllowed || false,
      amenities: editingRoom?.amenities || ['WiFi', 'AC', 'TV'],
      photos: editingRoom?.photos || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.photos.length === 0) {
        // Add default image if no photos provided
        formData.photos = ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'];
      }
      
      const roomData = {
        ...formData,
        status: 'clean' as const
      };
      
      if (editingRoom) {
        updateRoom(editingRoom.id, roomData);
      } else {
        addRoom(roomData);
      }
      setShowRoomForm(false);
      setEditingRoom(null);
      handleSave();
    };

    const handleAddImage = (url: string) => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, url]
      }));
    };

    const handleRemoveImage = (index: number) => {
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    };

    const handleReorderImages = (fromIndex: number, toIndex: number) => {
      setFormData(prev => {
        const newPhotos = [...prev.photos];
        const [removed] = newPhotos.splice(fromIndex, 1);
        newPhotos.splice(toIndex, 0, removed);
        return { ...prev, photos: newPhotos };
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-5xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
            <button
              onClick={() => {
                setShowRoomForm(false);
                setEditingRoom(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Night</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Occupancy</label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (sq m)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type</label>
                <select
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Single">Single</option>
                  <option value="Queen">Queen</option>
                  <option value="King">King</option>
                  <option value="Two Queens">Two Queens</option>
                  <option value="King + Sofa Bed">King + Sofa Bed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <select
                  value={formData.view}
                  onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="City">City</option>
                  <option value="Ocean">Ocean</option>
                  <option value="Garden">Garden</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Pool">Pool</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.smokingAllowed}
                  onChange={(e) => setFormData({ ...formData, smokingAllowed: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
              </label>
            </div>

            {/* Image Management */}
            <ImageGallery
              images={formData.photos}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
              onReorder={handleReorderImages}
              title="Room Images"
              maxImages={8}
            />
            
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowRoomForm(false);
                  setEditingRoom(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {editingRoom ? 'Update' : 'Create'} Room
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BanquetForm = () => {
    const [formData, setFormData] = useState({
      name: editingBanquet?.name || '',
      capacity: editingBanquet?.capacity || 50,
      rate: editingBanquet?.rate || 200,
      amenities: editingBanquet?.amenities || ['Audio System', 'Lighting', 'Catering'],
      photos: editingBanquet?.photos || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.photos.length === 0) {
        // Add default image if no photos provided
        formData.photos = ['https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg'];
      }
      
      if (editingBanquet) {
        updateBanquetHall(editingBanquet.id, formData);
      } else {
        addBanquetHall(formData);
      }
      setShowBanquetForm(false);
      setEditingBanquet(null);
      handleSave();
    };

    const handleAddImage = (url: string) => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, url]
      }));
    };

    const handleRemoveImage = (index: number) => {
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    };

    const handleReorderImages = (fromIndex: number, toIndex: number) => {
      setFormData(prev => {
        const newPhotos = [...prev.photos];
        const [removed] = newPhotos.splice(fromIndex, 1);
        newPhotos.splice(toIndex, 0, removed);
        return { ...prev, photos: newPhotos };
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingBanquet ? 'Edit Banquet Hall' : 'Add New Banquet Hall'}</h3>
            <button
              onClick={() => {
                setShowBanquetForm(false);
                setEditingBanquet(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Hour</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 200 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Image Management */}
            <ImageGallery
              images={formData.photos}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
              onReorder={handleReorderImages}
              title="Banquet Hall Images"
              maxImages={10}
            />
            
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowBanquetForm(false);
                  setEditingBanquet(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {editingBanquet ? 'Update' : 'Create'} Hall
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TableForm = () => {
    const [formData, setFormData] = useState({
      number: editingTable?.number || '',
      seats: editingTable?.seats || 2,
      position: editingTable?.position || { x: 100, y: 100 }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const tableData = {
        ...formData,
        status: 'available' as const
      };
      
      if (editingTable) {
        updateRestaurantTable(editingTable.id, tableData);
      } else {
        addRestaurantTable(tableData);
      }
      setShowTableForm(false);
      setEditingTable(null);
      handleSave();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
            <button
              onClick={() => {
                setShowTableForm(false);
                setEditingTable(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="12"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                <input
                  type="number"
                  value={formData.position.x}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    position: { ...formData.position, x: parseInt(e.target.value) || 100 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                <input
                  type="number"
                  value={formData.position.y}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    position: { ...formData.position, y: parseInt(e.target.value) || 100 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="300"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTableForm(false);
                  setEditingTable(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingTable ? 'Update' : 'Create'} Table
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SaveStatusIndicator = () => (
    <div className="flex items-center space-x-2">
      {saveStatus === 'saving' && (
        <div className="flex items-center space-x-2 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </div>
      )}
      {saveStatus === 'saved' && (
        <div className="flex items-center space-x-2 text-green-600">
          <Check className="w-4 h-4" />
          <span className="text-sm">Saved</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Save failed</span>
        </div>
      )}
      {lastSaved && saveStatus === 'idle' && (
        <span className="text-xs text-gray-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Administration</h1>
          <p className="text-gray-600 mt-2">Manage users, settings, and hotel configuration</p>
        </div>
        <div className="flex items-center space-x-4">
          <SaveStatusIndicator />
          
          {/* Save Button */}
          <button
            onClick={handleQuickSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Import Button */}
          <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Auto-save notification */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Auto-save Enabled</p>
            <p className="text-xs text-blue-600">Changes are automatically saved when you modify settings or data.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'shifts', name: 'Shift Management', icon: Clock },
              { id: 'branding', name: 'Hotel Branding', icon: Palette },
              { id: 'rooms', name: 'Room Management', icon: Bed },
              { id: 'banquet', name: 'Banquet Halls', icon: MapPin },
              { id: 'restaurant', name: 'Restaurant Tables', icon: Utensils },
              { id: 'settings', name: 'System Settings', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <button
                onClick={() => setShowUserForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white font-medium">{user.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            toggleUserStatus(user.id);
                            handleSave(); // Auto-save after status change
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteUser(user.id);
                              handleSave(); // Auto-save after deletion
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shift Management Tab */}
      {activeTab === 'shifts' && <ShiftManagement />}

      {/* Hotel Branding Tab */}
      {activeTab === 'branding' && (
        <div>
          <BrandingSettings />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Save className="w-5 h-5" />
              <span>Save Branding Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Room Management Tab */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Room Management</h3>
              <button
                onClick={() => setShowRoomForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Room {room.number}</div>
                          <div className="text-sm text-gray-500">Floor {room.floor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {room.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${room.rate}/night
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        room.status === 'clean' ? 'bg-green-100 text-green-800' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        room.status === 'dirty' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{room.maxOccupancy} guests • {room.size}m² • {room.bedType}</div>
                      <div>{room.view} view • {room.smokingAllowed ? 'Smoking' : 'Non-smoking'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{room.photos.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingRoom(room);
                            setShowRoomForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this room?')) {
                              deleteRoom(room.id);
                              handleSave();
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banquet Halls Tab */}
      {activeTab === 'banquet' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Banquet Halls Management</h3>
              <button
                onClick={() => setShowBanquetForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hall</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banquetHalls.map((hall) => (
                  <tr key={hall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{hall.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hall.capacity} guests
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${hall.rate}/hour
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {hall.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                        {hall.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{hall.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{hall.photos.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingBanquet(hall);
                            setShowBanquetForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this banquet hall?')) {
                              deleteBanquetHall(hall.id);
                              handleSave();
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restaurant Tables Tab */}
      {activeTab === 'restaurant' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Tables Management</h3>
              <button
                onClick={() => setShowTableForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurantTables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Utensils className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Table {table.number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.seats} seats
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        table.status === 'available' ? 'bg-green-100 text-green-800' :
                        table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                        table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      x: {table.position.x}, y: {table.position.y}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTable(table);
                            setShowTableForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this table?')) {
                              deleteRestaurantTable(table.id);
                              handleSave();
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
                <select
                  value={hotelSettings.baseCurrency}
                  onChange={(e) => {
                    updateHotelSettings({ baseCurrency: e.target.value });
                    handleSave(); // Auto-save after currency change
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Currency</label>
                <select
                  value={hotelSettings.displayCurrency}
                  onChange={(e) => {
                    updateHotelSettings({ displayCurrency: e.target.value });
                    handleSave(); // Auto-save after currency change
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Places</label>
                <select
                  value={hotelSettings.decimalPlaces}
                  onChange={(e) => {
                    updateHotelSettings({ decimalPlaces: parseInt(e.target.value) });
                    handleSave(); // Auto-save after setting change
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hotelSettings.showCurrencyCode}
                    onChange={(e) => {
                      updateHotelSettings({ showCurrencyCode: e.target.checked });
                      handleSave(); // Auto-save after setting change
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Currency Code</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Backup Data</h4>
                <p className="text-sm text-gray-600 mb-4">Export all hotel data for backup</p>
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Export Backup
                </button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Restore Data</h4>
                <p className="text-sm text-gray-600 mb-4">Import data from backup file</p>
                <label className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer inline-block">
                  Import Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <Save className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Save All</h4>
                <p className="text-sm text-gray-600 mb-4">Save all current settings</p>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserForm && <UserForm />}
      {showRoomForm && <RoomForm />}
      {showBanquetForm && <BanquetForm />}
      {showTableForm && <TableForm />}
    </div>
  );
}
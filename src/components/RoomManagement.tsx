import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  Bed, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  User,
  Clock,
  Upload,
  Image as ImageIcon,
  Wifi,
  Tv,
  Coffee,
  Wind,
  Droplets,
  Utensils,
  Maximize,
  Eye,
  EyeOff,
  Wrench,
  Star,
  Building
} from 'lucide-react';
import { Room } from '../types';

interface RoomManagementProps {
  onClose?: () => void;
}

export function RoomManagement({ onClose }: RoomManagementProps) {
  const { rooms, addRoom, updateRoom, deleteRoom, updateRoomStatus } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterFloor, setFilterFloor] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || showRoomDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showRoomDetails]);

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'out-of-order': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'clean': return <CheckCircle className="w-4 h-4" />;
      case 'dirty': return <AlertCircle className="w-4 h-4" />;
      case 'occupied': return <User className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'out-of-order': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('tv')) return <Tv className="w-4 h-4" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return <Coffee className="w-4 h-4" />;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return <Wind className="w-4 h-4" />;
    if (amenityLower.includes('bath') || amenityLower.includes('shower')) return <Droplets className="w-4 h-4" />;
    if (amenityLower.includes('mini') || amenityLower.includes('bar')) return <Utensils className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  // Get unique floors for filtering
  const floors = [...new Set(rooms.map(room => room.floor).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0));

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || room.status === filterStatus;
    const matchesType = !filterType || room.type === filterType;
    const matchesFloor = !filterFloor || room.floor?.toString() === filterFloor;
    
    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  const RoomForm = () => {
    const [formData, setFormData] = useState({
      number: editingRoom?.number || '',
      type: editingRoom?.type || 'single',
      status: editingRoom?.status || 'clean',
      rate: editingRoom?.rate || 120,
      photos: editingRoom?.photos || [],
      amenities: editingRoom?.amenities || [],
      floor: editingRoom?.floor || 1,
      maxOccupancy: editingRoom?.maxOccupancy || 2,
      size: editingRoom?.size || 25,
      bedType: editingRoom?.bedType || 'Queen',
      view: editingRoom?.view || 'City',
      smokingAllowed: editingRoom?.smokingAllowed || false,
      isVipRoom: editingRoom?.isVipRoom || false,
      vipAmenities: editingRoom?.vipAmenities || [],
      vipRate: editingRoom?.vipRate || 0,
      vipMinimumStay: editingRoom?.vipMinimumStay || 1,
      vipServices: editingRoom?.vipServices || []
    });

    const [newPhoto, setNewPhoto] = useState('');
    const [newAmenity, setNewAmenity] = useState('');
    const [newVipAmenity, setNewVipAmenity] = useState('');
    const [newVipService, setNewVipService] = useState('');

    const commonAmenities = [
      'WiFi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Hairdryer', 
      'Iron', 'Coffee Maker', 'Desk', 'Balcony', 'Bathtub', 'Shower'
    ];

    const vipAmenitiesList = [
      'Personal Butler', '24/7 Concierge', 'Premium Minibar', 
      'Champagne Welcome', 'Priority Housekeeping', 'Express Laundry',
      'Luxury Toiletries', 'Pillow Menu', 'Nespresso Machine'
    ];

    const vipServicesList = [
      'Airport Transfer', 'Daily Newspaper', 'Turndown Service', 
      'Fresh Flowers', 'Late Checkout', 'Complimentary Breakfast',
      'Spa Discount', 'Private Dining', 'Personal Shopping'
    ];

    const addPhoto = () => {
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

    const toggleAmenity = (amenity: string) => {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      }));
    };

    const addCustomAmenity = () => {
      if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, newAmenity.trim()]
        }));
        setNewAmenity('');
      }
    };

    const toggleVipAmenity = (amenity: string) => {
      setFormData(prev => ({
        ...prev,
        vipAmenities: prev.vipAmenities.includes(amenity)
          ? prev.vipAmenities.filter(a => a !== amenity)
          : [...prev.vipAmenities, amenity]
      }));
    };

    const addCustomVipAmenity = () => {
      if (newVipAmenity.trim() && !formData.vipAmenities.includes(newVipAmenity.trim())) {
        setFormData(prev => ({
          ...prev,
          vipAmenities: [...prev.vipAmenities, newVipAmenity.trim()]
        }));
        setNewVipAmenity('');
      }
    };

    const toggleVipService = (service: string) => {
      setFormData(prev => ({
        ...prev,
        vipServices: prev.vipServices.includes(service)
          ? prev.vipServices.filter(s => s !== service)
          : [...prev.vipServices, service]
      }));
    };

    const addCustomVipService = () => {
      if (newVipService.trim() && !formData.vipServices.includes(newVipService.trim())) {
        setFormData(prev => ({
          ...prev,
          vipServices: [...prev.vipServices, newVipService.trim()]
        }));
        setNewVipService('');
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingRoom) {
        updateRoom(editingRoom.id, formData);
      } else {
        addRoom(formData);
      }
      
      setShowForm(false);
      setEditingRoom(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRoom(null);
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
                      required
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="suite">Suite</option>
                      <option value="deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="clean">Clean</option>
                      <option value="dirty">Dirty</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out-of-order">Out of Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate per Night ({hotelSettings.baseCurrency})
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
                </div>
              </div>

              {/* Room Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                    <input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Occupancy</label>
                    <input
                      type="number"
                      value={formData.maxOccupancy}
                      onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size (sq m)</label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
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
                      <option value="Twin">Twin</option>
                      <option value="Double">Double</option>
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
                      <option value="Garden">Garden</option>
                      <option value="Ocean">Ocean</option>
                      <option value="Mountain">Mountain</option>
                      <option value="Pool">Pool</option>
                      <option value="Courtyard">Courtyard</option>
                    </select>
                  </div>
                  <div className="flex items-center">
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
                </div>
              </div>

              {/* Photos */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Photos</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="url"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    placeholder="Enter photo URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Room photo ${index + 1}`}
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
                      <p className="text-sm text-gray-400 text-center">Add photo URLs to showcase the room</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {commonAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add custom amenity"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* VIP Room Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">VIP Room Settings</h4>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVipRoom}
                      onChange={(e) => setFormData({ ...formData, isVipRoom: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">This is a VIP Room</span>
                  </label>
                </div>

                {formData.isVipRoom && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          VIP Rate per Night ({hotelSettings.baseCurrency})
                        </label>
                        <input
                          type="number"
                          value={formData.vipRate}
                          onChange={(e) => setFormData({ ...formData, vipRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">VIP Minimum Stay (nights)</label>
                        <input
                          type="number"
                          value={formData.vipMinimumStay}
                          onChange={(e) => setFormData({ ...formData, vipMinimumStay: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">VIP Amenities</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {vipAmenitiesList.map((amenity) => (
                          <label key={amenity} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.vipAmenities.includes(amenity)}
                              onChange={() => toggleVipAmenity(amenity)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{amenity}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="text"
                          value={newVipAmenity}
                          onChange={(e) => setNewVipAmenity(e.target.value)}
                          placeholder="Add custom VIP amenity"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={addCustomVipAmenity}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">VIP Services</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {vipServicesList.map((service) => (
                          <label key={service} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.vipServices.includes(service)}
                              onChange={() => toggleVipService(service)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{service}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="text"
                          value={newVipService}
                          onChange={(e) => setNewVipService(e.target.value)}
                          placeholder="Add custom VIP service"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={addCustomVipService}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
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
                  <span>{editingRoom ? 'Update Room' : 'Create Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const RoomDetails = () => {
    if (!selectedRoom) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            {selectedRoom.photos.length > 0 ? (
              <img
                src={selectedRoom.photos[0]}
                alt={`Room ${selectedRoom.number}`}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-2xl">
                <Bed className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => {
                setShowRoomDetails(false);
                setSelectedRoom(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(selectedRoom.status)}`}>
                {getStatusIcon(selectedRoom.status)}
                <span className="capitalize">{selectedRoom.status.replace('-', ' ')}</span>
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Room {selectedRoom.number}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Floor {selectedRoom.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Max {selectedRoom.maxOccupancy} guests</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedRoom.rate)}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Room Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedRoom.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium text-gray-900">{selectedRoom.size} sq m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bed Type:</span>
                    <span className="font-medium text-gray-900">{selectedRoom.bedType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">View:</span>
                    <span className="font-medium text-gray-900">{selectedRoom.view}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Smoking:</span>
                    <span className="font-medium text-gray-900">{selectedRoom.smokingAllowed ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity)}
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {selectedRoom.isVipRoom && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-xl font-semibold text-gray-900">VIP Room</h3>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">VIP Rate:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(selectedRoom.vipRate || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Minimum Stay:</span>
                        <span className="font-medium text-gray-900">{selectedRoom.vipMinimumStay || 1} night(s)</span>
                      </div>
                    </div>

                    {selectedRoom.vipAmenities && selectedRoom.vipAmenities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">VIP Amenities</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRoom.vipAmenities.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-purple-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRoom.vipServices && selectedRoom.vipServices.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">VIP Services</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRoom.vipServices.map((service) => (
                            <div key={service} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-700">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedRoom.photos.length > 1 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRoom.photos.slice(1).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Room ${selectedRoom.number} ${index + 2}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => {
                  setEditingRoom(selectedRoom);
                  setShowRoomDetails(false);
                  setShowForm(true);
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Room</span>
              </button>
              <button
                onClick={() => {
                  const newStatus = selectedRoom.status === 'clean' ? 'dirty' : 'clean';
                  updateRoomStatus(selectedRoom.id, newStatus);
                  setSelectedRoom({
                    ...selectedRoom,
                    status: newStatus
                  });
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 ${
                  selectedRoom.status === 'clean' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors`}
              >
                {selectedRoom.status === 'clean' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Mark as Dirty</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Clean</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-2">Manage hotel rooms, view status, and update details</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="clean">Clean</option>
              <option value="dirty">Dirty</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="out-of-order">Out of Order</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor} value={floor?.toString()}>Floor {floor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{rooms.length}</div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{rooms.filter(r => r.status === 'clean').length}</div>
          <div className="text-sm text-gray-600">Clean</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{rooms.filter(r => r.status === 'dirty').length}</div>
          <div className="text-sm text-gray-600">Dirty</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{rooms.filter(r => r.status === 'occupied').length}</div>
          <div className="text-sm text-gray-600">Occupied</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order').length}
          </div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-200 relative">
              {room.photos.length > 0 ? (
                <img
                  src={room.photos[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bed className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(room.status)}`}>
                  {getStatusIcon(room.status)}
                  <span className="capitalize">{room.status.replace('-', ' ')}</span>
                </span>
              </div>
              {room.isVipRoom && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>VIP</span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                  <p className="text-sm text-gray-600 capitalize">{room.type} room</p>
                </div>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Floor {room.floor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Max {room.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Maximize className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{room.size} sq m</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{room.amenities.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowRoomDetails(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setShowForm(true);
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this room?')) {
                      deleteRoom(room.id);
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

        {filteredRooms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <Bed className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-600 text-center mb-6">
              {rooms.length === 0 
                ? "Get started by adding your first room" 
                : "No rooms match your current filters"}
            </p>
            {rooms.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Room</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && <RoomForm />}
      {showRoomDetails && <RoomDetails />}
    </div>
  );
}
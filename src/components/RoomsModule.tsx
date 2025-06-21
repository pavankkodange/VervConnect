import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BillGenerator } from './BillGenerator';
import { Bed, Plus, Search, Filter, Calendar, User, Phone, Mail, MapPin, Star, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock, Home, Users, CreditCard, X, Sparkles, Crown, Zap, Shield, Coffee, Wifi, Car, Utensils, Dumbbell, Waves, TreePine, Mountain, Building, Wrench, RectangleVertical as CleaningServices } from 'lucide-react';
import { Room, Guest, Booking } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    view?: string;
    dateFilter?: string;
    action?: string;
    revenueFilter?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    guests, 
    bookings, 
    updateRoomStatus, 
    addGuest, 
    addBooking,
    updateBookingStatus
  } = useHotel();
  const { formatCurrency } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings' | 'guests'>('rooms');
  const [activeRoomTab, setActiveRoomTab] = useState<'all' | 'available' | 'occupied' | 'dirty' | 'maintenance' | 'cleaning'>('all');
  const [activeBookingTab, setActiveBookingTab] = useState<'all' | 'today-checkins' | 'today-checkouts' | 'current-guests'>('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setActiveRoomTab(filters.statusFilter as any);
        setView('rooms');
      }
      if (filters.view === 'bookings') {
        setView('bookings');
      }
      if (filters.dateFilter) {
        if (filters.dateFilter === 'check-in-today') {
          setActiveBookingTab('today-checkins');
          setView('bookings');
        } else if (filters.dateFilter === 'check-out-today') {
          setActiveBookingTab('today-checkouts');
          setView('bookings');
        } else if (filters.dateFilter === 'today') {
          setView('bookings');
        }
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setActiveBookingTab('today-checkins');
        setView('bookings');
      }
    }
  }, [filters]);

  const today = new Date().toISOString().split('T')[0];

  // Room filtering logic
  const getFilteredRooms = () => {
    let filteredRooms = rooms;

    // Apply status filter
    switch (activeRoomTab) {
      case 'available':
        filteredRooms = rooms.filter(r => r.status === 'clean');
        break;
      case 'occupied':
        filteredRooms = rooms.filter(r => r.status === 'occupied');
        break;
      case 'dirty':
        filteredRooms = rooms.filter(r => r.status === 'dirty');
        break;
      case 'maintenance':
        filteredRooms = rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order');
        break;
      case 'cleaning':
        // Show rooms that need cleaning (dirty) or are being cleaned
        filteredRooms = rooms.filter(r => r.status === 'dirty');
        break;
      default:
        filteredRooms = rooms;
    }

    // Apply search filter
    if (searchTerm) {
      filteredRooms = filteredRooms.filter(room =>
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.view?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredRooms;
  };

  // Booking filtering logic
  const getFilteredBookings = () => {
    let filteredBookings = bookings;

    switch (activeBookingTab) {
      case 'today-checkins':
        filteredBookings = bookings.filter(b => b.checkIn === today);
        break;
      case 'today-checkouts':
        filteredBookings = bookings.filter(b => b.checkOut === today);
        break;
      case 'current-guests':
        filteredBookings = bookings.filter(b => b.status === 'checked-in');
        break;
      default:
        filteredBookings = bookings;
    }

    // Apply search filter
    if (searchTerm) {
      filteredBookings = filteredBookings.filter(booking => {
        const guest = guests.find(g => g.id === booking.guestId);
        return guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               guest?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               booking.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               booking.confirmationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filteredBookings;
  };

  // Guest filtering logic
  const getFilteredGuests = () => {
    if (!searchTerm) return guests;
    
    return guests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'clean': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dirty': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'occupied': return <User className="w-5 h-5 text-blue-500" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-red-500" />;
      case 'out-of-order': return <X className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800 border-green-200';
      case 'dirty': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'occupied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'out-of-order': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'ac': return <Zap className="w-4 h-4" />;
      case 'tv': return <Eye className="w-4 h-4" />;
      case 'mini bar': return <Coffee className="w-4 h-4" />;
      case 'jacuzzi': return <Waves className="w-4 h-4" />;
      case 'balcony': return <TreePine className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'gym': return <Dumbbell className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getViewIcon = (view: string) => {
    switch (view.toLowerCase()) {
      case 'ocean': return <Waves className="w-4 h-4 text-blue-500" />;
      case 'mountain': return <Mountain className="w-4 h-4 text-green-500" />;
      case 'city': return <Building className="w-4 h-4 text-gray-500" />;
      case 'garden': return <TreePine className="w-4 h-4 text-green-500" />;
      case 'pool': return <Waves className="w-4 h-4 text-blue-400" />;
      default: return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoomTabCounts = () => {
    return {
      all: rooms.length,
      available: rooms.filter(r => r.status === 'clean').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      dirty: rooms.filter(r => r.status === 'dirty').length,
      maintenance: rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order').length,
      cleaning: rooms.filter(r => r.status === 'dirty').length
    };
  };

  const getBookingTabCounts = () => {
    return {
      all: bookings.length,
      'today-checkins': bookings.filter(b => b.checkIn === today).length,
      'today-checkouts': bookings.filter(b => b.checkOut === today).length,
      'current-guests': bookings.filter(b => b.status === 'checked-in').length
    };
  };

  const roomTabCounts = getRoomTabCounts();
  const bookingTabCounts = getBookingTabCounts();

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as const
    });

    const availableRooms = rooms.filter(r => r.status === 'clean');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const room = rooms.find(r => r.id === formData.roomId);
      if (!room) return;

      const nights = Math.ceil(
        (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );

      addBooking({
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        status: 'confirmed',
        totalAmount: room.rate * nights,
        currency: 'USD',
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests,
        source: formData.source,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        confirmationNumber: `BK${Date.now().toString().slice(-6)}`
      });

      setShowBookingForm(false);
      setFormData({
        guestId: '', roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '', source: 'direct'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">New Booking</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest</label>
                <select
                  value={formData.guestId}
                  onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a guest</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} - {guest.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a room</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                <input
                  type="number"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                <input
                  type="number"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: editingGuest?.name || '',
      email: editingGuest?.email || '',
      phone: editingGuest?.phone || '',
      company: editingGuest?.company || '',
      nationality: editingGuest?.nationality || '',
      address: editingGuest?.address || '',
      dateOfBirth: editingGuest?.dateOfBirth || '',
      vipStatus: editingGuest?.vipStatus || false,
      vipTier: editingGuest?.vipTier || 'gold',
      specialRequests: editingGuest?.specialRequests?.join(', ') || '',
      dietaryRestrictions: editingGuest?.dietaryRestrictions?.join(', ') || '',
      notes: editingGuest?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const guestData = {
        ...formData,
        specialRequests: formData.specialRequests ? formData.specialRequests.split(',').map(s => s.trim()) : [],
        dietaryRestrictions: formData.dietaryRestrictions ? formData.dietaryRestrictions.split(',').map(s => s.trim()) : []
      };
      
      if (editingGuest) {
        // Update existing guest
        // In a real app, you would call an update function here
        alert('Guest updated successfully!');
      } else {
        // Add new guest
        addGuest(guestData);
        alert('Guest added successfully!');
      }
      
      setShowGuestForm(false);
      setEditingGuest(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingGuest ? 'Edit Guest' : 'Add New Guest'}</h3>
            <button
              onClick={() => {
                setShowGuestForm(false);
                setEditingGuest(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (comma separated)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Late checkout, Extra pillows, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions (comma separated)</label>
                <textarea
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Vegetarian, Gluten-free, etc."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="vipStatus"
                  checked={formData.vipStatus}
                  onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="vipStatus" className="text-sm font-medium text-gray-700">VIP Status</label>
              </div>
              
              {formData.vipStatus && (
                <div className="ml-6 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">VIP Tier</label>
                  <select
                    value={formData.vipTier}
                    onChange={(e) => setFormData({ ...formData, vipTier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowGuestForm(false);
                  setEditingGuest(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {editingGuest ? 'Update Guest' : 'Add Guest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Reservations</h1>
          <p className="text-gray-600 mt-2">Manage room inventory, bookings, and guest services</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'rooms', name: 'Room Status', icon: Bed },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'guests', name: 'Guests', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    view === tab.id
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              view === 'rooms' ? "Search rooms..." : 
              view === 'bookings' ? "Search bookings..." : 
              "Search guests..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Room Status View */}
      {view === 'rooms' && (
        <div className="space-y-6">
          {/* Room Status Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {[
                  { id: 'all', name: 'All Rooms', count: roomTabCounts.all, color: 'gray' },
                  { id: 'available', name: 'Available', count: roomTabCounts.available, color: 'green' },
                  { id: 'occupied', name: 'Occupied', count: roomTabCounts.occupied, color: 'blue' },
                  { id: 'dirty', name: 'Needs Cleaning', count: roomTabCounts.dirty, color: 'orange' },
                  { id: 'maintenance', name: 'Maintenance', count: roomTabCounts.maintenance, color: 'red' },
                  { id: 'cleaning', name: 'Cleaning in Progress', count: roomTabCounts.cleaning, color: 'purple' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRoomTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeRoomTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeRoomTab === tab.id 
                        ? `bg-${tab.color}-100 text-${tab.color}-700` 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Room Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredRooms().map((room) => {
                  const currentBooking = bookings.find(b => 
                    b.roomId === room.id && b.status === 'checked-in'
                  );
                  const currentGuest = currentBooking ? guests.find(g => g.id === currentBooking.guestId) : null;
                  
                  return (
                    <div key={room.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
                      {/* Room Image */}
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={room.photos[0]}
                          alt={`Room ${room.number}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(room.status)}`}>
                            {room.status === 'clean' ? 'Available' : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          {getStatusIcon(room.status)}
                        </div>
                        {room.isVipRoom && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold rounded-full flex items-center space-x-1">
                              <Crown className="w-3 h-3" />
                              <span>VIP</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">Room {room.number}</h3>
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(room.isVipRoom && room.vipRate ? room.vipRate : room.rate)}/night
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium capitalize">{room.type}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Floor:</span>
                            <span className="font-medium">{room.floor}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Occupancy:</span>
                            <span className="font-medium">{room.maxOccupancy} guests</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium">{room.size}m²</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Bed:</span>
                            <span className="font-medium">{room.bedType}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">View:</span>
                            <div className="flex items-center space-x-1">
                              {getViewIcon(room.view || '')}
                              <span className="font-medium">{room.view}</span>
                            </div>
                          </div>
                        </div>

                        {/* Current Guest Info */}
                        {currentGuest && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Current Guest</span>
                            </div>
                            <div className="text-sm text-blue-800">
                              <div className="font-medium">{currentGuest.name}</div>
                              <div className="text-xs text-blue-600">
                                Check-out: {new Date(currentBooking!.checkOut).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 4).map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {getAmenityIcon(amenity)}
                                <span>{amenity}</span>
                              </div>
                            ))}
                            {room.amenities.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{room.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* VIP Amenities */}
                        {room.isVipRoom && room.vipAmenities && (
                          <div className="mb-4">
                            <div className="text-xs font-medium text-yellow-700 mb-2 flex items-center space-x-1">
                              <Crown className="w-3 h-3" />
                              <span>VIP Amenities</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {room.vipAmenities.slice(0, 2).map((amenity) => (
                                <span key={amenity} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded border border-yellow-200">
                                  {amenity}
                                </span>
                              ))}
                              {room.vipAmenities.length > 2 && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded border border-yellow-200">
                                  +{room.vipAmenities.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {/* Status-specific buttons */}
                          {room.status === 'dirty' && (
                            <button
                              onClick={() => updateRoomStatus(room.id, 'clean')}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Mark as Clean</span>
                            </button>
                          )}
                          
                          {room.status === 'clean' && (
                            <>
                              <button
                                onClick={() => updateRoomStatus(room.id, 'dirty')}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                <CleaningServices className="w-4 h-4" />
                                <span>Needs Cleaning</span>
                              </button>
                              <button
                                onClick={() => updateRoomStatus(room.id, 'maintenance')}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Wrench className="w-4 h-4" />
                                <span>Maintenance</span>
                              </button>
                            </>
                          )}
                          
                          {room.status === 'maintenance' && (
                            <>
                              <button
                                onClick={() => updateRoomStatus(room.id, 'clean')}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark Available</span>
                              </button>
                              <button
                                onClick={() => updateRoomStatus(room.id, 'dirty')}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                <CleaningServices className="w-4 h-4" />
                                <span>Needs Cleaning</span>
                              </button>
                            </>
                          )}
                          
                          {room.status === 'occupied' && (
                            <button
                              onClick={() => updateRoomStatus(room.id, 'dirty')}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              <CleaningServices className="w-4 h-4" />
                              <span>Mark for Cleaning</span>
                            </button>
                          )}
                          
                          {currentBooking && (
                            <button
                              onClick={() => {
                                setSelectedBooking(currentBooking);
                                setSelectedGuest(currentGuest);
                                setSelectedRoom(room);
                                setShowBillGenerator(true);
                              }}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Generate Bill</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getFilteredRooms().length === 0 && (
                <div className="text-center py-12">
                  <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No rooms found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings View */}
      {view === 'bookings' && (
        <div className="space-y-6">
          {/* Booking Status Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {[
                  { id: 'all', name: 'All Bookings', count: bookingTabCounts.all, color: 'gray' },
                  { id: 'today-checkins', name: "Today's Check-ins", count: bookingTabCounts['today-checkins'], color: 'green' },
                  { id: 'today-checkouts', name: "Today's Check-outs", count: bookingTabCounts['today-checkouts'], color: 'orange' },
                  { id: 'current-guests', name: 'Current Guests', count: bookingTabCounts['current-guests'], color: 'blue' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveBookingTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeBookingTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeBookingTab === tab.id 
                        ? `bg-${tab.color}-100 text-${tab.color}-700` 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredBookings().map((booking) => {
                    const guest = guests.find(g => g.id === booking.guestId);
                    const room = rooms.find(r => r.id === booking.roomId);
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {guest?.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                                {guest?.vipStatus && (
                                  <div className="flex items-center space-x-1">
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                      {guest.vipTier?.toUpperCase() || 'VIP'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{guest?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                              <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                            <div className="text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                            booking.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {booking.status === 'confirmed' && booking.checkIn === today && (
                              <button
                                onClick={() => {
                                  updateBookingStatus(booking.id, 'checked-in');
                                  updateRoomStatus(booking.roomId, 'occupied');
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Check In</span>
                              </button>
                            )}
                            {booking.status === 'checked-in' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setSelectedGuest(guest || null);
                                  setSelectedRoom(room || null);
                                  setShowBillGenerator(true);
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Bill</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {getFilteredBookings().length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No bookings found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guests View */}
      {view === 'guests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guest Directory</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredGuests().map((guest) => {
                  const currentBooking = bookings.find(b => 
                    b.guestId === guest.id && b.status === 'checked-in'
                  );
                  
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {guest.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                              {guest.vipStatus && (
                                <div className="flex items-center space-x-1">
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    {guest.vipTier?.toUpperCase() || 'VIP'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{guest.company || guest.nationality || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{guest.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{guest.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm text-gray-600">
                          {guest.address && (
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="line-clamp-2">{guest.address}</span>
                            </div>
                          )}
                          {guest.specialRequests && guest.specialRequests.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.specialRequests.slice(0, 2).map((req, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {req}
                                </span>
                              ))}
                              {guest.specialRequests.length > 2 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  +{guest.specialRequests.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentBooking ? (
                          <div className="space-y-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Currently Staying
                            </span>
                            <div className="text-xs text-gray-500">
                              Room {currentBooking.roomId}
                            </div>
                            <div className="text-xs text-gray-500">
                              Until {new Date(currentBooking.checkOut).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not Currently Staying
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingGuest(guest);
                              setShowGuestForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowBookingForm(true)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {getFilteredGuests().length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No guests found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showBookingForm && <BookingForm />}
      {showGuestForm && <GuestForm />}
      {showBillGenerator && selectedBooking && selectedGuest && selectedRoom && (
        <BillGenerator
          booking={selectedBooking}
          guest={selectedGuest}
          room={selectedRoom}
          onClose={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
            setSelectedGuest(null);
            setSelectedRoom(null);
          }}
          onCheckoutComplete={() => {
            updateBookingStatus(selectedBooking.id, 'checked-out');
            updateRoomStatus(selectedRoom.id, 'dirty');
          }}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { RoomManagement } from './RoomManagement';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  User, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  Trash2, 
  Edit, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Settings, 
  AlertCircle, 
  Wrench, 
  Building, 
  Home, 
  Maximize, 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Droplets, 
  Utensils, 
  Save, 
  UserPlus, 
  Receipt
} from 'lucide-react';
import { Room, Booking, Guest, RoomCharge } from '../types';

interface RoomsModuleProps {
  filters?: {
    view?: string;
    statusFilter?: string;
    dateFilter?: string;
    action?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    bookings, 
    guests, 
    updateRoomStatus, 
    addBooking, 
    updateBookingStatus, 
    addRoomCharge, 
    addGuest 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { formatDateTime, getCurrentDate } = useBranding();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('');

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter);
        setView('bookings');
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
        setBookingStatusFilter('confirmed');
      }
    }
  }, [filters]);

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

  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
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

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || room.status === statusFilter;
    const matchesType = !typeFilter || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    const matchesSearch = !searchTerm || 
      (guest && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room && room.number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !bookingStatusFilter || booking.status === bookingStatusFilter;
    
    let matchesDate = true;
    const today = getCurrentDate();
    
    if (dateFilter === 'check-in-today') {
      matchesDate = booking.checkIn === today;
    } else if (dateFilter === 'check-out-today') {
      matchesDate = booking.checkOut === today;
    } else if (dateFilter === 'today') {
      matchesDate = booking.checkIn === today || booking.checkOut === today;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as Booking['source']
    });

    const [newGuest, setNewGuest] = useState(false);
    const [guestData, setGuestData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      idType: 'passport',
      idNumber: ''
    });

    // Filter available rooms (clean and not occupied)
    const availableRooms = rooms.filter(room => 
      (room.status === 'clean' || room.status === 'dirty') && 
      !bookings.some(b => 
        b.roomId === room.id && 
        b.status === 'checked-in' &&
        !(formData.checkOut && b.checkIn >= formData.checkOut) && 
        !(formData.checkIn && b.checkOut <= formData.checkIn)
      )
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      let guestId = formData.guestId;
      
      // If creating a new guest
      if (newGuest) {
        const newGuestData = {
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          address: guestData.address,
          nationality: guestData.nationality,
          identificationDetails: {
            type: guestData.idType as any,
            number: guestData.idNumber
          }
        };
        
        addGuest(newGuestData);
        // In a real app, we'd get the ID from the server
        // For demo, we'll use the current timestamp
        guestId = Date.now().toString();
      }
      
      const room = rooms.find(r => r.id === formData.roomId);
      if (room) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        addBooking({
          guestId,
          roomId: formData.roomId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          adults: formData.adults,
          children: formData.children,
          specialRequests: formData.specialRequests,
          status: 'confirmed',
          totalAmount: room.rate * nights,
          currency: hotelSettings.baseCurrency,
          source: formData.source,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString()
        });
        
        setShowBookingForm(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Reservation</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Guest Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setNewGuest(false)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      !newGuest 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Existing Guest
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGuest(true)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      newGuest 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    New Guest
                  </button>
                </div>
                
                {!newGuest ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={guestData.name}
                        onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={guestData.email}
                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={guestData.phone}
                        onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        value={guestData.nationality}
                        onChange={(e) => setGuestData({ ...guestData, nationality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={guestData.address}
                        onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                      <select
                        value={guestData.idType}
                        onChange={(e) => setGuestData({ ...guestData, idType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                      <input
                        type="text"
                        value={guestData.idNumber}
                        onChange={(e) => setGuestData({ ...guestData, idNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="direct">Direct</option>
                      <option value="booking.com">Booking.com</option>
                      <option value="expedia">Expedia</option>
                      <option value="phone">Phone</option>
                      <option value="walk-in">Walk-in</option>
                    </select>
                  </div>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Create Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      idType: 'passport',
      idNumber: '',
      company: '',
      vipStatus: false,
      notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      addGuest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        nationality: formData.nationality,
        company: formData.company,
        vipStatus: formData.vipStatus,
        notes: formData.notes,
        identificationDetails: {
          type: formData.idType as any,
          number: formData.idNumber
        }
      });
      
      setShowGuestForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Guest</h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.vipStatus}
                      onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">VIP Status</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const ChargeForm = () => {
    const [formData, setFormData] = useState({
      bookingId: selectedBooking?.id || '',
      description: '',
      amount: '',
      category: 'other' as RoomCharge['category']
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addRoomCharge(formData.bookingId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: hotelSettings.baseCurrency,
        date: new Date().toISOString().split('T')[0],
        category: formData.category
      });
      
      setShowChargeForm(false);
      setFormData({ bookingId: '', description: '', amount: '', category: 'other' });
      alert('Charge added successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Add Room Charge</h3>
            <button
              onClick={() => setShowChargeForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking</label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a booking</option>
                {bookings.filter(b => b.status === 'checked-in').map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const room = rooms.find(r => r.id === booking.roomId);
                  return (
                    <option key={booking.id} value={booking.id}>
                      Room {room?.number} - {guest?.name}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="restaurant">Restaurant</option>
                <option value="room-service">Room Service</option>
                <option value="minibar">Minibar</option>
                <option value="spa">Spa</option>
                <option value="laundry">Laundry</option>
                <option value="telephone">Telephone</option>
                <option value="internet">Internet</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({hotelSettings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowChargeForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BookingDetails = () => {
    if (!selectedBooking) return null;

    const guest = guests.find(g => g.id === selectedBooking.guestId);
    const room = rooms.find(r => r.id === selectedBooking.roomId);
    
    const checkInDate = new Date(selectedBooking.checkIn);
    const checkOutDate = new Date(selectedBooking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalCharges = selectedBooking.charges.reduce((sum, charge) => sum + charge.amount, 0);

    const handleCheckIn = () => {
      if (room?.status !== 'clean') {
        alert('Room is not ready for check-in. Please clean the room first.');
        return;
      }
      
      updateBookingStatus(selectedBooking.id, 'checked-in');
      updateRoomStatus(selectedBooking.roomId, 'occupied');
      setSelectedBooking({ ...selectedBooking, status: 'checked-in' });
    };

    const handleCheckOut = () => {
      setShowBillGenerator(true);
    };

    const handleCheckoutComplete = () => {
      setSelectedBooking(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Guest Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                
                {guest ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900">{guest.name}</h5>
                        {guest.vipStatus && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">VIP Guest</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{guest.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{guest.phone}</span>
                      </div>
                      {guest.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                          <span className="text-gray-600">{guest.address}</span>
                        </div>
                      )}
                      {guest.nationality && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{guest.nationality}</span>
                        </div>
                      )}
                    </div>
                    
                    {guest.specialRequests && guest.specialRequests.length > 0 && (
                      <div className="mt-4">
                        <h6 className="font-medium text-gray-900 mb-2">Special Requests</h6>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {guest.specialRequests.map((request, index) => (
                            <li key={index}>{request}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Guest information not available</p>
                  </div>
                )}
              </div>

              {/* Room Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h4>
                
                {room ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bed className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900">Room {room.number}</h5>
                        <span className="text-sm font-medium text-gray-600 capitalize">{room.type} Room</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(room.status)}
                          <span className="font-medium text-gray-900 capitalize">{room.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rate</p>
                        <p className="font-medium text-gray-900">{formatCurrency(room.rate)}/night</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Floor</p>
                        <p className="font-medium text-gray-900">{room.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Max Occupancy</p>
                        <p className="font-medium text-gray-900">{room.maxOccupancy || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Room information not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nights</p>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{nights}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {selectedBooking.adults} Adult{selectedBooking.adults !== 1 ? 's' : ''}
                      {selectedBooking.children > 0 ? `, ${selectedBooking.children} Child${selectedBooking.children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <span className="font-medium text-gray-900 capitalize">{selectedBooking.source.replace('.', ' ')}</span>
                </div>
              </div>
              
              {selectedBooking.specialRequests && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Special Requests</p>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Charges */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Charges</h4>
                <button
                  onClick={() => setShowChargeForm(true)}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Charge</span>
                </button>
              </div>
              
              {selectedBooking.charges.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedBooking.charges.map((charge) => (
                        <tr key={charge.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(charge.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{charge.description}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {charge.category.replace('-', ' ')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(charge.amount, charge.currency)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan={3} className="px-4 py-2 text-right text-gray-900">Total:</td>
                        <td className="px-4 py-2 text-right text-gray-900">{formatCurrency(totalCharges)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No charges yet</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex space-x-4">
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Check In</span>
                </button>
              )}
              
              {selectedBooking.status === 'checked-in' && (
                <button
                  onClick={handleCheckOut}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Check Out</span>
                </button>
              )}
              
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
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
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Bookings</h1>
          <p className="text-gray-600 mt-2">Manage rooms, reservations, and guest check-ins</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Guest</span>
          </button>
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => setShowRoomManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Rooms</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('rooms')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'rooms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bed className="w-5 h-5" />
              <span>Rooms</span>
            </button>
            <button
              onClick={() => setView('bookings')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'bookings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Bookings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Rooms View */}
      {view === 'rooms' && (
        <>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const currentBooking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
              const guest = currentBooking ? guests.find(g => g.id === currentBooking.guestId) : null;
              
              return (
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
                    
                    {currentBooking && guest && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-blue-700">{guest.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-blue-600">
                          <Calendar className="w-3 h-3" />
                          <span>Check-out: {new Date(currentBooking.checkOut).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    
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
                      {room.status === 'occupied' ? (
                        <button
                          onClick={() => {
                            const booking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
                            if (booking) {
                              setSelectedBooking(booking);
                            }
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Booking</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowBookingForm(true);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Book Room</span>
                        </button>
                      )}
                      
                      {room.status === 'dirty' && (
                        <button
                          onClick={() => updateRoomStatus(room.id, 'clean')}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {room.status === 'clean' && (
                        <button
                          onClick={() => updateRoomStatus(room.id, 'dirty')}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Bookings View */}
      {view === 'bookings' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Dates</option>
                  <option value="check-in-today">Check-in Today</option>
                  <option value="check-out-today">Check-out Today</option>
                  <option value="today">All Today</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                  {filteredBookings.map((booking) => {
                    const guest = guests.find(g => g.id === booking.guestId);
                    const room = rooms.find(r => r.id === booking.roomId);
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                              <div className="text-sm text-gray-500">{guest?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                          <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                            {booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                            {booking.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setTimeout(() => {
                                    if (room?.status === 'clean') {
                                      updateBookingStatus(booking.id, 'checked-in');
                                      updateRoomStatus(booking.roomId, 'occupied');
                                    } else {
                                      alert('Room is not ready for check-in. Please clean the room first.');
                                    }
                                  }, 100);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {booking.status === 'checked-in' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowBillGenerator(true);
                                }}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                <ArrowRight className="w-4 h-4" />
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
          </div>
        </>
      )}

      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBookingForm && <BookingForm />}
      {showGuestForm && <GuestForm />}
      {showChargeForm && <ChargeForm />}
      {selectedBooking && <BookingDetails />}
      {showBillGenerator && selectedBooking && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={guests.find(g => g.id === selectedBooking.guestId)!} 
          room={rooms.find(r => r.id === selectedBooking.roomId)!}
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={handleCheckoutComplete}
        />
      )}
    </div>
  );
}

// Temporary Globe icon since it's not in lucide-react
function Globe(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}
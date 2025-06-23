import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { BillGenerator } from './BillGenerator';
import { RoomManagement } from './RoomManagement';
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
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ArrowRight, 
  Clipboard, 
  Building, 
  Maximize, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  FileText,
  Home,
  CreditCard,
  Receipt,
  UserPlus,
  UserCheck,
  Settings
} from 'lucide-react';
import { Room, Booking, Guest } from '../types';

interface RoomsModuleProps {
  filters?: {
    view?: string;
    dateFilter?: string;
    statusFilter?: string;
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
    addGuest 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { formatDateTime, getCurrentDate } = useBranding();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter);
      }
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
        setDateFilter('check-in-today');
      }
    }
  }, [filters]);

  const getStatusColor = (status: Room['status'] | Booking['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'out-of-order': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Room['status'] | Booking['status']) => {
    switch (status) {
      case 'clean': return <CheckCircle className="w-4 h-4" />;
      case 'dirty': return <AlertCircle className="w-4 h-4" />;
      case 'occupied': return <User className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'out-of-order': return <X className="w-4 h-4" />;
      case 'confirmed': return <Calendar className="w-4 h-4" />;
      case 'checked-in': return <LogIn className="w-4 h-4" />;
      case 'checked-out': return <LogOut className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'no-show': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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
      (guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (room?.number.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
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

  const handleCheckIn = (booking: Booking) => {
    updateBookingStatus(booking.id, 'checked-in');
    updateRoomStatus(booking.roomId, 'occupied');
  };

  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    if (guest && room) {
      setSelectedGuest(guest);
      setSelectedRoom(room);
      setShowBillGenerator(true);
    } else {
      updateBookingStatus(booking.id, 'checked-out');
      updateRoomStatus(booking.roomId, 'dirty');
    }
  };

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

    const [showNewGuestForm, setShowNewGuestForm] = useState(false);
    const [newGuestData, setNewGuestData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      passportNumber: '',
      dateOfBirth: '',
      emergencyContact: ''
    });

    const availableRooms = rooms.filter(r => r.status === 'clean');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Calculate total amount based on room rate and stay duration
      const room = rooms.find(r => r.id === formData.roomId);
      if (!room) return;
      
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = room.rate * nights;
      
      addBooking({
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        status: 'confirmed',
        totalAmount,
        currency: hotelSettings.baseCurrency,
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests,
        source: formData.source,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setShowBookingForm(false);
      setFormData({
        guestId: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        adults: 1,
        children: 0,
        specialRequests: '',
        source: 'direct'
      });
    };

    const handleAddNewGuest = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newGuest = {
        name: newGuestData.name,
        email: newGuestData.email,
        phone: newGuestData.phone,
        address: newGuestData.address,
        nationality: newGuestData.nationality,
        passportNumber: newGuestData.passportNumber,
        dateOfBirth: newGuestData.dateOfBirth,
        emergencyContact: newGuestData.emergencyContact
      };
      
      addGuest(newGuest);
      
      // Reset form and close it
      setNewGuestData({
        name: '',
        email: '',
        phone: '',
        address: '',
        nationality: '',
        passportNumber: '',
        dateOfBirth: '',
        emergencyContact: ''
      });
      setShowNewGuestForm(false);
      
      // Refresh the guest list by refetching
      // In a real app, we'd get the new guest's ID from the addGuest response
      // For now, we'll just close the form and let the user select the guest
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Booking</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showNewGuestForm ? (
              <form onSubmit={handleAddNewGuest} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Add New Guest</h4>
                  <p className="text-sm text-blue-600">Please enter the guest details below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newGuestData.name}
                      onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={newGuestData.email}
                      onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={newGuestData.phone}
                      onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newGuestData.address}
                      onChange={(e) => setNewGuestData({ ...newGuestData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={newGuestData.nationality}
                      onChange={(e) => setNewGuestData({ ...newGuestData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport/ID Number</label>
                    <input
                      type="text"
                      value={newGuestData.passportNumber}
                      onChange={(e) => setNewGuestData({ ...newGuestData, passportNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newGuestData.dateOfBirth}
                      onChange={(e) => setNewGuestData({ ...newGuestData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      value={newGuestData.emergencyContact}
                      onChange={(e) => setNewGuestData({ ...newGuestData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewGuestForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Add Guest
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Guest</label>
                      <button
                        type="button"
                        onClick={() => setShowNewGuestForm(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Add New Guest</span>
                      </button>
                    </div>
                    <select
                      value={formData.guestId}
                      onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a guest</option>
                      {guests.map(guest => (
                        <option key={guest.id} value={guest.id}>{guest.name} - {guest.email}</option>
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
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Adults</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as Booking['source'] })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Create Booking
                  </button>
                </div>
              </form>
            )}
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
      passportNumber: '',
      dateOfBirth: '',
      emergencyContact: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      addGuest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact
      });
      
      setShowGuestForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        nationality: '',
        passportNumber: '',
        dateOfBirth: '',
        emergencyContact: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Guest</h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport/ID Number</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
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

  const BookingDetails = ({ booking }: { booking: Booking }) => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    if (!guest || !room) return null;
    
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Guest Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-lg">
                          {guest.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{guest.name}</p>
                        {guest.vipStatus && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">
                              {guest.vipTier ? guest.vipTier.toUpperCase() : 'VIP'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
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
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-600" />
                    Room Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Room {room.number}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(room.status)}`}>
                        {getStatusIcon(room.status)}
                        <span className="capitalize">{room.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900 capitalize">{room.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(room.rate)}/night</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium text-gray-900">{room.floor || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span className="font-medium text-gray-900">{room.maxOccupancy || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium text-gray-900">{room.size ? `${room.size} sq m` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bed Type:</span>
                      <span className="font-medium text-gray-900">{room.bedType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">View:</span>
                      <span className="font-medium text-gray-900">{room.view || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                    Booking Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium text-gray-900">#{booking.id.slice(-6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Length of Stay:</span>
                      <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium text-gray-900">
                        {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                        {booking.children > 0 ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span className="font-medium text-gray-900 capitalize">{booking.source.replace('.', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">{formatDateTime(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
                    Payment Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(booking.totalAmount, booking.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        booking.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </div>
                    {booking.charges.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Charges</h5>
                        <div className="space-y-2">
                          {booking.charges.map((charge) => (
                            <div key={charge.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-sm">{charge.description}</span>
                              <span className="font-medium">{formatCurrency(charge.amount, charge.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clipboard className="w-5 h-5 mr-2 text-gray-600" />
                      Special Requests
                    </h4>
                    <p className="text-gray-600">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleCheckIn(booking);
                      setSelectedBooking(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check In</span>
                  </button>
                )}
                {booking.status === 'checked-in' && (
                  <button
                    onClick={() => {
                      handleCheckOut(booking);
                      setSelectedBooking(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                )}
                {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                  <button
                    onClick={() => {
                      updateBookingStatus(booking.id, 'cancelled');
                      setSelectedBooking(null);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </button>
                )}
                {booking.status === 'checked-in' && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setSelectedGuest(guest);
                      setSelectedRoom(room);
                      setShowBillGenerator(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Generate Bill</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    // In a real app, this would open a payment form
                    alert('Payment processing would be implemented here');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Process Payment</span>
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would generate a PDF invoice
                    alert('Invoice generation would be implemented here');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Invoice</span>
                </button>
              </div>
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
          <p className="text-gray-600 mt-2">Manage hotel rooms, reservations, and guest check-ins</p>
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {dateFilter === 'check-in-today' ? 'Today\'s Check-ins' : 
                 dateFilter === 'check-out-today' ? 'Today\'s Check-outs' : 
                 dateFilter === 'today' ? 'Today\'s Activity' : dateFilter}
              </span>
              <button
                onClick={() => setDateFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
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
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => setShowRoomManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={view === 'rooms' ? "Search rooms..." : "Search bookings..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          {view === 'rooms' && (
            <>
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
            </>
          )}
          
          {view === 'bookings' && (
            <>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <option value="today">Today's Activity</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rooms View */}
      {view === 'rooms' && (
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
                    <span className="text-sm text-gray-600">Floor {room.floor || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Maximize className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{room.size || 'N/A'} sq m</span>
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
                      const booking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
                      if (booking) {
                        setSelectedBooking(booking);
                      } else {
                        setSelectedRoom(room);
                        setShowBookingForm(true);
                      }
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {room.status === 'occupied' ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>View Booking</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Book Room</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (room.status === 'clean') {
                        updateRoomStatus(room.id, 'dirty');
                      } else if (room.status === 'dirty') {
                        updateRoomStatus(room.id, 'clean');
                      }
                    }}
                    className={`px-3 py-2 ${
                      room.status === 'clean' 
                        ? 'bg-orange-100 text-orange-700' 
                        : room.status === 'dirty'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                    } rounded-lg hover:bg-opacity-80 transition-colors`}
                    disabled={room.status !== 'clean' && room.status !== 'dirty'}
                  >
                    {room.status === 'clean' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : room.status === 'dirty' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
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
                  onClick={() => setShowRoomManagement(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Room</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bookings View */}
      {view === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
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
                            <span className="text-indigo-600 font-medium text-lg">
                              {guest?.name.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{guest?.name || 'Unknown Guest'}</div>
                            <div className="text-sm text-gray-500">{guest?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number || booking.roomId}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status.replace('-', ' ')}</span>
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
                              onClick={() => handleCheckIn(booking)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => handleCheckOut(booking)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this booking?')) {
                                  updateBookingStatus(booking.id, 'cancelled');
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-4 h-4" />
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
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? "Get started by creating your first booking" 
                  : "No bookings match your current filters"}
              </p>
              {bookings.length === 0 && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Booking</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showBookingForm && <BookingForm />}
      {showGuestForm && <GuestForm />}
      {selectedBooking && <BookingDetails booking={selectedBooking} />}
      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBillGenerator && selectedBooking && selectedGuest && selectedRoom && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={selectedGuest} 
          room={selectedRoom} 
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={() => {
            updateRoomStatus(selectedBooking.roomId, 'dirty');
            setShowBillGenerator(false);
          }}
        />
      )}
    </div>
  );
}
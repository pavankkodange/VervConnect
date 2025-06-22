import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { BillGenerator } from './BillGenerator';
import { RoomManagement } from './RoomManagement';
import { 
  Bed, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Clock, 
  X, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  LogIn, 
  LogOut, 
  FileText, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  MoreHorizontal,
  Check,
  Clipboard,
  UserPlus,
  UserCheck,
  UserX,
  Settings,
  Home
} from 'lucide-react';
import { Room, Booking, Guest } from '../types';

interface RoomsModuleProps {
  filters?: {
    view?: string;
    dateFilter?: string;
    statusFilter?: string;
    revenueFilter?: string;
    action?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    bookings, 
    guests, 
    updateRoomStatus, 
    updateBookingStatus, 
    addBooking, 
    addGuest, 
    addRoomCharge 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { user } = useAuth();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [showBookingStatusMenu, setShowBookingStatusMenu] = useState<string | null>(null);
  
  // Check-in/Check-out specific states
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [checkInData, setCheckInData] = useState<{
    bookingId: string;
    guestId: string;
    roomId: string;
    specialRequests: string;
    estimatedCheckOutTime: string;
  } | null>(null);
  const [checkOutData, setCheckOutData] = useState<{
    bookingId: string;
    guestId: string;
    roomId: string;
    feedback: string;
    rating: number;
  } | null>(null);

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
        setShowNewBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
        setDateFilter('check-in-today');
      }
    }
  }, [filters]);

  const today = new Date().toISOString().split('T')[0];

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || room.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    const matchesSearch = !searchTerm || 
      guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateFilter = true;
    if (dateFilter === 'today') {
      matchesDateFilter = booking.checkIn === today || booking.checkOut === today;
    } else if (dateFilter === 'check-in-today') {
      matchesDateFilter = booking.checkIn === today && booking.status !== 'checked-in';
    } else if (dateFilter === 'check-out-today') {
      matchesDateFilter = booking.checkOut === today && booking.status === 'checked-in';
    }
    
    const matchesStatusFilter = !statusFilter || booking.status === statusFilter;
    
    return matchesSearch && matchesDateFilter && matchesStatusFilter;
  });

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
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'out-of-order': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBookingStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return <Calendar className="w-4 h-4" />;
      case 'checked-in': return <UserCheck className="w-4 h-4" />;
      case 'checked-out': return <UserX className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'no-show': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleRoomStatusChange = (roomId: string, newStatus: Room['status']) => {
    updateRoomStatus(roomId, newStatus);
    setShowStatusMenu(null);
  };

  const handleBookingStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    updateBookingStatus(bookingId, newStatus);
    
    // Update room status based on booking status change
    if (newStatus === 'checked-in') {
      updateRoomStatus(booking.roomId, 'occupied');
    } else if (newStatus === 'checked-out') {
      updateRoomStatus(booking.roomId, 'dirty');
    }
    
    setShowBookingStatusMenu(null);
  };

  const handleQuickCheckIn = (booking: Booking) => {
    // Update booking status to checked-in
    updateBookingStatus(booking.id, 'checked-in');
    
    // Update room status to occupied
    updateRoomStatus(booking.roomId, 'occupied');
    
    // Add room charge for the stay if needed
    const room = rooms.find(r => r.id === booking.roomId);
    if (room) {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      addRoomCharge(booking.id, {
        description: `Room ${room.number} - ${nights} night${nights !== 1 ? 's' : ''}`,
        amount: room.rate * nights,
        currency: hotelSettings.baseCurrency,
        date: today,
        category: 'room'
      });
    }
  };

  const handleQuickCheckOut = (booking: Booking) => {
    // Update booking status to checked-out
    updateBookingStatus(booking.id, 'checked-out');
    
    // Update room status to dirty
    updateRoomStatus(booking.roomId, 'dirty');
    
    // Show bill generator
    setSelectedBooking(booking);
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    if (guest) setSelectedGuest(guest);
    if (room) setSelectedRoom(room);
    setShowBillGenerator(true);
  };

  const CheckInForm = () => {
    if (!checkInData) return null;
    
    const booking = bookings.find(b => b.id === checkInData.bookingId);
    const guest = guests.find(g => g.id === checkInData.guestId);
    const room = rooms.find(r => r.id === checkInData.roomId);
    
    if (!booking || !guest || !room) return null;
    
    const [formData, setFormData] = useState({
      specialRequests: booking.specialRequests || '',
      estimatedCheckOutTime: '11:00',
      idVerified: false,
      paymentVerified: false,
      welcomePackageGiven: false,
      roomKeyIssued: false,
      parkingRequired: false,
      wifiInfoProvided: false
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Update booking with special requests
      if (formData.specialRequests !== booking.specialRequests) {
        // In a real app, you would update the booking here
      }
      
      // Update booking status to checked-in
      updateBookingStatus(booking.id, 'checked-in');
      
      // Update room status to occupied
      updateRoomStatus(room.id, 'occupied');
      
      // Add room charge for the stay
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      addRoomCharge(booking.id, {
        description: `Room ${room.number} - ${nights} night${nights !== 1 ? 's' : ''}`,
        amount: room.rate * nights,
        currency: hotelSettings.baseCurrency,
        date: today,
        category: 'room'
      });
      
      setShowCheckInForm(false);
      setCheckInData(null);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest Check-In</h3>
              <button
                onClick={() => {
                  setShowCheckInForm(false);
                  setCheckInData(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Guest & Room Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Guest Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-900">{guest.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-800">{guest.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-800">{guest.phone}</span>
                  </div>
                  {guest.vipStatus && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-700 font-medium">VIP Guest</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Room Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-900">Room {room.number}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-green-500" />
                    <span className="text-green-800 capitalize">{room.type} Room</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <span className="text-green-800">{formatCurrency(room.rate)}/night</span>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Check-in Checklist */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Check-in Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.idVerified}
                      onChange={(e) => setFormData({ ...formData, idVerified: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">ID Verified</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.paymentVerified}
                      onChange={(e) => setFormData({ ...formData, paymentVerified: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Payment Verified</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.welcomePackageGiven}
                      onChange={(e) => setFormData({ ...formData, welcomePackageGiven: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Welcome Package Given</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roomKeyIssued}
                      onChange={(e) => setFormData({ ...formData, roomKeyIssued: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Room Key Issued</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.parkingRequired}
                      onChange={(e) => setFormData({ ...formData, parkingRequired: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Parking Required</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.wifiInfoProvided}
                      onChange={(e) => setFormData({ ...formData, wifiInfoProvided: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">WiFi Info Provided</span>
                  </label>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Any special requests or notes for this stay"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Check-out Time</label>
                    <input
                      type="time"
                      value={formData.estimatedCheckOutTime}
                      onChange={(e) => setFormData({ ...formData, estimatedCheckOutTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckInForm(false);
                    setCheckInData(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Complete Check-in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CheckOutForm = () => {
    if (!checkOutData) return null;
    
    const booking = bookings.find(b => b.id === checkOutData.bookingId);
    const guest = guests.find(g => g.id === checkOutData.guestId);
    const room = rooms.find(r => r.id === checkOutData.roomId);
    
    if (!booking || !guest || !room) return null;
    
    const [formData, setFormData] = useState({
      feedback: '',
      rating: 5,
      roomKeysReturned: false,
      minibarChecked: false,
      roomInspected: false,
      outstandingCharges: false,
      lateCheckoutFee: false
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Update booking status to checked-out
      updateBookingStatus(booking.id, 'checked-out');
      
      // Update room status to dirty
      updateRoomStatus(room.id, 'dirty');
      
      // Add late checkout fee if applicable
      if (formData.lateCheckoutFee) {
        addRoomCharge(booking.id, {
          description: 'Late checkout fee',
          amount: room.rate * 0.5, // 50% of room rate
          currency: hotelSettings.baseCurrency,
          date: today,
          category: 'other'
        });
      }
      
      // Show bill generator
      setSelectedBooking(booking);
      setSelectedGuest(guest);
      setSelectedRoom(room);
      
      setShowCheckOutForm(false);
      setCheckOutData(null);
      setShowBillGenerator(true);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest Check-Out</h3>
              <button
                onClick={() => {
                  setShowCheckOutForm(false);
                  setCheckOutData(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Guest & Room Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Guest Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-900">{guest.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-800">{guest.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-800">{guest.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-orange-900 mb-3">Stay Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-900">Room {room.number}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-800">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-800">
                      Total Charges: {formatCurrency(booking.charges.reduce((sum, charge) => sum + charge.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Check-out Checklist */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Check-out Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roomKeysReturned}
                      onChange={(e) => setFormData({ ...formData, roomKeysReturned: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Room Keys Returned</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.minibarChecked}
                      onChange={(e) => setFormData({ ...formData, minibarChecked: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Minibar Checked</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roomInspected}
                      onChange={(e) => setFormData({ ...formData, roomInspected: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Room Inspected</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.outstandingCharges}
                      onChange={(e) => setFormData({ ...formData, outstandingCharges: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Outstanding Charges Settled</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.lateCheckoutFee}
                      onChange={(e) => setFormData({ ...formData, lateCheckoutFee: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Apply Late Checkout Fee</span>
                  </label>
                </div>
              </div>
              
              {/* Guest Feedback */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Feedback</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1 focus:outline-none"
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Any feedback from the guest about their stay"
                    />
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckOutForm(false);
                    setCheckOutData(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Complete & Generate Bill</span>
                </button>
              </div>
            </form>
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
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {dateFilter === 'today' && 'Today\'s Activity'}
                {dateFilter === 'check-in-today' && 'Today\'s Check-ins'}
                {dateFilter === 'check-out-today' && 'Today\'s Check-outs'}
              </span>
              <button
                onClick={() => setDateFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowRoomManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Rooms</span>
          </button>
          <button
            onClick={() => setShowNewGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Guest</span>
          </button>
          <button
            onClick={() => setShowNewBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {view === 'bookings' && (
            <div className="flex space-x-2">
              <button
                onClick={() => setDateFilter('check-in-today')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  dateFilter === 'check-in-today' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today's Check-ins
              </button>
              <button
                onClick={() => setDateFilter('check-out-today')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  dateFilter === 'check-out-today' 
                    ? 'bg-orange-100 text-orange-800 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today's Check-outs
              </button>
            </div>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {view === 'rooms' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-order">Out of Order</option>
                </select>
              </div>
            )}
            
            {view === 'bookings' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today's Activity</option>
                    <option value="check-in-today">Today's Check-ins</option>
                    <option value="check-out-today">Today's Check-outs</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {view === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const activeBooking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
            const guest = activeBooking ? guests.find(g => g.id === activeBooking.guestId) : null;
            
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
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu(showStatusMenu === room.id ? null : room.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(room.status)}`}
                      >
                        {getStatusIcon(room.status)}
                        <span className="capitalize">{room.status.replace('-', ' ')}</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                      
                      {showStatusMenu === room.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleRoomStatusChange(room.id, 'clean')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Clean</span>
                            </button>
                            <button
                              onClick={() => handleRoomStatusChange(room.id, 'dirty')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <span>Dirty</span>
                            </button>
                            <button
                              onClick={() => handleRoomStatusChange(room.id, 'occupied')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <User className="w-4 h-4 text-blue-500" />
                              <span>Occupied</span>
                            </button>
                            <button
                              onClick={() => handleRoomStatusChange(room.id, 'maintenance')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Settings className="w-4 h-4 text-red-500" />
                              <span>Maintenance</span>
                            </button>
                            <button
                              onClick={() => handleRoomStatusChange(room.id, 'out-of-order')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                              <span>Out of Order</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                      <p className="text-sm text-gray-600 capitalize">{room.type} room</p>
                    </div>
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}</span>
                  </div>
                  
                  {activeBooking && guest ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-800">{guest.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(activeBooking.checkIn).toLocaleDateString()} - {new Date(activeBooking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Bed className="w-4 h-4" />
                        <span>{room.bedType} • {room.maxOccupancy} guests max</span>
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
                    {activeBooking ? (
                      <button
                        onClick={() => {
                          setCheckOutData({
                            bookingId: activeBooking.id,
                            guestId: activeBooking.guestId,
                            roomId: room.id,
                            feedback: '',
                            rating: 5
                          });
                          setShowCheckOutForm(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Check Out</span>
                      </button>
                    ) : (
                      <button
                        disabled={room.status !== 'clean'}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Check In</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        const newStatus = room.status === 'clean' ? 'dirty' : 'clean';
                        updateRoomStatus(room.id, newStatus);
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        room.status === 'clean' 
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {room.status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const room = rooms.find(r => r.id === booking.roomId);
                  const isCheckInToday = booking.checkIn === today && booking.status === 'confirmed';
                  const isCheckOutToday = booking.checkOut === today && booking.status === 'checked-in';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{guest?.name || 'Unknown Guest'}</div>
                            <div className="text-sm text-gray-500">{guest?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type} room</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={() => setShowBookingStatusMenu(showBookingStatusMenu === booking.id ? null : booking.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getBookingStatusColor(booking.status)}`}
                          >
                            {getBookingStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status.replace('-', ' ')}</span>
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </button>
                          
                          {showBookingStatusMenu === booking.id && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, 'confirmed')}
                                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Confirmed</span>
                                </button>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, 'checked-in')}
                                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  <span>Checked In</span>
                                </button>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, 'checked-out')}
                                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <UserX className="w-4 h-4 text-gray-500" />
                                  <span>Checked Out</span>
                                </button>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, 'cancelled')}
                                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                  <span>Cancelled</span>
                                </button>
                                <button
                                  onClick={() => handleBookingStatusChange(booking.id, 'no-show')}
                                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                  <span>No Show</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.charges.length} charges
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {isCheckInToday && (
                            <button
                              onClick={() => handleQuickCheckIn(booking)}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <LogIn className="w-4 h-4" />
                              <span>Check In</span>
                            </button>
                          )}
                          
                          {isCheckOutToday && (
                            <button
                              onClick={() => handleQuickCheckOut(booking)}
                              className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Check Out</span>
                            </button>
                          )}
                          
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {selectedBooking?.id === booking.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      // View booking details
                                      setSelectedBooking(null);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                  </button>
                                  
                                  {booking.status === 'confirmed' && (
                                    <button
                                      onClick={() => {
                                        setCheckInData({
                                          bookingId: booking.id,
                                          guestId: booking.guestId,
                                          roomId: booking.roomId,
                                          specialRequests: booking.specialRequests || '',
                                          estimatedCheckOutTime: '11:00'
                                        });
                                        setShowCheckInForm(true);
                                        setSelectedBooking(null);
                                      }}
                                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <LogIn className="w-4 h-4" />
                                      <span>Check In</span>
                                    </button>
                                  )}
                                  
                                  {booking.status === 'checked-in' && (
                                    <button
                                      onClick={() => {
                                        setCheckOutData({
                                          bookingId: booking.id,
                                          guestId: booking.guestId,
                                          roomId: booking.roomId,
                                          feedback: '',
                                          rating: 5
                                        });
                                        setShowCheckOutForm(true);
                                        setSelectedBooking(null);
                                      }}
                                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <LogOut className="w-4 h-4" />
                                      <span>Check Out</span>
                                    </button>
                                  )}
                                  
                                  {booking.status === 'checked-in' && (
                                    <button
                                      onClick={() => {
                                        const guest = guests.find(g => g.id === booking.guestId);
                                        const room = rooms.find(r => r.id === booking.roomId);
                                        if (guest) setSelectedGuest(guest);
                                        if (room) setSelectedRoom(room);
                                        setShowBillGenerator(true);
                                        setSelectedBooking(null);
                                      }}
                                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>Generate Bill</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => {
                                      // Edit booking
                                      setSelectedBooking(null);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Booking</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? "Get started by creating your first booking" 
                  : "No bookings match your current filters"}
              </p>
              {bookings.length === 0 && (
                <button
                  onClick={() => setShowNewBookingForm(true)}
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
      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showCheckInForm && <CheckInForm />}
      {showCheckOutForm && <CheckOutForm />}
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
            // Refresh data or update UI as needed
          }}
        />
      )}
    </div>
  );
}
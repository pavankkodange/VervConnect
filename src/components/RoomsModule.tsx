import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import { BillGenerator } from './BillGenerator';
import { RoomManagement } from './RoomManagement';
import { Bed, Calendar, Plus, Search, Filter, CheckCircle, X, User, Mail, Phone, Clock, CreditCard, Save, Edit, Trash2, Eye, ArrowRight, ArrowLeft, Home, Users, DollarSign, FileText, AlertCircle, Upload, Globe, Import as Passport } from 'lucide-react';
import { Room, Guest, Booking } from '../types';

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
    guests, 
    bookings, 
    addGuest, 
    updateGuest,
    addBooking, 
    updateRoomStatus, 
    updateBookingStatus 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { formatDate, getCurrentDate } = useBranding();
  const { user } = useAuth();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>('');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.dateFilter) {
        if (filters.dateFilter === 'check-in-today') {
          setDateFilter('check-in-today');
          setView('bookings');
        } else if (filters.dateFilter === 'check-out-today') {
          setDateFilter('check-out-today');
          setView('bookings');
        } else if (filters.dateFilter === 'today') {
          setDateFilter('today');
          setView('bookings');
        }
      }
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
    }
  }, [filters]);

  const today = getCurrentDate();

  // Filter rooms based on search and status filter
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || room.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter bookings based on search and date filter
  const filteredBookings = bookings.filter(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    const matchesSearch = !searchTerm || 
      (guest && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room && room.number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDateFilter = true;
    if (dateFilter === 'check-in-today') {
      matchesDateFilter = booking.checkIn === today;
    } else if (dateFilter === 'check-out-today') {
      matchesDateFilter = booking.checkOut === today;
    } else if (dateFilter === 'today') {
      matchesDateFilter = booking.checkIn === today || booking.checkOut === today;
    }
    
    return matchesSearch && matchesDateFilter;
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

  const handleCheckIn = (booking: Booking) => {
    const room = rooms.find(r => r.id === booking.roomId);
    if (room && room.status === 'clean') {
      updateRoomStatus(room.id, 'occupied');
      updateBookingStatus(booking.id, 'checked-in');
    } else {
      alert('Room is not ready for check-in. Please ensure the room is clean.');
    }
  };

  const handleCheckOut = (booking: Booking) => {
    updateRoomStatus(booking.roomId, 'dirty');
    updateBookingStatus(booking.id, 'checked-out');
    setShowBillGenerator(true);
    setSelectedBooking(booking);
    const guest = guests.find(g => g.id === booking.guestId);
    if (guest) {
      setSelectedGuest(guest);
    }
    const room = rooms.find(r => r.id === booking.roomId);
    if (room) {
      setSelectedRoom(room);
    }
  };

  const handleIdDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a data URL for demo purposes
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setIdDocumentUrl(dataUrl);
        setIsUploadingDocument(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploadingDocument(false);
    }
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      roomId: '',
      guestId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as Booking['source'],
      // New guest fields
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      guestAddress: '',
      guestNationality: '',
      guestIdType: 'passport',
      guestIdNumber: ''
    });

    const [step, setStep] = useState(1);
    const [bookingError, setBookingError] = useState<string>('');

    // Check if a room is already booked for the given dates
    const isRoomBooked = (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string): boolean => {
      return bookings.some(booking => {
        // Skip the current booking when checking (for editing)
        if (excludeBookingId && booking.id === excludeBookingId) return false;
        
        // Skip cancelled or checked-out bookings
        if (booking.status === 'cancelled' || booking.status === 'checked-out') return false;
        
        // Check if it's the same room
        if (booking.roomId === roomId) {
          // Check if date periods overlap
          const bookingCheckIn = booking.checkIn;
          const bookingCheckOut = booking.checkOut;
          
          // Overlap occurs if:
          // - New check-in is between existing booking's check-in and check-out
          // - New check-out is between existing booking's check-in and check-out
          // - New booking completely encompasses existing booking
          if (
            (checkIn >= bookingCheckIn && checkIn < bookingCheckOut) ||
            (checkOut > bookingCheckIn && checkOut <= bookingCheckOut) ||
            (checkIn <= bookingCheckIn && checkOut >= bookingCheckOut)
          ) {
            return true;
          }
        }
        return false;
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (step === 1) {
        // Validate room availability
        if (isRoomBooked(formData.roomId, formData.checkIn, formData.checkOut)) {
          setBookingError('This room is already booked for the selected dates. Please choose different dates or another room.');
          return;
        }
        
        // If using existing guest, move to confirmation
        if (formData.guestId) {
          setStep(3);
        } else {
          // If new guest, move to guest information form
          setStep(2);
        }
        return;
      }
      
      if (step === 2) {
        // Create new guest
        const newGuest = {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
          address: formData.guestAddress,
          nationality: formData.guestNationality,
          identificationDetails: {
            type: formData.guestIdType as any,
            number: formData.guestIdNumber
          }
        };
        
        addGuest(newGuest);
        
        // Find the newly created guest
        const createdGuest = guests[guests.length - 1];
        setFormData(prev => ({ ...prev, guestId: createdGuest.id }));
        
        // Move to confirmation
        setStep(3);
        return;
      }
      
      // Final submission (step 3)
      const room = rooms.find(r => r.id === formData.roomId);
      
      if (room) {
        // Calculate total amount based on room rate and stay duration
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
          roomId: '',
          guestId: '',
          checkIn: '',
          checkOut: '',
          adults: 1,
          children: 0,
          specialRequests: '',
          source: 'direct',
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          guestAddress: '',
          guestNationality: '',
          guestIdType: 'passport',
          guestIdNumber: ''
        });
        setStep(1);
        setBookingError('');
      }
    };

    const availableRooms = rooms.filter(room => 
      room.status === 'clean' || room.status === 'dirty'
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {step === 1 ? 'New Booking - Room Selection' : 
                 step === 2 ? 'New Booking - Guest Information' :
                 'Confirm Booking'}
              </h3>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setStep(1);
                  setBookingError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Bed className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2">Room</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div className={`h-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2">Guest</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div className={`h-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2">Confirm</span>
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Room Selection */}
              {step === 1 && (
                <div className="space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        min={today}
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
                        min={formData.checkIn || today}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                      <input
                        type="number"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                      <input
                        type="number"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest</label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.guestId}
                        onChange={(e) => {
                          setFormData({ ...formData, guestId: e.target.value });
                          setIsNewGuest(false);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        disabled={isNewGuest}
                      >
                        <option value="">Select existing guest</option>
                        {guests.map((guest) => (
                          <option key={guest.id} value={guest.id}>{guest.name} - {guest.email}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewGuest(!isNewGuest);
                          if (!isNewGuest) {
                            setFormData({ ...formData, guestId: '' });
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        {isNewGuest ? 'Select Existing' : 'New Guest'}
                      </button>
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
                </div>
              )}

              {/* Step 2: Guest Information (for new guests) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.guestPhone}
                        onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.guestAddress}
                      onChange={(e) => setFormData({ ...formData, guestAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        value={formData.guestNationality}
                        onChange={(e) => setFormData({ ...formData, guestNationality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                      <select
                        value={formData.guestIdType}
                        onChange={(e) => setFormData({ ...formData, guestIdType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID</option>
                        <option value="visa">Visa</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={formData.guestIdNumber}
                      onChange={(e) => setFormData({ ...formData, guestIdNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Room</p>
                        <p className="font-semibold">
                          {rooms.find(r => r.id === formData.roomId)?.number} - {rooms.find(r => r.id === formData.roomId)?.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rate</p>
                        <p className="font-semibold">
                          {formatCurrency(rooms.find(r => r.id === formData.roomId)?.rate || 0)}/night
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-semibold">{formatDate(formData.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-semibold">{formatDate(formData.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="font-semibold">{formData.adults} Adults, {formData.children} Children</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Source</p>
                        <p className="font-semibold capitalize">{formData.source.replace('.', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                    <div className="space-y-2">
                      <p>
                        <span className="text-sm text-gray-600">Name: </span>
                        <span className="font-semibold">
                          {isNewGuest 
                            ? formData.guestName 
                            : guests.find(g => g.id === formData.guestId)?.name}
                        </span>
                      </p>
                      <p>
                        <span className="text-sm text-gray-600">Email: </span>
                        <span className="font-semibold">
                          {isNewGuest 
                            ? formData.guestEmail 
                            : guests.find(g => g.id === formData.guestId)?.email}
                        </span>
                      </p>
                      <p>
                        <span className="text-sm text-gray-600">Phone: </span>
                        <span className="font-semibold">
                          {isNewGuest 
                            ? formData.guestPhone 
                            : guests.find(g => g.id === formData.guestId)?.phone}
                        </span>
                      </p>
                    </div>
                  </div>

                  {formData.specialRequests && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Special Requests</h4>
                      <p className="text-gray-700">{formData.specialRequests}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-blue-900">Payment Information</h4>
                    </div>
                    <p className="text-blue-700 mb-4">
                      A deposit of {formatCurrency((rooms.find(r => r.id === formData.roomId)?.rate || 0) * 0.2)} will be required to confirm this booking.
                    </p>
                    <p className="text-sm text-blue-600">
                      Full payment will be collected upon check-in.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(step - 1);
                      setBookingError('');
                    }}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
                
                <button
                  type={step === 3 ? 'submit' : 'button'}
                  onClick={step < 3 ? (e) => handleSubmit(e) : undefined}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {step < 3 ? (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Continue</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Confirm Booking</span>
                    </>
                  )}
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
      name: selectedGuest?.name || '',
      email: selectedGuest?.email || '',
      phone: selectedGuest?.phone || '',
      address: selectedGuest?.address || '',
      nationality: selectedGuest?.nationality || '',
      idType: selectedGuest?.identificationDetails?.type || 'passport',
      idNumber: selectedGuest?.identificationDetails?.number || '',
      company: selectedGuest?.company || '',
      title: selectedGuest?.title || 'Mr.',
      dateOfBirth: selectedGuest?.dateOfBirth || '',
      vipStatus: selectedGuest?.vipStatus || false,
      vipTier: selectedGuest?.vipTier || 'gold',
      dietaryRestrictions: selectedGuest?.dietaryRestrictions || [],
      specialRequests: selectedGuest?.specialRequests || []
    });

    const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
    const [newSpecialRequest, setNewSpecialRequest] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const guestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        nationality: formData.nationality,
        identificationDetails: {
          type: formData.idType as any,
          number: formData.idNumber
        },
        company: formData.company,
        title: formData.title,
        dateOfBirth: formData.dateOfBirth,
        vipStatus: formData.vipStatus,
        vipTier: formData.vipTier as any,
        dietaryRestrictions: formData.dietaryRestrictions,
        specialRequests: formData.specialRequests
      };
      
      if (selectedGuest) {
        updateGuest(selectedGuest.id, guestData);
      } else {
        addGuest(guestData);
      }
      
      setShowGuestForm(false);
    };

    const addDietaryRestriction = () => {
      if (newDietaryRestriction.trim()) {
        setFormData({
          ...formData,
          dietaryRestrictions: [...formData.dietaryRestrictions, newDietaryRestriction.trim()]
        });
        setNewDietaryRestriction('');
      }
    };

    const removeDietaryRestriction = (index: number) => {
      setFormData({
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions.filter((_, i) => i !== index)
      });
    };

    const addSpecialRequest = () => {
      if (newSpecialRequest.trim()) {
        setFormData({
          ...formData,
          specialRequests: [...formData.specialRequests, newSpecialRequest.trim()]
        });
        setNewSpecialRequest('');
      }
    };

    const removeSpecialRequest = (index: number) => {
      setFormData({
        ...formData,
        specialRequests: formData.specialRequests.filter((_, i) => i !== index)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedGuest ? 'Edit Guest' : 'Add New Guest'}
              </h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <select
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="visa">Visa</option>
                  </select>
                </div>
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

              {formData.vipStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VIP Tier</label>
                  <select
                    value={formData.vipTier}
                    onChange={(e) => setFormData({ ...formData, vipTier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newDietaryRestriction}
                    onChange={(e) => setNewDietaryRestriction(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Vegetarian, Gluten-free"
                  />
                  <button
                    type="button"
                    onClick={addDietaryRestriction}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.dietaryRestrictions.map((restriction, index) => (
                    <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                      <span>{restriction}</span>
                      <button
                        type="button"
                        onClick={() => removeDietaryRestriction(index)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialRequest}
                    onChange={(e) => setNewSpecialRequest(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Extra pillows, Late checkout"
                  />
                  <button
                    type="button"
                    onClick={addSpecialRequest}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialRequests.map((request, index) => (
                    <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      <span>{request}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialRequest(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {selectedGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
              <button
                onClick={() => {
                  setShowBookingDetails(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">#{selectedBooking.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{formatDate(selectedBooking.checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{formatDate(selectedBooking.checkOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{room?.number} ({room?.type})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{selectedBooking.adults} Adults, {selectedBooking.children} Children</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.totalAmount, selectedBooking.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium ${
                        selectedBooking.paymentStatus === 'paid' ? 'text-green-600' : 
                        selectedBooking.paymentStatus === 'partial' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span className="font-medium capitalize">{selectedBooking.source.replace('.', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Special Requests</h4>
                    <p className="text-gray-700">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {selectedBooking.charges.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Charges</h4>
                    <div className="space-y-3">
                      {selectedBooking.charges.map((charge) => (
                        <div key={charge.id} className="flex justify-between">
                          <span className="text-gray-600">{charge.description}</span>
                          <span className="font-medium">{formatCurrency(charge.amount, charge.currency)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Charges</span>
                        <span>{formatCurrency(
                          selectedBooking.charges.reduce((sum, charge) => sum + charge.amount, 0),
                          selectedBooking.currency
                        )}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Guest Information</h4>
                    <button
                      onClick={() => {
                        setSelectedGuest(guest || null);
                        setShowGuestDetails(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                  {guest && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{guest.name}</p>
                          {guest.vipStatus && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              VIP - {guest.vipTier?.toUpperCase() || 'GOLD'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{guest.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{guest.phone}</span>
                      </div>
                      {guest.nationality && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span>{guest.nationality}</span>
                        </div>
                      )}
                      {guest.identificationDetails && (
                        <div className="flex items-center space-x-2">
                          <Passport className="w-4 h-4 text-gray-400" />
                          <span>{guest.identificationDetails.type.replace('_', ' ')}: {guest.identificationDetails.number}</span>
                        </div>
                      )}
                      {guest.company && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Company: </span>
                          <span className="font-medium">{guest.company}</span>
                        </div>
                      )}
                      {guest.address && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Address: </span>
                          <span className="font-medium">{guest.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                  <div className="space-y-3">
                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCheckIn(selectedBooking)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Check In</span>
                      </button>
                    )}
                    {selectedBooking.status === 'checked-in' && (
                      <button
                        onClick={() => handleCheckOut(selectedBooking)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                        <span>Check Out</span>
                      </button>
                    )}
                    {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'checked-in') && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this booking?')) {
                            updateBookingStatus(selectedBooking.id, 'cancelled');
                            setShowBookingDetails(false);
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                    {selectedBooking.status === 'checked-in' && (
                      <button
                        onClick={() => {
                          setShowBillGenerator(true);
                          setShowBookingDetails(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        <span>Generate Bill</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const GuestDetails = () => {
    if (!selectedGuest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest Profile</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowGuestDetails(false);
                    setSelectedGuest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <User className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">{selectedGuest.name}</h4>
                    {selectedGuest.title && (
                      <p className="text-gray-600 mb-2">{selectedGuest.title}</p>
                    )}
                    {selectedGuest.vipStatus && (
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-3">
                        VIP - {selectedGuest.vipTier?.toUpperCase() || 'GOLD'}
                      </div>
                    )}
                    <div className="w-full space-y-2 mt-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedGuest.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedGuest.phone}</span>
                      </div>
                      {selectedGuest.nationality && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{selectedGuest.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowGuestDetails(false);
                        setShowGuestForm(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowGuestDetails(false);
                        setShowBookingForm(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>New Booking</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGuest.company && (
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{selectedGuest.company}</p>
                      </div>
                    )}
                    {selectedGuest.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium">{formatDate(selectedGuest.dateOfBirth)}</p>
                      </div>
                    )}
                    {selectedGuest.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{selectedGuest.address}</p>
                      </div>
                    )}
                    {selectedGuest.identificationDetails && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">ID Type</p>
                          <p className="font-medium capitalize">
                            {selectedGuest.identificationDetails.type.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ID Number</p>
                          <p className="font-medium">{selectedGuest.identificationDetails.number}</p>
                        </div>
                      </>
                    )}
                    {selectedGuest.emergencyContactDetails && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Emergency Contact</p>
                        <p className="font-medium">
                          {selectedGuest.emergencyContactDetails.name} ({selectedGuest.emergencyContactDetails.relationship}) - {selectedGuest.emergencyContactDetails.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedGuest.dietaryRestrictions?.length > 0 || selectedGuest.specialRequests?.length > 0) && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences & Requests</h4>
                    
                    {selectedGuest.dietaryRestrictions?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Dietary Restrictions</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuest.dietaryRestrictions.map((restriction, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedGuest.specialRequests?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuest.specialRequests.map((request, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {request}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedGuest.vipStatus && selectedGuest.vipPreferences && (
                  <div className="bg-yellow-50 rounded-xl p-6 mb-6 border border-yellow-200">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-4">VIP Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedGuest.vipPreferences.preferredRoomType && (
                        <div>
                          <p className="text-sm text-yellow-800">Preferred Room Type</p>
                          <p className="font-medium text-yellow-900 capitalize">{selectedGuest.vipPreferences.preferredRoomType}</p>
                        </div>
                      )}
                      {selectedGuest.vipPreferences.preferredFloor && (
                        <div>
                          <p className="text-sm text-yellow-800">Preferred Floor</p>
                          <p className="font-medium text-yellow-900">{selectedGuest.vipPreferences.preferredFloor}</p>
                        </div>
                      )}
                      {selectedGuest.vipPreferences.preferredAmenities && selectedGuest.vipPreferences.preferredAmenities.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-yellow-800 mb-2">Preferred Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedGuest.vipPreferences.preferredAmenities.map((amenity, index) => (
                              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedGuest.vipPreferences.specialServices && selectedGuest.vipPreferences.specialServices.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-yellow-800 mb-2">Special Services</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedGuest.vipPreferences.specialServices.map((service, index) => (
                              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">ID Documents</h4>
                  
                  {selectedGuest.idDocuments && selectedGuest.idDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedGuest.idDocuments.map((document) => (
                        <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{document.documentName}</h5>
                            {document.verified && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>
                            )}
                          </div>
                          {document.fileType === 'image' && (
                            <img 
                              src={document.fileUrl} 
                              alt={document.documentName} 
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <div className="text-sm text-gray-600">
                            <p>Type: {document.type.replace('_', ' ')}</p>
                            {document.expiryDate && <p>Expires: {formatDate(document.expiryDate)}</p>}
                            <p>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Passport className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No ID documents uploaded yet</p>
                      <button
                        onClick={() => {
                          // Open ID document upload form
                          document.getElementById('id-document-upload')?.click();
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Upload ID Document
                      </button>
                      <input
                        id="id-document-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleIdDocumentUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                  
                  {idDocumentUrl && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">New Document</h5>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending Verification</span>
                      </div>
                      <img 
                        src={idDocumentUrl} 
                        alt="New ID Document" 
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setIdDocumentUrl('')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => {
                            // Save the document to the guest profile
                            if (selectedGuest) {
                              const newDocument = {
                                id: Date.now().toString(),
                                type: 'passport',
                                documentName: 'ID Document',
                                fileUrl: idDocumentUrl,
                                fileType: 'image',
                                fileName: 'id_document.jpg',
                                uploadedAt: new Date().toISOString(),
                                uploadedBy: user?.id || 'system',
                                verified: false
                              };
                              
                              const updatedDocuments = selectedGuest.idDocuments 
                                ? [...selectedGuest.idDocuments, newDocument]
                                : [newDocument];
                              
                              updateGuest(selectedGuest.id, { idDocuments: updatedDocuments });
                              setIdDocumentUrl('');
                              alert('Document uploaded successfully!');
                            }
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Save Document
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isUploadingDocument && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-indigo-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      <span>Uploading document...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckInForm = () => {
    if (!selectedBooking) return null;

    const guest = guests.find(g => g.id === selectedBooking.guestId);
    const room = rooms.find(r => r.id === selectedBooking.roomId);

    const [formData, setFormData] = useState({
      paymentMethod: 'card' as 'card' | 'cash' | 'bank-transfer',
      paymentAmount: selectedBooking.totalAmount,
      idDocument: null as File | null,
      specialRequests: selectedBooking.specialRequests || '',
      signature: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Process check-in
      handleCheckIn(selectedBooking);
      
      // Close the form
      setShowBookingDetails(false);
      setSelectedBooking(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Check-in: Room {room?.number}</h3>
              <button
                onClick={() => {
                  setShowBookingDetails(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-blue-900">Guest Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Name</p>
                    <p className="font-semibold text-blue-900">{guest?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Email</p>
                    <p className="font-semibold text-blue-900">{guest?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Phone</p>
                    <p className="font-semibold text-blue-900">{guest?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Nationality</p>
                    <p className="font-semibold text-blue-900">{guest?.nationality || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Home className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Booking Details</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold">{formatDate(selectedBooking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-semibold">{formatDate(selectedBooking.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-semibold capitalize">{room?.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold">{selectedBooking.adults} Adults, {selectedBooking.children} Children</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Payment</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank-transfer">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">{hotelSettings.baseCurrency}</span>
                      <input
                        type="number"
                        value={formData.paymentAmount}
                        onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Passport className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">ID Verification</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document</label>
                    <div className="flex items-center space-x-2">
                      <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-5 h-5" />
                        <span>Upload Document</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdDocumentUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploadingDocument && (
                      <div className="flex items-center space-x-2 mt-2 text-indigo-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-sm">Uploading document...</span>
                      </div>
                    )}
                    {idDocumentUrl && (
                      <div className="mt-4 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">ID Document</h5>
                          <button
                            type="button"
                            onClick={() => setIdDocumentUrl('')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <img 
                          src={idDocumentUrl} 
                          alt="ID Document" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                </div>
                
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
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <input
                  type="checkbox"
                  checked={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  I confirm that all information provided is accurate and I agree to the hotel's terms and conditions.
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Check-in</span>
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
          <p className="text-gray-600 mt-2">Manage rooms, bookings, and guest information</p>
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {dateFilter === 'check-in-today' ? 'Check-ins Today' : 
                 dateFilter === 'check-out-today' ? 'Check-outs Today' : 
                 'Today\'s Activity'}
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
            <User className="w-4 h-4" />
            <span>Add Guest</span>
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
            <Bed className="w-4 h-4" />
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
          )}
          
          {view === 'bookings' && (
            <>
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
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Room Status Summary */}
      {view === 'rooms' && (
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
      )}

      {/* Rooms Grid */}
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {room.status.replace('-', ' ')}
                  </span>
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
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{room.size || 25} sq m</span>
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
                
                <button
                  onClick={() => {
                    if (room.status === 'clean' || room.status === 'dirty') {
                      setShowBookingForm(true);
                    } else if (room.status === 'occupied') {
                      const booking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
                      if (booking) {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }
                    }
                  }}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    room.status === 'clean' || room.status === 'dirty'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : room.status === 'occupied'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={room.status === 'maintenance' || room.status === 'out-of-order'}
                >
                  {room.status === 'clean' || room.status === 'dirty' ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Book Room</span>
                    </>
                  ) : room.status === 'occupied' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>View Booking</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Unavailable</span>
                    </>
                  )}
                </button>
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

      {/* Bookings Table */}
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
                        <div className="text-sm text-gray-900">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
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
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingDetails(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Details
                          </button>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingDetails(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check In
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => handleCheckOut(booking)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Check Out
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
      )}

      {showBookingForm && <BookingForm />}
      {showGuestForm && <GuestForm />}
      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBookingDetails && (
        selectedBooking?.status === 'confirmed' ? <CheckInForm /> : <BookingDetails />
      )}
      {showGuestDetails && <GuestDetails />}
      {showBillGenerator && selectedBooking && selectedGuest && selectedRoom && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={selectedGuest} 
          room={selectedRoom} 
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
            setSelectedGuest(null);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}
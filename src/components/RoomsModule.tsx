import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { RoomManagement } from './RoomManagement';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  X, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  Home,
  Settings
} from 'lucide-react';
import { Room, Guest, Booking } from '../types';

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
    guests, 
    bookings, 
    addGuest, 
    addBooking, 
    updateBookingStatus, 
    updateRoomStatus 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingCompleted, setBookingCompleted] = useState(false);

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
      guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    const today = new Date().toISOString().split('T')[0];
    
    if (dateFilter === 'check-in-today') {
      matchesDate = booking.checkIn === today;
    } else if (dateFilter === 'check-out-today') {
      matchesDate = booking.checkOut === today;
    } else if (dateFilter === 'today') {
      matchesDate = booking.checkIn === today || booking.checkOut === today;
    }
    
    return matchesSearch && matchesDate;
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

  const NewBookingForm = () => {
    const [formData, setFormData] = useState({
      step1: {
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        isNewGuest: true,
        existingGuestId: ''
      },
      step2: {
        roomId: '',
        checkIn: '',
        checkOut: '',
        adults: 1,
        children: 0,
        specialRequests: ''
      },
      step3: {
        totalAmount: 0,
        paymentMethod: 'card',
        paymentStatus: 'pending'
      }
    });

    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

    // Calculate available rooms based on dates
    useEffect(() => {
      if (formData.step2.checkIn && formData.step2.checkOut) {
        const checkIn = formData.step2.checkIn;
        const checkOut = formData.step2.checkOut;
        
        // Find rooms that are not booked during the selected dates
        const available = rooms.filter(room => {
          const isBooked = bookings.some(booking => 
            booking.roomId === room.id && 
            booking.status !== 'cancelled' && 
            booking.status !== 'checked-out' &&
            ((booking.checkIn <= checkIn && booking.checkOut > checkIn) || 
             (booking.checkIn < checkOut && booking.checkOut >= checkOut) ||
             (booking.checkIn >= checkIn && booking.checkOut <= checkOut))
          );
          
          return !isBooked && room.status !== 'maintenance' && room.status !== 'out-of-order';
        });
        
        setAvailableRooms(available);
      } else {
        setAvailableRooms([]);
      }
    }, [formData.step2.checkIn, formData.step2.checkOut]);

    // Calculate total amount when room and dates change
    useEffect(() => {
      if (formData.step2.roomId && formData.step2.checkIn && formData.step2.checkOut) {
        const room = rooms.find(r => r.id === formData.step2.roomId);
        if (room) {
          const checkIn = new Date(formData.step2.checkIn);
          const checkOut = new Date(formData.step2.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          
          const totalAmount = room.rate * nights;
          setFormData(prev => ({
            ...prev,
            step3: {
              ...prev.step3,
              totalAmount
            }
          }));
        }
      }
    }, [formData.step2.roomId, formData.step2.checkIn, formData.step2.checkOut]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Create or get guest
      let guestId = formData.step1.existingGuestId;
      
      if (formData.step1.isNewGuest) {
        // Create new guest
        const newGuest = {
          name: formData.step1.guestName,
          email: formData.step1.guestEmail,
          phone: formData.step1.guestPhone
        };
        
        addGuest(newGuest);
        guestId = Date.now().toString(); // Simulating the ID that would be returned
      }
      
      // Create booking
      const newBooking = {
        guestId,
        roomId: formData.step2.roomId,
        checkIn: formData.step2.checkIn,
        checkOut: formData.step2.checkOut,
        status: 'confirmed' as const,
        totalAmount: formData.step3.totalAmount,
        currency: hotelSettings.baseCurrency,
        adults: formData.step2.adults,
        children: formData.step2.children,
        specialRequests: formData.step2.specialRequests,
        source: 'direct' as const,
        paymentStatus: formData.step3.paymentStatus as 'pending' | 'partial' | 'paid' | 'refunded',
        createdAt: new Date().toISOString(),
        confirmationNumber: `HM${new Date().getFullYear()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      };
      
      addBooking(newBooking);
      
      // Update room status if immediate check-in
      if (formData.step2.checkIn === new Date().toISOString().split('T')[0]) {
        updateRoomStatus(formData.step2.roomId, 'occupied');
      }
      
      setBookingCompleted(true);
    };

    const handleNext = () => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    };

    const existingGuests = guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone
    }));

    if (bookingCompleted) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">The booking has been successfully created.</p>
              <button
                onClick={() => {
                  setShowNewBookingForm(false);
                  setBookingCompleted(false);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Booking</h3>
              <button
                onClick={() => setShowNewBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'}`}>Step 1</p>
                    <p className="text-sm text-gray-500">Guest Information</p>
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Bed className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>Step 2</p>
                    <p className="text-sm text-gray-500">Room & Dates</p>
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-500'}`}>Step 3</p>
                    <p className="text-sm text-gray-500">Payment</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Guest Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={formData.step1.isNewGuest}
                          onChange={() => setFormData({
                            ...formData,
                            step1: { ...formData.step1, isNewGuest: true }
                          })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">New Guest</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={!formData.step1.isNewGuest}
                          onChange={() => setFormData({
                            ...formData,
                            step1: { ...formData.step1, isNewGuest: false }
                          })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Existing Guest</span>
                      </label>
                    </div>
                  </div>

                  {formData.step1.isNewGuest ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                        <input
                          type="text"
                          value={formData.step1.guestName}
                          onChange={(e) => setFormData({
                            ...formData,
                            step1: { ...formData.step1, guestName: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.step1.guestEmail}
                          onChange={(e) => setFormData({
                            ...formData,
                            step1: { ...formData.step1, guestEmail: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.step1.guestPhone}
                          onChange={(e) => setFormData({
                            ...formData,
                            step1: { ...formData.step1, guestPhone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
                      <select
                        value={formData.step1.existingGuestId}
                        onChange={(e) => setFormData({
                          ...formData,
                          step1: { ...formData.step1, existingGuestId: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select a guest</option>
                        {existingGuests.map(guest => (
                          <option key={guest.id} value={guest.id}>
                            {guest.name} - {guest.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Room & Dates */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={formData.step2.checkIn}
                        onChange={(e) => setFormData({
                          ...formData,
                          step2: { ...formData.step2, checkIn: e.target.value }
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        value={formData.step2.checkOut}
                        onChange={(e) => setFormData({
                          ...formData,
                          step2: { ...formData.step2, checkOut: e.target.value }
                        })}
                        min={formData.step2.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                    <select
                      value={formData.step2.roomId}
                      onChange={(e) => setFormData({
                        ...formData,
                        step2: { ...formData.step2, roomId: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                      disabled={!formData.step2.checkIn || !formData.step2.checkOut}
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.number} - {room.type} - {formatCurrency(room.rate)}/night
                        </option>
                      ))}
                    </select>
                    {(!formData.step2.checkIn || !formData.step2.checkOut) && (
                      <p className="text-sm text-orange-600 mt-1">Please select dates first to see available rooms</p>
                    )}
                    {formData.step2.checkIn && formData.step2.checkOut && availableRooms.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">No rooms available for selected dates</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                      <input
                        type="number"
                        value={formData.step2.adults}
                        onChange={(e) => setFormData({
                          ...formData,
                          step2: { ...formData.step2, adults: parseInt(e.target.value) || 1 }
                        })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                      <input
                        type="number"
                        value={formData.step2.children}
                        onChange={(e) => setFormData({
                          ...formData,
                          step2: { ...formData.step2, children: parseInt(e.target.value) || 0 }
                        })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.step2.specialRequests}
                      onChange={(e) => setFormData({
                        ...formData,
                        step2: { ...formData.step2, specialRequests: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guest:</span>
                        <span className="font-medium text-gray-900">
                          {formData.step1.isNewGuest 
                            ? formData.step1.guestName 
                            : guests.find(g => g.id === formData.step1.existingGuestId)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium text-gray-900">
                          {rooms.find(r => r.id === formData.step2.roomId)?.number || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium text-gray-900">{formData.step2.checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium text-gray-900">{formData.step2.checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium text-gray-900">
                          {formData.step2.adults} Adult{formData.step2.adults !== 1 ? 's' : ''}
                          {formData.step2.children > 0 ? `, ${formData.step2.children} Child${formData.step2.children !== 1 ? 'ren' : ''}` : ''}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount:</span>
                          <span className="text-green-600">{formatCurrency(formData.step3.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'card', name: 'Credit Card', icon: CreditCard },
                        { id: 'cash', name: 'Cash', icon: CreditCard },
                        { id: 'bank-transfer', name: 'Bank Transfer', icon: CreditCard }
                      ].map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              step3: { ...formData.step3, paymentMethod: method.id }
                            })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.step3.paymentMethod === method.id
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm font-medium">{method.name}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={formData.step3.paymentStatus}
                      onChange={(e) => setFormData({
                        ...formData,
                        step3: { ...formData.step3, paymentStatus: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial Payment</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNewBookingForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                    disabled={
                      (currentStep === 1 && (
                        (formData.step1.isNewGuest && (!formData.step1.guestName || !formData.step1.guestEmail || !formData.step1.guestPhone)) ||
                        (!formData.step1.isNewGuest && !formData.step1.existingGuestId)
                      )) ||
                      (currentStep === 2 && (!formData.step2.checkIn || !formData.step2.checkOut || !formData.step2.roomId))
                    }
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Complete Booking</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CheckInForm = () => {
    const [formData, setFormData] = useState({
      notes: '',
      assignRoom: selectedBooking?.roomId ? false : true,
      roomId: selectedBooking?.roomId || '',
      earlyCheckIn: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (selectedBooking) {
        // Update booking status
        updateBookingStatus(selectedBooking.id, 'checked-in');
        
        // Update room status
        updateRoomStatus(formData.roomId || selectedBooking.roomId, 'occupied');
        
        setShowCheckInForm(false);
        setSelectedBooking(null);
      }
    };

    const availableRooms = rooms.filter(room => 
      room.status === 'clean' && 
      !bookings.some(b => 
        b.roomId === room.id && 
        b.status === 'checked-in'
      )
    );

    if (!selectedBooking) return null;

    const guest = guests.find(g => g.id === selectedBooking.guestId);
    const room = rooms.find(r => r.id === selectedBooking.roomId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Check-in Guest</h3>
            <button
              onClick={() => {
                setShowCheckInForm(false);
                setSelectedBooking(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Booking Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Guest Name</p>
                <p className="font-semibold text-blue-900">{guest?.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Confirmation #</p>
                <p className="font-semibold text-blue-900">{selectedBooking.confirmationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Check-in Date</p>
                <p className="font-semibold text-blue-900">{selectedBooking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Check-out Date</p>
                <p className="font-semibold text-blue-900">{selectedBooking.checkOut}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Room</p>
                <p className="font-semibold text-blue-900">{room ? `Room ${room.number}` : 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Guests</p>
                <p className="font-semibold text-blue-900">
                  {selectedBooking.adults} Adult{selectedBooking.adults !== 1 ? 's' : ''}
                  {selectedBooking.children > 0 ? `, ${selectedBooking.children} Child${selectedBooking.children !== 1 ? 'ren' : ''}` : ''}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedBooking.roomId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a room</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} - {room.type} - {formatCurrency(room.rate)}/night
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.earlyCheckIn}
                  onChange={(e) => setFormData({ ...formData, earlyCheckIn: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Early Check-in</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Any special notes for this check-in..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCheckInForm(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Check-in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CheckOutForm = () => {
    const [formData, setFormData] = useState({
      notes: '',
      generateInvoice: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (selectedBooking) {
        // Update booking status
        updateBookingStatus(selectedBooking.id, 'checked-out');
        
        // Update room status
        updateRoomStatus(selectedBooking.roomId, 'dirty');
        
        if (formData.generateInvoice) {
          setShowBillGenerator(true);
        } else {
          setShowCheckOutForm(false);
          setSelectedBooking(null);
        }
      }
    };

    if (!selectedBooking) return null;

    const guest = guests.find(g => g.id === selectedBooking.guestId);
    const room = rooms.find(r => r.id === selectedBooking.roomId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Check-out Guest</h3>
            <button
              onClick={() => {
                setShowCheckOutForm(false);
                setSelectedBooking(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-orange-900 mb-3">Booking Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-orange-700">Guest Name</p>
                <p className="font-semibold text-orange-900">{guest?.name}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Room</p>
                <p className="font-semibold text-orange-900">{room ? `Room ${room.number}` : 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Check-in Date</p>
                <p className="font-semibold text-orange-900">{selectedBooking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Check-out Date</p>
                <p className="font-semibold text-orange-900">{selectedBooking.checkOut}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-orange-700">Outstanding Balance</p>
                <p className="font-semibold text-orange-900">
                  {formatCurrency(selectedBooking.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.generateInvoice}
                  onChange={(e) => setFormData({ ...formData, generateInvoice: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Generate Invoice</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Any special notes for this check-out..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCheckOutForm(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Complete Check-out
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
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Bookings</h1>
          <p className="text-gray-600 mt-2">Manage rooms, reservations, and guest check-ins</p>
          {statusFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                {statusFilter} Rooms
              </span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {dateFilter === 'check-in-today' ? 'Today\'s Check-ins' : 
                 dateFilter === 'check-out-today' ? 'Today\'s Check-outs' : 
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
            onClick={() => setShowRoomManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Rooms</span>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={view === 'rooms' ? "Search rooms..." : "Search bookings..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
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
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Dates</option>
              <option value="check-in-today">Check-in Today</option>
              <option value="check-out-today">Check-out Today</option>
              <option value="today">All Today's Activity</option>
            </select>
          )}
        </div>
      </div>

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
                  <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{room.type} room</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2} guests</span>
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
                    setSelectedRoom(room);
                    setShowNewBookingForm(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={room.status === 'maintenance' || room.status === 'out-of-order'}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Room</span>
                </button>
              </div>
            </div>
          ))}
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
                            <span className="text-indigo-600 font-medium">
                              {guest?.name.charAt(0) || 'G'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                            <div className="text-sm text-gray-500">{guest?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Room {room?.number}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCheckInForm(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check-in
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCheckOutForm(true);
                              }}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Check-out
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBillGenerator(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Bill
                          </button>
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

      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showNewBookingForm && <NewBookingForm />}
      {showCheckInForm && <CheckInForm />}
      {showCheckOutForm && <CheckOutForm />}
      {showBillGenerator && selectedBooking && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={guests.find(g => g.id === selectedBooking.guestId)!} 
          room={rooms.find(r => r.id === selectedBooking.roomId)!}
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
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
  Settings,
  Upload,
  FileText
} from 'lucide-react';
import { Room, Booking, Guest } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    dateFilter?: string;
    view?: string;
    action?: string;
    revenueFilter?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    bookings, 
    guests, 
    addBooking, 
    updateBookingStatus, 
    updateRoomStatus,
    addGuest,
    updateGuest
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingFormData, setBookingFormData] = useState({
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    source: 'direct',
    totalAmount: 0,
    currency: hotelSettings.baseCurrency,
    paymentStatus: 'pending'
  });
  const [newGuestFormData, setNewGuestFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nationality: '',
    idType: 'passport',
    idNumber: ''
  });
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [checkInFormData, setCheckInFormData] = useState({
    actualCheckInDate: new Date().toISOString().split('T')[0],
    actualCheckInTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    idProofUploaded: false,
    idProofUrl: '',
    notes: ''
  });
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter);
        if (filters.dateFilter.includes('check-in') || filters.dateFilter.includes('check-out')) {
          setView('bookings');
        }
      }
      if (filters.view) {
        setView(filters.view as any);
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

  // Filter rooms based on status filter
  const filteredRooms = statusFilter 
    ? rooms.filter(room => room.status === statusFilter)
    : rooms;

  // Filter bookings based on date filter
  const filteredBookings = (() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (dateFilter === 'today') {
      return bookings.filter(booking => 
        booking.checkIn === today || booking.checkOut === today
      );
    } else if (dateFilter === 'check-in-today') {
      return bookings.filter(booking => booking.checkIn === today);
    } else if (dateFilter === 'check-out-today') {
      return bookings.filter(booking => booking.checkOut === today);
    } else if (dateFilter === 'active') {
      return bookings.filter(booking => booking.status === 'checked-in');
    } else {
      return bookings;
    }
  })();

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
    setSelectedBooking(booking);
    const guest = guests.find(g => g.id === booking.guestId);
    if (guest) {
      setSelectedGuest(guest);
      setShowCheckInForm(true);
    } else {
      alert('Error: Guest information not found');
    }
  };

  const handleCompleteCheckIn = () => {
    if (!selectedBooking) return;
    
    // Update booking status
    updateBookingStatus(selectedBooking.id, 'checked-in');
    updateRoomStatus(selectedBooking.roomId, 'occupied');
    
    // Update guest with ID proof if provided
    if (selectedGuest && checkInFormData.idProofUrl) {
      const updatedIdDocuments = [
        ...(selectedGuest.idDocuments || []),
        {
          id: Date.now().toString(),
          type: newGuestFormData.idType as any,
          documentName: 'ID Document',
          fileUrl: checkInFormData.idProofUrl,
          fileType: 'image',
          fileName: idProofFile?.name || 'id-document.jpg',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'system',
          verified: true,
          verifiedBy: 'system',
          verifiedAt: new Date().toISOString()
        }
      ];
      
      updateGuest(selectedGuest.id, { idDocuments: updatedIdDocuments });
    }
    
    // Reset form and close
    setShowCheckInForm(false);
    setCheckInFormData({
      actualCheckInDate: new Date().toISOString().split('T')[0],
      actualCheckInTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
      idProofUploaded: false,
      idProofUrl: '',
      notes: ''
    });
    setIdProofFile(null);
    setSelectedBooking(null);
    setSelectedGuest(null);
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
      alert('Error: Guest or room information not found');
    }
  };

  const handleCheckoutComplete = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'checked-out');
      updateRoomStatus(selectedBooking.roomId, 'dirty');
      setSelectedBooking(null);
      setSelectedGuest(null);
      setSelectedRoom(null);
    }
  };

  const calculateTotalAmount = () => {
    const selectedRoomData = rooms.find(r => r.id === bookingFormData.roomId);
    if (!selectedRoomData || !bookingFormData.checkIn || !bookingFormData.checkOut) {
      return 0;
    }
    
    const checkInDate = new Date(bookingFormData.checkIn);
    const checkOutDate = new Date(bookingFormData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return selectedRoomData.rate * nights;
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!isNewGuest && !bookingFormData.guestId) {
        alert('Please select a guest or create a new one');
        return;
      }
      if (isNewGuest && (!newGuestFormData.name || !newGuestFormData.email || !newGuestFormData.phone)) {
        alert('Please fill in all required guest information');
        return;
      }
    } else if (currentStep === 2) {
      if (!bookingFormData.roomId || !bookingFormData.checkIn || !bookingFormData.checkOut) {
        alert('Please select a room and dates');
        return;
      }
      
      // Calculate total amount
      const totalAmount = calculateTotalAmount();
      setBookingFormData(prev => ({ ...prev, totalAmount }));
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCreateBooking = () => {
    // Create new guest if needed
    let guestId = bookingFormData.guestId;
    
    if (isNewGuest) {
      const newGuest = {
        name: newGuestFormData.name,
        email: newGuestFormData.email,
        phone: newGuestFormData.phone,
        address: newGuestFormData.address,
        nationality: newGuestFormData.nationality,
        identificationDetails: {
          type: newGuestFormData.idType as any,
          number: newGuestFormData.idNumber
        }
      };
      
      addGuest(newGuest);
      guestId = Date.now().toString(); // This is a simplification - in reality, we'd get the ID from the addGuest response
    }
    
    // Create booking
    addBooking({
      ...bookingFormData,
      guestId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });
    
    // Reset form and close
    setShowNewBookingForm(false);
    setCurrentStep(1);
    setBookingFormData({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct',
      totalAmount: 0,
      currency: hotelSettings.baseCurrency,
      paymentStatus: 'pending'
    });
    setNewGuestFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      idType: 'passport',
      idNumber: ''
    });
    setIsNewGuest(false);
  };

  const handleIdProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload to a server
    // For demo purposes, we'll create a data URL
    setIdProofFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCheckInFormData(prev => ({
        ...prev,
        idProofUploaded: true,
        idProofUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const NewBookingForm = () => {
    // Get available rooms (not occupied, out-of-order, or maintenance)
    const availableRooms = rooms.filter(room => 
      room.status !== 'occupied' && 
      room.status !== 'out-of-order' && 
      room.status !== 'maintenance'
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  <div className={`ml-2 ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <div className="text-sm font-medium">Step 1</div>
                    <div className="text-xs">Guest Information</div>
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Bed className="w-5 h-5" />
                  </div>
                  <div className={`ml-2 ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <div className="text-sm font-medium">Step 2</div>
                    <div className="text-xs">Room & Dates</div>
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className={`ml-2 ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <div className="text-sm font-medium">Step 3</div>
                    <div className="text-xs">Payment & Confirmation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Guest Information */}
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsNewGuest(false)}
                      className={`flex-1 py-3 px-4 rounded-lg ${
                        !isNewGuest 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Existing Guest
                    </button>
                    <button
                      onClick={() => setIsNewGuest(true)}
                      className={`flex-1 py-3 px-4 rounded-lg ${
                        isNewGuest 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      New Guest
                    </button>
                  </div>
                </div>

                {!isNewGuest ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
                    <select
                      value={bookingFormData.guestId}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, guestId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a guest</option>
                      {guests.map(guest => (
                        <option key={guest.id} value={guest.id}>
                          {guest.name} - {guest.email}
                        </option>
                      ))}
                    </select>
                    
                    {bookingFormData.guestId && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Guest Information</h4>
                        {(() => {
                          const guest = guests.find(g => g.id === bookingFormData.guestId);
                          if (!guest) return null;
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{guest.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{guest.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{guest.phone}</span>
                              </div>
                              {guest.address && (
                                <div className="flex items-center space-x-2">
                                  <Home className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{guest.address}</span>
                                </div>
                              )}
                              {guest.vipStatus && (
                                <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm inline-block">
                                  VIP Guest
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={newGuestFormData.name}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={newGuestFormData.email}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={newGuestFormData.phone}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={newGuestFormData.nationality}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, nationality: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={newGuestFormData.address}
                        onChange={(e) => setNewGuestFormData({ ...newGuestFormData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                        <select
                          value={newGuestFormData.idType}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, idType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="passport">Passport</option>
                          <option value="drivers_license">Driver's License</option>
                          <option value="national_id">National ID</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                        <input
                          type="text"
                          value={newGuestFormData.idNumber}
                          onChange={(e) => setNewGuestFormData({ ...newGuestFormData, idNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Room & Dates */}
            {currentStep === 2 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={bookingFormData.checkIn}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkIn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={bookingFormData.checkOut}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, checkOut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min={bookingFormData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                    <input
                      type="number"
                      value={bookingFormData.adults}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, adults: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                    <input
                      type="number"
                      value={bookingFormData.children}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, children: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => setBookingFormData({ ...bookingFormData, roomId: room.id })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          bookingFormData.roomId === room.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">Room {room.number}</h4>
                            <p className="text-sm text-gray-600 capitalize">{room.type}</p>
                          </div>
                          <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Max {room.maxOccupancy || 2} guests</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                              +{room.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={bookingFormData.specialRequests}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment & Confirmation */}
            {currentStep === 3 && (
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Guest</p>
                      <p className="font-medium text-gray-900">
                        {isNewGuest ? newGuestFormData.name : guests.find(g => g.id === bookingFormData.guestId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-medium text-gray-900">
                        Room {rooms.find(r => r.id === bookingFormData.roomId)?.number} ({rooms.find(r => r.id === bookingFormData.roomId)?.type})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-medium text-gray-900">{bookingFormData.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-medium text-gray-900">{bookingFormData.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-medium text-gray-900">
                        {bookingFormData.adults} Adult{bookingFormData.adults !== 1 ? 's' : ''}
                        {bookingFormData.children > 0 ? `, ${bookingFormData.children} Child${bookingFormData.children !== 1 ? 'ren' : ''}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rate per Night</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(rooms.find(r => r.id === bookingFormData.roomId)?.rate || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(calculateTotalAmount())}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={bookingFormData.paymentStatus}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial Payment</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
                  <select
                    value={bookingFormData.source}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, source: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="direct">Direct</option>
                    <option value="booking.com">Booking.com</option>
                    <option value="expedia">Expedia</option>
                    <option value="phone">Phone</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateBooking}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckInForm = () => {
    if (!selectedBooking || !selectedGuest) return null;
    
    const room = rooms.find(r => r.id === selectedBooking.roomId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest Check-in</h3>
              <button
                onClick={() => setShowCheckInForm(false)}
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
                  <p className="font-semibold text-blue-900">{selectedGuest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room Number</p>
                  <p className="font-semibold text-blue-900">Room {room?.number}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-in Date</p>
                  <p className="font-semibold text-blue-900">{selectedBooking.checkIn}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-out Date</p>
                  <p className="font-semibold text-blue-900">{selectedBooking.checkOut}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Check-in Date</label>
                  <input
                    type="date"
                    value={checkInFormData.actualCheckInDate}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, actualCheckInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Check-in Time</label>
                  <input
                    type="time"
                    value={checkInFormData.actualCheckInTime}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, actualCheckInTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Proof</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {checkInFormData.idProofUploaded ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <img 
                          src={checkInFormData.idProofUrl} 
                          alt="ID Proof" 
                          className="max-h-40 rounded-lg border border-gray-200"
                        />
                      </div>
                      <p className="text-sm text-green-600 font-medium">ID proof uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => setCheckInFormData({ ...checkInFormData, idProofUploaded: false, idProofUrl: '' })}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Upload guest ID proof (passport, driver's license, etc.)</p>
                      <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload ID</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdProofUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Notes</label>
                <textarea
                  value={checkInFormData.notes}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Any special notes or requests during check-in"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckInForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteCheckIn}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Check-in
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
                {dateFilter === 'today' ? "Today's Activity" : 
                 dateFilter === 'check-in-today' ? "Today's Check-ins" : 
                 dateFilter === 'check-out-today' ? "Today's Check-outs" : 
                 dateFilter === 'active' ? "Active Bookings" : dateFilter}
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
            onClick={() => setShowNewBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => setShowRoomManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
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
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2} guests</span>
                  </div>
                  {room.floor && (
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Floor {room.floor}</span>
                    </div>
                  )}
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
                    setShowNewBookingForm(true);
                    setBookingFormData(prev => ({ ...prev, roomId: room.id }));
                    setCurrentStep(2);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))}
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
                        <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                        <div className="text-sm text-gray-500">{guest?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
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
                              onClick={() => handleCheckIn(booking)}
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
                          <button
                            onClick={() => {
                              // View booking details
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
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
      {showBillGenerator && selectedBooking && selectedGuest && selectedRoom && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={selectedGuest} 
          room={selectedRoom} 
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={handleCheckoutComplete}
        />
      )}
    </div>
  );
}
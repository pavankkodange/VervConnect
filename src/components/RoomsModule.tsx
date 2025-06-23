import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
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
  CreditCard, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  FileText, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Home, 
  Maximize, 
  Coffee, 
  Wifi, 
  Tv, 
  Wind, 
  Droplets, 
  Utensils, 
  Save,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Receipt,
  DollarSign,
  UserCheck,
  UserX,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Info,
  Settings
} from 'lucide-react';
import { Room, Booking, Guest, RoomCharge } from '../types';

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
    addBooking, 
    updateBookingStatus, 
    addRoomCharge, 
    addGuest, 
    updateGuest 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { user } = useAuth();
  const { generateInvoiceFromBooking } = useFinancial();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    id: string;
    type: string;
    name: string;
    url: string;
  }[]>([]);

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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

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

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'clean': return <CheckCircle className="w-4 h-4" />;
      case 'dirty': return <AlertCircle className="w-4 h-4" />;
      case 'occupied': return <User className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'out-of-order': return <X className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
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

  // Check if a room is already booked for the given date range
  const isRoomBooked = (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string): boolean => {
    return bookings.some(booking => {
      // Skip the current booking when checking for conflicts (for editing)
      if (excludeBookingId && booking.id === excludeBookingId) return false;
      
      // Skip cancelled bookings
      if (booking.status === 'cancelled' || booking.status === 'checked-out') return false;
      
      // Check if it's the same room
      if (booking.roomId === roomId) {
        // Check if date ranges overlap
        const bookingCheckIn = new Date(booking.checkIn);
        const bookingCheckOut = new Date(booking.checkOut);
        const newCheckIn = new Date(checkIn);
        const newCheckOut = new Date(checkOut);
        
        // Overlap occurs if:
        // - New check-in is between existing booking's check-in and check-out
        // - New check-out is between existing booking's check-in and check-out
        // - New booking completely encompasses existing booking
        if (
          (newCheckIn >= bookingCheckIn && newCheckIn < bookingCheckOut) ||
          (newCheckOut > bookingCheckIn && newCheckOut <= bookingCheckOut) ||
          (newCheckIn <= bookingCheckIn && newCheckOut >= bookingCheckOut)
        ) {
          return true;
        }
      }
      return false;
    });
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      roomId: selectedRoom?.id || '',
      guestId: '',
      checkIn: today,
      checkOut: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as Booking['source'],
      newGuest: true,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      totalAmount: 0
    });

    const [bookingError, setBookingError] = useState<string>('');
    const [nights, setNights] = useState(1);

    // Calculate nights when check-in or check-out changes
    useEffect(() => {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? diffDays : 1);
    }, [formData.checkIn, formData.checkOut]);

    // Calculate total amount when room or nights change
    useEffect(() => {
      if (formData.roomId) {
        const room = rooms.find(r => r.id === formData.roomId);
        if (room) {
          setFormData(prev => ({
            ...prev,
            totalAmount: room.rate * nights
          }));
        }
      }
    }, [formData.roomId, nights, rooms]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Check if room is already booked for the selected dates
      if (isRoomBooked(formData.roomId, formData.checkIn, formData.checkOut)) {
        setBookingError('This room is already booked for the selected dates.');
        return;
      }
      
      // Create new guest if needed
      let guestId = formData.guestId;
      if (formData.newGuest) {
        const newGuest: Omit<Guest, 'id' | 'bookingHistory' | 'totalStays'> = {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone
        };
        addGuest(newGuest);
        // In a real app, we'd get the ID from the API response
        // For demo, we'll use a timestamp as a unique ID
        guestId = Date.now().toString();
      }
      
      // Create booking
      addBooking({
        roomId: formData.roomId,
        guestId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests,
        source: formData.source,
        totalAmount: formData.totalAmount,
        currency: hotelSettings.baseCurrency,
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Update room status
      updateRoomStatus(formData.roomId, 'occupied');
      
      setShowBookingForm(false);
      setSelectedRoom(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Booking</h3>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedRoom(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.filter(r => r.status === 'clean').map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Guest</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">New Guest</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, newGuest: !formData.newGuest })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        formData.newGuest ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.newGuest ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-500">Existing Guest</span>
                  </div>
                </div>

                {formData.newGuest ? (
                  <div className="space-y-4">
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
                ) : (
                  <select
                    value={formData.guestId}
                    onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required={!formData.newGuest}
                  >
                    <option value="">Select a guest</option>
                    {guests.map((guest) => (
                      <option key={guest.id} value={guest.id}>{guest.name} - {guest.email}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min={today}
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
                    min={formData.checkIn}
                    required
                  />
                </div>
              </div>

              {/* Guests */}
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

              {/* Booking Source */}
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

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Rate:</span>
                    <span className="font-medium">
                      {formData.roomId ? formatCurrency(rooms.find(r => r.id === formData.roomId)?.rate || 0) : '-'} / night
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CheckInForm = () => {
    const [formData, setFormData] = useState({
      paymentMethod: 'card' as 'card' | 'cash' | 'bank-transfer',
      depositAmount: selectedBooking ? selectedBooking.totalAmount * 0.5 : 0,
      idType: 'passport' as 'passport' | 'drivers_license' | 'national_id' | 'visa',
      idNumber: '',
      idExpiryDate: '',
      specialRequests: selectedBooking?.specialRequests || '',
      additionalNotes: ''
    });

    const [uploadingId, setUploadingId] = useState(false);
    const [idDocuments, setIdDocuments] = useState<Array<{
      id: string;
      type: string;
      name: string;
      url: string;
    }>>([]);

    // Get guest details
    const guest = selectedBooking ? guests.find(g => g.id === selectedBooking.guestId) : null;
    const room = selectedBooking ? rooms.find(r => r.id === selectedBooking.roomId) : null;

    // Pre-fill ID information if available
    useEffect(() => {
      if (guest?.identificationDetails) {
        setFormData(prev => ({
          ...prev,
          idType: guest.identificationDetails?.type || 'passport',
          idNumber: guest.identificationDetails?.number || '',
          idExpiryDate: guest.identificationDetails?.expiryDate || ''
        }));
      }
      
      // Pre-fill ID documents if available
      if (guest?.idDocuments && guest.idDocuments.length > 0) {
        const docs = guest.idDocuments.map(doc => ({
          id: doc.id,
          type: doc.type,
          name: doc.documentName,
          url: doc.fileUrl
        }));
        setIdDocuments(docs);
      }
    }, [guest]);

    const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingId(true);
      try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, this would upload to a server and get a URL back
        // For demo purposes, we'll create a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const newDoc = {
            id: Date.now().toString(),
            type: formData.idType,
            name: file.name,
            url: dataUrl
          };
          setIdDocuments(prev => [...prev, newDoc]);
          setUploadingId(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadingId(false);
      }
    };

    const removeDocument = (docId: string) => {
      setIdDocuments(prev => prev.filter(doc => doc.id !== docId));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedBooking) return;
      
      // Update booking status
      updateBookingStatus(selectedBooking.id, 'checked-in');
      
      // Update room status
      updateRoomStatus(selectedBooking.roomId, 'occupied');
      
      // Add deposit charge if applicable
      if (formData.depositAmount > 0) {
        addRoomCharge(selectedBooking.id, {
          description: 'Security Deposit',
          amount: formData.depositAmount,
          currency: hotelSettings.baseCurrency,
          date: today,
          category: 'other'
        });
      }
      
      // Update guest with ID information
      if (guest) {
        const updatedGuest: Partial<Guest> = {
          identificationDetails: {
            type: formData.idType,
            number: formData.idNumber,
            issuingCountry: guest.identificationDetails?.issuingCountry || '',
            expiryDate: formData.idExpiryDate
          },
          specialRequests: formData.specialRequests ? formData.specialRequests.split(',') : undefined
        };
        
        // Add ID documents if any were uploaded
        if (idDocuments.length > 0) {
          const newIdDocs = idDocuments.map(doc => ({
            id: doc.id,
            type: doc.type as any,
            documentName: `${formData.idType.charAt(0).toUpperCase() + formData.idType.slice(1)}`,
            fileUrl: doc.url,
            fileType: doc.url.startsWith('data:image') ? 'image' : 'pdf',
            fileName: doc.name,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.id || 'system',
            verified: false,
            expiryDate: formData.idExpiryDate
          }));
          
          updatedGuest.idDocuments = [
            ...(guest.idDocuments || []),
            ...newIdDocs
          ];
        }
        
        updateGuest(guest.id, updatedGuest);
      }
      
      setShowCheckInForm(false);
      setSelectedBooking(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-blue-900">Booking Information</h4>
                  <p className="text-sm text-blue-700">Confirmation #{selectedBooking?.id.slice(-6)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Total Amount</p>
                  <p className="text-lg font-bold text-blue-900">{selectedBooking ? formatCurrency(selectedBooking.totalAmount) : '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Guest</p>
                  <p className="font-semibold text-blue-900">{guest?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room</p>
                  <p className="font-semibold text-blue-900">Room {room?.number || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-in</p>
                  <p className="font-semibold text-blue-900">{selectedBooking?.checkIn || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-out</p>
                  <p className="font-semibold text-blue-900">{selectedBooking?.checkOut || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Verification */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">ID Verification</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                    <select
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID</option>
                      <option value="visa">Visa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.idExpiryDate}
                    onChange={(e) => setFormData({ ...formData, idExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                {/* ID Document Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingId ? 'Uploading...' : 'Upload Document'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleIdUpload}
                        className="hidden"
                        disabled={uploadingId}
                      />
                    </label>
                    {uploadingId && (
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-sm">Uploading document...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Document Preview */}
                {idDocuments.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Uploaded Documents</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {idDocuments.map((doc) => (
                        <div key={doc.id} className="relative group">
                          {doc.url.startsWith('data:image') ? (
                            <img
                              src={doc.url}
                              alt={doc.name}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeDocument(doc.id)}
                              className="p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{doc.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Existing Documents */}
                {guest?.idDocuments && guest.idDocuments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Existing Documents</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {guest.idDocuments.map((doc) => (
                        <div key={doc.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{doc.documentName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <p>Type: {doc.type}</p>
                            {doc.expiryDate && <p>Expires: {doc.expiryDate}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank-transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit ({hotelSettings.baseCurrency})
                    </label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
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
      </div>
    );
  };

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: selectedGuest?.name || '',
      email: selectedGuest?.email || '',
      phone: selectedGuest?.phone || '',
      title: selectedGuest?.title || '',
      company: selectedGuest?.company || '',
      nationality: selectedGuest?.nationality || '',
      address: selectedGuest?.address || '',
      dateOfBirth: selectedGuest?.dateOfBirth || '',
      vipStatus: selectedGuest?.vipStatus || false,
      vipTier: selectedGuest?.vipTier || 'gold',
      specialRequests: selectedGuest?.specialRequests?.join(', ') || '',
      dietaryRestrictions: selectedGuest?.dietaryRestrictions?.join(', ') || '',
      emergencyContactName: selectedGuest?.emergencyContactDetails?.name || '',
      emergencyContactRelationship: selectedGuest?.emergencyContactDetails?.relationship || '',
      emergencyContactPhone: selectedGuest?.emergencyContactDetails?.phone || '',
      emergencyContactEmail: selectedGuest?.emergencyContactDetails?.email || '',
      idType: selectedGuest?.identificationDetails?.type || 'passport',
      idNumber: selectedGuest?.identificationDetails?.number || '',
      idIssuingCountry: selectedGuest?.identificationDetails?.issuingCountry || '',
      idExpiryDate: selectedGuest?.identificationDetails?.expiryDate || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const guestData: Partial<Guest> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        title: formData.title || undefined,
        company: formData.company || undefined,
        nationality: formData.nationality || undefined,
        address: formData.address || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        vipStatus: formData.vipStatus,
        vipTier: formData.vipStatus ? (formData.vipTier as any) : undefined,
        specialRequests: formData.specialRequests ? formData.specialRequests.split(',').map(s => s.trim()) : undefined,
        dietaryRestrictions: formData.dietaryRestrictions ? formData.dietaryRestrictions.split(',').map(s => s.trim()) : undefined,
        emergencyContactDetails: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
          email: formData.emergencyContactEmail || undefined
        },
        identificationDetails: {
          type: formData.idType as any,
          number: formData.idNumber,
          issuingCountry: formData.idIssuingCountry || undefined,
          expiryDate: formData.idExpiryDate || undefined
        }
      };
      
      if (selectedGuest) {
        updateGuest(selectedGuest.id, guestData);
      } else {
        addGuest(guestData as any);
      }
      
      setShowGuestForm(false);
      setSelectedGuest(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedGuest ? 'Edit Guest' : 'New Guest'}</h3>
              <button
                onClick={() => {
                  setShowGuestForm(false);
                  setSelectedGuest(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select title</option>
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
                
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Identification */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Identification Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                    <select
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID</option>
                      <option value="visa">Visa</option>
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
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Country</label>
                    <input
                      type="text"
                      value={formData.idIssuingCountry}
                      onChange={(e) => setFormData({ ...formData, idIssuingCountry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.idExpiryDate}
                      onChange={(e) => setFormData({ ...formData, idExpiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.emergencyContactEmail}
                      onChange={(e) => setFormData({ ...formData, emergencyContactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    placeholder="Separate multiple requests with commas"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                  <textarea
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    placeholder="Separate multiple restrictions with commas"
                  />
                </div>
                
                <div className="mt-4">
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
                  <div className="mt-4">
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

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestForm(false);
                    setSelectedGuest(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {selectedGuest ? 'Update Guest' : 'Create Guest'}
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
      description: '',
      amount: '',
      category: 'other' as RoomCharge['category']
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedBooking) return;
      
      addRoomCharge(selectedBooking.id, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: hotelSettings.baseCurrency,
        date: today,
        category: formData.category
      });
      
      setShowChargeForm(false);
      setFormData({ description: '', amount: '', category: 'other' });
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Room Service, Minibar, etc."
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as RoomCharge['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="room">Room</option>
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

  const GuestDetails = () => {
    if (!selectedGuest) return null;

    const bookingHistory = bookings.filter(b => b.guestId === selectedGuest.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedGuest.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-500">
                    {selectedGuest.vipStatus && (
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{selectedGuest.vipTier || 'VIP'}</span>
                      </div>
                    )}
                    <span>•</span>
                    <span className="text-sm">{selectedGuest.totalStays} stays</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedGuest(selectedGuest);
                    setShowGuestForm(true);
                    setShowGuestDetails(false);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowGuestDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{selectedGuest.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{selectedGuest.phone}</p>
                    </div>
                  </div>
                  {selectedGuest.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">{selectedGuest.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedGuest.company && (
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Company</p>
                        <p className="text-sm text-gray-600">{selectedGuest.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  {selectedGuest.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date of Birth</span>
                      <span className="text-sm font-medium text-gray-900">{selectedGuest.dateOfBirth}</span>
                    </div>
                  )}
                  {selectedGuest.nationality && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nationality</span>
                      <span className="text-sm font-medium text-gray-900">{selectedGuest.nationality}</span>
                    </div>
                  )}
                  {selectedGuest.identificationDetails && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ID Type</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedGuest.identificationDetails.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ID Number</span>
                        <span className="text-sm font-medium text-gray-900">{selectedGuest.identificationDetails.number}</span>
                      </div>
                      {selectedGuest.identificationDetails.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID Expiry</span>
                          <span className="text-sm font-medium text-gray-900">{selectedGuest.identificationDetails.expiryDate}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
                <div className="space-y-3">
                  {selectedGuest.specialRequests && selectedGuest.specialRequests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Special Requests</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuest.specialRequests.map((request, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {request}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedGuest.dietaryRestrictions && selectedGuest.dietaryRestrictions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuest.dietaryRestrictions.map((restriction, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedGuest.roomPreferences && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Room Preferences</p>
                      <div className="space-y-1">
                        {selectedGuest.roomPreferences.smokingRoom !== undefined && (
                          <p className="text-sm text-gray-600">
                            Smoking Room: {selectedGuest.roomPreferences.smokingRoom ? 'Yes' : 'No'}
                          </p>
                        )}
                        {selectedGuest.roomPreferences.floor && (
                          <p className="text-sm text-gray-600">
                            Floor Preference: {selectedGuest.roomPreferences.floor}
                          </p>
                        )}
                        {selectedGuest.roomPreferences.bedType && (
                          <p className="text-sm text-gray-600">
                            Bed Type: {selectedGuest.roomPreferences.bedType}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ID Documents */}
            {selectedGuest.idDocuments && selectedGuest.idDocuments.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">ID Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedGuest.idDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {doc.fileType === 'image' ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.documentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{doc.documentName}</h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Type: {doc.type.replace('_', ' ')}</p>
                          {doc.expiryDate && <p>Expires: {doc.expiryDate}</p>}
                          <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking History */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h4>
              {bookingHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookingHistory.map((booking) => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">Room {room?.number}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.checkIn} to {booking.checkOut}</div>
                              <div className="text-xs text-gray-500">
                                {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                                {booking.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(booking.totalAmount, booking.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No booking history found</p>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {selectedGuest.emergencyContactDetails && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Name</p>
                      <p className="text-sm text-gray-600">{selectedGuest.emergencyContactDetails.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{selectedGuest.emergencyContactDetails.phone}</p>
                    </div>
                  </div>
                  {selectedGuest.emergencyContactDetails.relationship && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Relationship</p>
                        <p className="text-sm text-gray-600">{selectedGuest.emergencyContactDetails.relationship}</p>
                      </div>
                    </div>
                  )}
                  {selectedGuest.emergencyContactDetails.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{selectedGuest.emergencyContactDetails.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RoomDetails = () => {
    if (!selectedRoom) return null;

    // Get current booking for this room if any
    const currentBooking = bookings.find(b => 
      b.roomId === selectedRoom.id && 
      (b.status === 'confirmed' || b.status === 'checked-in')
    );
    
    const guest = currentBooking ? guests.find(g => g.id === currentBooking.guestId) : null;

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
              onClick={() => setShowRoomDetails(false)}
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
                {currentBooking ? (
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Current Booking</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-900">{guest?.name || 'Unknown Guest'}</p>
                          {guest && (
                            <button
                              onClick={() => {
                                setSelectedGuest(guest);
                                setShowGuestDetails(true);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Guest Details
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-900">
                            {currentBooking.checkIn} to {currentBooking.checkOut}
                          </p>
                          <p className="text-sm text-blue-700">
                            {Math.ceil((new Date(currentBooking.checkOut).getTime() - new Date(currentBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-900">
                            {formatCurrency(currentBooking.totalAmount, currentBooking.currency)}
                          </p>
                          <p className="text-sm text-blue-700 capitalize">
                            Payment: {currentBooking.paymentStatus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-900 capitalize">
                            {currentBooking.status.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      {currentBooking.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(currentBooking);
                            setShowCheckInForm(true);
                            setShowRoomDetails(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Check In</span>
                        </button>
                      )}
                      {currentBooking.status === 'checked-in' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBooking(currentBooking);
                              setShowChargeForm(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Add Charge</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(currentBooking);
                              setShowBillGenerator(true);
                              setShowRoomDetails(false);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Check Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">Room Available</h3>
                    <p className="text-green-700 mb-4">This room is currently available for booking.</p>
                    <button
                      onClick={() => {
                        setSelectedRoom(selectedRoom);
                        setShowBookingForm(true);
                        setShowRoomDetails(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book This Room</span>
                    </button>
                  </div>
                )}

                {selectedRoom.isVipRoom && (
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-xl font-semibold text-yellow-900">VIP Room</h3>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-800">VIP Rate:</span>
                        <span className="font-medium text-yellow-900">{formatCurrency(selectedRoom.vipRate || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-800">Minimum Stay:</span>
                        <span className="font-medium text-yellow-900">{selectedRoom.vipMinimumStay || 1} night(s)</span>
                      </div>
                    </div>

                    {selectedRoom.vipAmenities && selectedRoom.vipAmenities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md font-semibold text-yellow-900 mb-2">VIP Amenities</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRoom.vipAmenities.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2 p-2 bg-yellow-100 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-yellow-800">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedRoom.photos.length > 1 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
    );
  };

  const BookingDetails = () => {
    if (!selectedBooking) return null;

    const room = rooms.find(r => r.id === selectedBooking.roomId);
    const guest = guests.find(g => g.id === selectedBooking.guestId);
    
    const checkInDate = new Date(selectedBooking.checkIn);
    const checkOutDate = new Date(selectedBooking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                <p className="text-gray-600">Confirmation #{selectedBooking.id.slice(-6)}</p>
              </div>
              <button
                onClick={() => setShowBookingDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.checkIn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.checkOut}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium text-gray-900">{nights}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium text-gray-900">
                      {selectedBooking.adults} Adult{selectedBooking.adults !== 1 ? 's' : ''}
                      {selectedBooking.children > 0 ? `, ${selectedBooking.children} Child${selectedBooking.children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedBooking.source.replace('.', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedBooking.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                {guest ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Name</p>
                        <p className="text-sm text-gray-600">{guest.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{guest.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{guest.phone}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedGuest(guest);
                          setShowGuestDetails(true);
                          setShowBookingDetails(false);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Full Guest Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Guest information not available</p>
                  </div>
                )}
              </div>

              {/* Room Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h4>
                {room ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Room Number</p>
                        <p className="text-sm text-gray-600">{room.number}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Bed className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Type</p>
                        <p className="text-sm text-gray-600 capitalize">{room.type}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Rate</p>
                        <p className="text-sm text-gray-600">{formatCurrency(room.rate)} per night</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowRoomDetails(true);
                          setShowBookingDetails(false);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Room Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Room information not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charges */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Charges</h4>
                {selectedBooking.status === 'checked-in' && (
                  <button
                    onClick={() => {
                      setShowChargeForm(true);
                    }}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Charge</span>
                  </button>
                )}
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {charge.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {charge.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {charge.category.replace('-', ' ')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(charge.amount, charge.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(
                            selectedBooking.charges.reduce((sum, charge) => sum + charge.amount, 0),
                            selectedBooking.currency
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No charges yet</p>
                </div>
              )}
            </div>

            {/* Special Requests */}
            {selectedBooking.specialRequests && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h4>
                <p className="text-gray-700">{selectedBooking.specialRequests}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => {
                    setShowCheckInForm(true);
                    setShowBookingDetails(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Check In</span>
                </button>
              )}
              
              {selectedBooking.status === 'checked-in' && (
                <>
                  <button
                    onClick={() => {
                      setShowChargeForm(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Add Charge</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowBillGenerator(true);
                      setShowBookingDetails(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                </>
              )}
              
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'checked-in') && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this booking?')) {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      updateRoomStatus(selectedBooking.roomId, 'clean');
                      setShowBookingDetails(false);
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCheckout = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    if (!guest || !room) return;
    
    setSelectedBooking(booking);
    setShowBillGenerator(true);
  };

  const handleCheckoutComplete = () => {
    if (!selectedBooking) return;
    
    // Generate invoice
    const guest = guests.find(g => g.id === selectedBooking.guestId);
    if (guest) {
      generateInvoiceFromBooking(selectedBooking.id, selectedBooking, guest);
    }
    
    setShowBillGenerator(false);
    setSelectedBooking(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Bookings</h1>
          <p className="text-gray-600 mt-2">Manage rooms, bookings, and guest check-ins</p>
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
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Dates</option>
              <option value="check-in-today">Check-ins Today</option>
              <option value="check-out-today">Check-outs Today</option>
              <option value="today">Today's Activity</option>
            </select>
          )}
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {view === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const currentBooking = bookings.find(b => 
              b.roomId === room.id && 
              (b.status === 'confirmed' || b.status === 'checked-in')
            );
            
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
                  
                  {currentBooking && guest ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-900">{guest.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Calendar className="w-4 h-4" />
                        <span>{currentBooking.checkIn} to {currentBooking.checkOut}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-900">Available for booking</span>
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
                    
                    {room.status === 'clean' && !currentBooking && (
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowBookingForm(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Book</span>
                      </button>
                    )}
                    
                    {currentBooking && currentBooking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(currentBooking);
                          setShowCheckInForm(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Check In</span>
                      </button>
                    )}
                    
                    {currentBooking && currentBooking.status === 'checked-in' &&  (
                      <button
                        onClick={() => {
                          setSelectedBooking(currentBooking);
                          setShowBillGenerator(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Check Out</span>
                      </button>
                    )}
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
                  ? "No rooms have been added yet" 
                  : "No rooms match your current filters"}
              </p>
              <button
                onClick={() => setShowRoomManagement(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Manage Rooms</span>
              </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const room = rooms.find(r => r.id === booking.roomId);
                  const isExpanded = expandedBookingId === booking.id;
                  
                  return (
                    <React.Fragment key={booking.id}>
                      <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {guest?.name.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="ml-4">
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
                          <div className="text-sm text-gray-900">{booking.checkIn} to {booking.checkOut}</div>
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
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setExpandedBookingId(isExpanded ? null : booking.id);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            
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
                                  setShowCheckInForm(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Check In
                              </button>
                            )}
                            
                            {booking.status === 'checked-in' && (
                              <button
                                onClick={() => handleCheckout(booking.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Check Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Guest Details */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span>Guest Details</span>
                                </h5>
                                {guest ? (
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-500">Phone:</span> {guest.phone}</p>
                                    {guest.nationality && <p><span className="text-gray-500">Nationality:</span> {guest.nationality}</p>}
                                    {guest.vipStatus && (
                                      <p className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-yellow-700 font-medium capitalize">{guest.vipTier || 'VIP'} Guest</span>
                                      </p>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedGuest(guest);
                                        setShowGuestDetails(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-2"
                                    >
                                      View Full Profile
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Guest information not available</p>
                                )}
                              </div>
                              
                              {/* Room Details */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <Bed className="w-4 h-4 text-gray-500" />
                                  <span>Room Details</span>
                                </h5>
                                {room ? (
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-500">Type:</span> <span className="capitalize">{room.type}</span></p>
                                    <p><span className="text-gray-500">Rate:</span> {formatCurrency(room.rate)}/night</p>
                                    <p><span className="text-gray-500">Max Occupancy:</span> {room.maxOccupancy} guests</p>
                                    <button
                                      onClick={() => {
                                        setSelectedRoom(room);
                                        setShowRoomDetails(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-2"
                                    >
                                      View Room Details
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Room information not available</p>
                                )}
                              </div>
                              
                              {/* Booking Details */}
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>Booking Details</span>
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-gray-500">Confirmation:</span> #{booking.id.slice(-6)}</p>
                                  <p><span className="text-gray-500">Source:</span> <span className="capitalize">{booking.source.replace('.', ' ')}</span></p>
                                  <p><span className="text-gray-500">Payment:</span> <span className="capitalize">{booking.paymentStatus}</span></p>
                                  <p><span className="text-gray-500">Created:</span> {new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              {/* Charges Summary */}
                              {booking.charges.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-3">
                                  <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Receipt className="w-4 h-4 text-gray-500" />
                                    <span>Charges Summary</span>
                                  </h5>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {booking.charges.map((charge) => (
                                          <tr key={charge.id}>
                                            <td className="px-3 py-2">{charge.description}</td>
                                            <td className="px-3 py-2">{charge.date}</td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(charge.amount, charge.currency)}</td>
                                          </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-medium">
                                          <td colSpan={2} className="px-3 py-2 text-right">Total:</td>
                                          <td className="px-3 py-2 text-right">
                                            {formatCurrency(
                                              booking.charges.reduce((sum, charge) => sum + charge.amount, 0),
                                              booking.currency
                                            )}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              
                              {/* Special Requests */}
                              {booking.specialRequests && (
                                <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-3">
                                  <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-gray-500" />
                                    <span>Special Requests</span>
                                  </h5>
                                  <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? "No bookings have been made yet" 
                  : "No bookings match your current filters"}
              </p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Booking</span>
              </button>
            </div>
          )}
        </div>
      )}

      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBookingForm && <BookingForm />}
      {showCheckInForm && <CheckInForm />}
      {showGuestForm && <GuestForm />}
      {showGuestDetails && <GuestDetails />}
      {showRoomDetails && <RoomDetails />}
      {showBookingDetails && <BookingDetails />}
      {showChargeForm && <ChargeForm />}
      
      {/* Bill Generator - Make sure it's rendered on top of everything else */}
      {showBillGenerator && selectedBooking && (
        <div className="fixed inset-0 z-[60]">
          <BillGenerator
            booking={selectedBooking}
            guest={guests.find(g => g.id === selectedBooking.guestId)!}
            room={rooms.find(r => r.id === selectedBooking.roomId)!}
            onClose={() => setShowBillGenerator(false)}
            onCheckoutComplete={handleCheckoutComplete}
          />
        </div>
      )}
    </div>
  );
}
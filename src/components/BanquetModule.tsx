import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BanquetHallManagement } from './BanquetHallManagement';
import { 
  Users, 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Mail, 
  Phone,
  Search,
  Filter,
  Eye,
  DollarSign,
  X,
  Star,
  Utensils,
  Music,
  Camera,
  Receipt
} from 'lucide-react';
import { BanquetHall, BanquetBooking } from '../types';

interface BanquetModuleProps {
  filters?: {
    dateFilter?: string;
    action?: string;
  };
}

export function BanquetModule({ filters }: BanquetModuleProps) {
  const { 
    banquetHalls, 
    banquetBookings, 
    addBanquetBooking,
    bookings,
    guests,
    addRoomCharge
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'halls' | 'bookings'>('halls');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showHallManagement, setShowHallManagement] = useState(false);
  const [selectedHall, setSelectedHall] = useState<BanquetHall | null>(null);
  const [showHallDetails, setShowHallDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [bookingError, setBookingError] = useState<string>('');

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.dateFilter === 'today') {
        setDateFilter('today');
        setView('bookings');
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
    }
  }, [filters]);

  const today = new Date().toISOString().split('T')[0];

  const getStatusColor = (status: BanquetBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'stage': return <Star className="w-4 h-4" />;
      case 'audio system': return <Music className="w-4 h-4" />;
      case 'catering': return <Utensils className="w-4 h-4" />;
      case 'photography': return <Camera className="w-4 h-4" />;
      default: return <span className="w-4 h-4 flex items-center justify-center text-xs">•</span>;
    }
  };

  // Check if a hall is already booked for the given date and time
  const isHallBooked = (hallId: string, date: string, startTime: string, endTime: string): boolean => {
    return banquetBookings.some(booking => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled') return false;
      
      // Check if it's the same hall and date
      if (booking.hallId === hallId && booking.date === date) {
        // Check if time periods overlap
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        
        // Overlap occurs if:
        // - New start time is between existing booking's start and end times
        // - New end time is between existing booking's start and end times
        // - New booking completely encompasses existing booking
        if (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        ) {
          return true;
        }
      }
      return false;
    });
  };

  // Filter bookings based on date filter
  const filteredBookings = dateFilter === 'today' 
    ? banquetBookings.filter(booking => booking.date === today)
    : banquetBookings;

  const ChargeForm = () => {
    const [formData, setFormData] = useState({
      bookingId: '',
      description: '',
      amount: '',
      eventName: ''
    });

    const activeBookings = bookings.filter(b => b.status === 'checked-in');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addRoomCharge(formData.bookingId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: hotelSettings.baseCurrency,
        date: new Date().toISOString().split('T')[0],
        category: 'other'
      });
      
      setShowChargeForm(false);
      setFormData({ bookingId: '', description: '', amount: '', eventName: '' });
      alert('Banquet charge posted to room successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Post Banquet Charge</h3>
            <button
              onClick={() => setShowChargeForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guest Room</label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a room</option>
                {activeBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const roomNumber = booking.roomId;
                  return (
                    <option key={booking.id} value={booking.id}>
                      Room {roomNumber} - {guest?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event/Service</label>
              <select
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select service type</option>
                <option value="banquet-hall">Banquet Hall Rental</option>
                <option value="catering">Catering Services</option>
                <option value="decoration">Event Decoration</option>
                <option value="av-equipment">A/V Equipment</option>
                <option value="photography">Photography Services</option>
                <option value="other">Other Event Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Wedding Reception, Corporate Event Setup"
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
                Post Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const HallDetailsModal = () => {
    if (!selectedHall) return null;

    const upcomingEvents = banquetBookings.filter(b => 
      b.hallId === selectedHall.id && new Date(b.date) >= new Date()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="relative">
            {selectedHall.photos.length > 0 && (
              <img
                src={selectedHall.photos[0]}
                alt={selectedHall.name}
                className="w-full h-80 object-cover rounded-t-2xl"
              />
            )}
            <button
              onClick={() => {
                setShowHallDetails(false);
                setSelectedHall(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                Available
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedHall.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Up to {selectedHall.capacity} guests</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedHall.rate)}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedHall.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity)}
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Weddings</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Corporate Events</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Conferences</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Celebrations</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.eventName}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                            {event.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{upcomingEvents.length - 3} more events
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => {
                  setShowHallDetails(false);
                  setShowBookingForm(true);
                }}
                className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
              >
                Book This Hall
              </button>
              <button
                onClick={() => setShowChargeForm(true)}
                className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Post Charge to Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      hallId: selectedHall?.id || '',
      eventName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      date: '',
      startTime: '',
      endTime: '',
      attendees: '',
      specialRequirements: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const hall = banquetHalls.find(h => h.id === formData.hallId);
      
      // Check if the hall is already booked for the selected date and time
      if (isHallBooked(formData.hallId, formData.date, formData.startTime, formData.endTime)) {
        setBookingError('This hall is already booked for the selected date and time. Please choose a different time or date.');
        return;
      }
      
      if (hall) {
        const hours = Math.ceil(
          (new Date(`1970-01-01T${formData.endTime}`).getTime() - 
           new Date(`1970-01-01T${formData.startTime}`).getTime()) / (1000 * 60 * 60)
        );
        
        addBanquetBooking({
          hallId: formData.hallId,
          eventName: formData.eventName,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: parseInt(formData.attendees),
          totalAmount: hall.rate * hours,
          currency: hotelSettings.baseCurrency,
          specialRequirements: formData.specialRequirements,
          status: 'confirmed'
        });
        
        setShowBookingForm(false);
        setBookingError('');
        setFormData({
          hallId: '', eventName: '', clientName: '', clientEmail: '', clientPhone: '',
          date: '', startTime: '', endTime: '', attendees: '', specialRequirements: ''
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6">New Banquet Booking</h3>
          
          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {bookingError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Banquet Hall</label>
                <select
                  value={formData.hallId}
                  onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a hall</option>
                  {banquetHalls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} - Capacity: {hall.capacity} ({formatCurrency(hall.rate)}/hour)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Wedding Reception, Corporate Event"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Attendees</label>
                <input
                  type="number"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Catering, decorations, A/V equipment, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingError('');
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
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banquet Halls</h1>
          {dateFilter === 'today' && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                Today's Events
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
            onClick={() => setShowHallManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Eye className="w-4 h-4" />
            <span>Manage Halls</span>
          </button>
          <button
            onClick={() => setShowChargeForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Receipt className="w-4 h-4" />
            <span>Post to Room</span>
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

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'halls', name: 'Halls', icon: MapPin },
              { id: 'bookings', name: 'Event Bookings', icon: Calendar }
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

      {view === 'halls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banquetHalls.map((hall) => (
            <div key={hall.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={hall.photos[0]}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{hall.name}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(hall.rate)}/hour</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Up to {hall.capacity} guests</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {hall.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {hall.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{hall.amenities.length - 3} more
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedHall(hall);
                    setShowHallDetails(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
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
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const hall = banquetHalls.find(h => h.id === booking.hallId);
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.eventName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                        <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hall?.name}</div>
                        <div className="text-sm text-gray-500">Capacity: {hall?.capacity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.attendees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => setShowChargeForm(true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Bill to Room
                        </button>
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
      {showHallDetails && <HallDetailsModal />}
      {showChargeForm && <ChargeForm />}
      {showHallManagement && <BanquetHallManagement onClose={() => setShowHallManagement(false)} />}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { CheckCircle, Clock, AlertCircle, Bed, User, Receipt, X } from 'lucide-react';
import { Room } from '../types';

interface HousekeepingModuleProps {
  filters?: {
    filter?: string;
  };
}

export function HousekeepingModule({ filters }: HousekeepingModuleProps) {
  const { 
    rooms, 
    bookings, 
    guests, 
    updateRoomStatus,
    addRoomCharge
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [filter, setFilter] = useState<'all' | 'dirty' | 'checkout'>('all');
  const [showChargeForm, setShowChargeForm] = useState(false);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters?.filter) {
      setFilter(filters.filter as any);
    }
  }, [filters]);

  const getRoomsToClean = () => {
    const today = new Date().toISOString().split('T')[0];
    const checkoutRooms = bookings
      .filter(b => b.checkOut === today && b.status === 'checked-out')
      .map(b => b.roomId);

    switch (filter) {
      case 'dirty':
        return rooms.filter(r => r.status === 'dirty');
      case 'checkout':
        return rooms.filter(r => checkoutRooms.includes(r.id));
      default:
        return rooms.filter(r => r.status === 'dirty' || checkoutRooms.includes(r.id));
    }
  };

  const roomsToClean = getRoomsToClean();
  const cleanRooms = rooms.filter(r => r.status === 'clean').length;
  const dirtyRooms = rooms.filter(r => r.status === 'dirty').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;

  const handleMarkAsClean = (roomId: string) => {
    updateRoomStatus(roomId, 'clean');
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'dirty':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'occupied':
        return <User className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityLevel = (room: Room) => {
    // Check if room has checkout today
    const today = new Date().toISOString().split('T')[0];
    const hasCheckoutToday = bookings.some(b => 
      b.roomId === room.id && b.checkOut === today && b.status === 'checked-out'
    );
    
    // Check if room has check-in today
    const hasCheckinToday = bookings.some(b => 
      b.roomId === room.id && b.checkIn === today && b.status === 'confirmed'
    );

    if (hasCheckoutToday && hasCheckinToday) return 'high';
    if (hasCheckinToday) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const ChargeForm = () => {
    const [formData, setFormData] = useState({
      bookingId: '',
      description: '',
      amount: '',
      serviceType: ''
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
      setFormData({ bookingId: '', description: '', amount: '', serviceType: '' });
      alert('Housekeeping charge posted to room successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Post Housekeeping Charge</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select service type</option>
                <option value="laundry">Laundry Service</option>
                <option value="dry-cleaning">Dry Cleaning</option>
                <option value="extra-cleaning">Extra Room Cleaning</option>
                <option value="minibar">Minibar Restocking</option>
                <option value="amenities">Extra Amenities</option>
                <option value="maintenance">Maintenance Service</option>
                <option value="other">Other Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Express Laundry Service, Extra Towels"
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Housekeeping Dashboard</h1>
          <p className="text-gray-600">Manage room cleaning assignments and status updates</p>
          {filter === 'dirty' && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                Dirty Rooms Only
              </span>
              <button
                onClick={() => setFilter('all')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowChargeForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Receipt className="w-4 h-4" />
          <span>Post Charge</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rooms to Clean</p>
              <p className="text-3xl font-bold text-orange-600">{roomsToClean.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clean & Ready</p>
              <p className="text-3xl font-bold text-green-600">{cleanRooms}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Currently Dirty</p>
              <p className="text-3xl font-bold text-orange-600">{dirtyRooms}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Bed className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-blue-600">{occupiedRooms}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'All Tasks', count: roomsToClean.length },
              { id: 'dirty', name: 'Dirty Rooms', count: dirtyRooms },
              { id: 'checkout', name: 'Checkouts Today', count: bookings.filter(b => b.checkOut === new Date().toISOString().split('T')[0]).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  filter === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Room Cleaning List */}
      <div className="space-y-4">
        {roomsToClean.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No rooms need cleaning at the moment.</p>
          </div>
        ) : (
          roomsToClean.map((room) => {
            const priority = getPriorityLevel(room);
            const guest = bookings.find(b => b.roomId === room.id && b.status === 'checked-out')?.guestId;
            const guestName = guest ? guests.find(g => g.id === guest)?.name : null;
            
            return (
              <div
                key={room.id}
                className={`border-l-4 rounded-xl shadow-sm border border-gray-200 p-6 ${getPriorityColor(priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(room.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Room {room.number}</h3>
                        <p className="text-sm text-gray-600 capitalize">{room.type} room</p>
                      </div>
                    </div>
                    
                    {priority === 'high' && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>High Priority</span>
                      </div>
                    )}
                    
                    {priority === 'medium' && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Check-in Today</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {guestName && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last guest:</p>
                        <p className="text-sm font-medium text-gray-900">{guestName}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleMarkAsClean(room.id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Clean</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showChargeForm && <ChargeForm />}
    </div>
  );
}
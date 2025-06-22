import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { Bed, Users, Calendar, UtensilsCrossed, Coins, TrendingUp, Clock, CheckCircle, ArrowRight, AlertCircle, Plus, Eye, Home, Wrench, Sparkles, UserCheck, LogIn, LogOut, User, Phone, Mail, MapPin, Star, Timer, UserX, Check as CheckIn, Check as CheckOut, ChevronDown } from 'lucide-react';

interface DashboardProps {
  onModuleChange: (module: string, filter?: any) => void;
}

export function Dashboard({ onModuleChange }: DashboardProps) {
  const { user, getEmployeesOnShift } = useAuth();
  const { rooms, bookings, banquetBookings, restaurantTables, roomServiceOrders, guests } = useHotel();
  const { formatCurrency, hotelSettings, convertAmount, getCurrencySymbol } = useCurrency();
  const { branding, formatDateTime, formatTime, getCurrentDate, getCurrentTime } = useBranding();
  
  const [showQuickActions, setShowQuickActions] = useState(false);

  const today = getCurrentDate();
  const currentMonth = today.slice(0, 7); // YYYY-MM format

  // Get today's check-ins and check-outs with detailed information
  const todayCheckIns = bookings.filter(b => b.checkIn === today);
  const todayCheckOuts = bookings.filter(b => b.checkOut === today);

  // Get probable check-ins (confirmed bookings for today)
  const probableCheckIns = todayCheckIns.map(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    return {
      ...booking,
      guest,
      room,
      estimatedArrival: '15:00', // Default check-in time
      isVip: guest?.vipStatus || false,
      vipTier: guest?.vipTier,
      specialRequests: guest?.specialRequests || [],
      roomPreferences: guest?.roomPreferences
    };
  });

  // Get probable check-outs (current guests checking out today)
  const probableCheckOuts = todayCheckOuts.map(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    return {
      ...booking,
      guest,
      room,
      estimatedDeparture: '11:00', // Default check-out time
      isVip: guest?.vipStatus || false,
      vipTier: guest?.vipTier,
      hasOutstandingCharges: booking.charges.some(c => c.amount > 0),
      totalCharges: booking.charges.reduce((sum, c) => sum + c.amount, 0)
    };
  });

  // Calculate accurate revenue with proper currency conversion
  const calculateRevenue = () => {
    let todayRevenue = 0;
    let monthRevenue = 0;

    // Room revenue from bookings
    bookings.forEach(booking => {
      const totalCharges = booking.charges.reduce((sum, charge) => {
        // Convert charge amount to display currency
        const convertedAmount = convertAmount(charge.amount, charge.currency, hotelSettings.displayCurrency);
        return sum + convertedAmount;
      }, 0);
      
      // Today's revenue (check-ins today or charges posted today)
      if (booking.checkIn === today || booking.charges.some(charge => charge.date === today)) {
        todayRevenue += totalCharges;
      }
      
      // Monthly revenue (check-ins this month or charges this month)
      if (booking.checkIn.startsWith(currentMonth) || booking.charges.some(charge => charge.date.startsWith(currentMonth))) {
        monthRevenue += totalCharges;
      }
    });

    // Banquet revenue
    banquetBookings.forEach(booking => {
      // Convert banquet booking amount to display currency
      const convertedAmount = convertAmount(booking.totalAmount, booking.currency, hotelSettings.displayCurrency);
      
      if (booking.date === today) {
        todayRevenue += convertedAmount;
      }
      if (booking.date.startsWith(currentMonth)) {
        monthRevenue += convertedAmount;
      }
    });

    // Room service revenue
    roomServiceOrders.forEach(order => {
      const orderDate = order.orderTime.split('T')[0];
      // Convert room service order amount to display currency
      const convertedAmount = convertAmount(order.total, order.currency, hotelSettings.displayCurrency);
      
      if (orderDate === today) {
        todayRevenue += convertedAmount;
      }
      if (orderDate.startsWith(currentMonth)) {
        monthRevenue += convertedAmount;
      }
    });

    return { todayRevenue, monthRevenue };
  };

  const { todayRevenue, monthRevenue } = calculateRevenue();

  // Get employees on shift by department
  const employeesOnShift = {
    'Front Office': getEmployeesOnShift('Front Office'),
    'Housekeeping': getEmployeesOnShift('Housekeeping'),
    'Food & Beverage': getEmployeesOnShift('Food & Beverage'),
    'Operations': getEmployeesOnShift('Operations'),
    'Administration': getEmployeesOnShift('Administration')
  };

  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    dirtyRooms: rooms.filter(r => r.status === 'dirty').length,
    cleanRooms: rooms.filter(r => r.status === 'clean').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order').length,
    todayCheckIns: todayCheckIns.length,
    todayCheckOuts: todayCheckOuts.length,
    activeBanquets: banquetBookings.filter(b => b.date === today).length,
    availableTables: restaurantTables.filter(t => t.status === 'available').length,
    occupiedTables: restaurantTables.filter(t => t.status === 'occupied').length,
    pendingRoomService: roomServiceOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    todayRevenue,
    monthRevenue
  };

  const occupancyRate = stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : '0.0';
  const availableRooms = stats.totalRooms - stats.occupiedRooms - stats.maintenanceRooms;

  const getGreeting = () => {
    const currentTime = getCurrentTime();
    const hour = parseInt(currentTime.split(':')[0]);
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get VIP tier badge color
  const getVipTierColor = (tier?: string) => {
    switch (tier) {
      case 'diamond': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'platinum': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Quick Actions for different roles
  const getQuickActions = () => {
    const baseActions = [
      {
        title: "New Booking",
        description: "Create a room reservation",
        icon: Calendar,
        color: "blue",
        onClick: () => onModuleChange('rooms', { action: 'new-booking' })
      },
      {
        title: "Check-in Guest",
        description: "Process guest arrival",
        icon: CheckCircle,
        color: "green",
        onClick: () => onModuleChange('rooms', { view: 'bookings', action: 'check-in' })
      }
    ];

    if (user?.role === 'admin' || user?.role === 'manager') {
      baseActions.push(
        {
          title: "Table Reservation",
          description: "Reserve restaurant table",
          icon: UtensilsCrossed,
          color: "orange",
          onClick: () => onModuleChange('restaurant', { action: 'new-reservation' })
        },
        {
          title: "Event Booking",
          description: "Schedule banquet event",
          icon: Users,
          color: "purple",
          onClick: () => onModuleChange('banquet', { action: 'new-booking' })
        }
      );
    }

    return baseActions;
  };

  // Role-specific dashboard content
  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'housekeeping':
        return {
          title: 'Housekeeping Dashboard',
          subtitle: 'Your room cleaning assignments and status updates',
          primaryStats: [
            {
              title: 'Rooms to Clean',
              value: stats.dirtyRooms,
              icon: AlertCircle,
              color: 'orange',
              onClick: () => onModuleChange('housekeeping', { filter: 'dirty' }),
              urgent: stats.dirtyRooms > 0
            },
            {
              title: 'Clean Rooms',
              value: stats.cleanRooms,
              icon: CheckCircle,
              color: 'green',
              onClick: () => onModuleChange('rooms', { statusFilter: 'clean' })
            },
            {
              title: 'Check-outs Today',
              value: stats.todayCheckOuts,
              icon: Clock,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' }),
              urgent: stats.todayCheckOuts > 0
            }
          ]
        };
      
      case 'restaurant':
        return {
          title: 'Restaurant Dashboard',
          subtitle: 'Restaurant operations and room service management',
          primaryStats: [
            {
              title: 'Available Tables',
              value: stats.availableTables,
              icon: UtensilsCrossed,
              color: 'green',
              onClick: () => onModuleChange('restaurant', { tableFilter: 'available' })
            },
            {
              title: 'Occupied Tables',
              value: stats.occupiedTables,
              icon: Users,
              color: 'blue',
              onClick: () => onModuleChange('restaurant', { tableFilter: 'occupied' })
            },
            {
              title: 'Pending Room Service',
              value: stats.pendingRoomService,
              icon: Clock,
              color: 'orange',
              onClick: () => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' }),
              urgent: stats.pendingRoomService > 0
            }
          ]
        };
      
      case 'front-desk':
        return {
          title: 'Front Desk Dashboard',
          subtitle: 'Guest services and reservation management',
          primaryStats: [
            {
              title: 'Room Status',
              value: availableRooms,
              subtitle: `${stats.cleanRooms} clean • ${stats.dirtyRooms} dirty • ${stats.maintenanceRooms} maintenance`,
              icon: Home,
              color: 'green',
              onClick: () => onModuleChange('rooms'),
              roomBreakdown: {
                available: availableRooms,
                occupied: stats.occupiedRooms,
                dirty: stats.dirtyRooms,
                maintenance: stats.maintenanceRooms,
                total: stats.totalRooms
              }
            },
            {
              title: 'Check-ins Today',
              value: stats.todayCheckIns,
              icon: Clock,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' }),
              urgent: stats.todayCheckIns > 0
            },
            {
              title: 'Occupancy Rate',
              value: `${occupancyRate}%`,
              subtitle: `${stats.occupiedRooms}/${stats.totalRooms} occupied`,
              icon: TrendingUp,
              color: 'indigo',
              onClick: () => onModuleChange('rooms', { statusFilter: 'occupied' })
            }
          ]
        };
      
      default:
        return {
          title: `Welcome to VervConnect`,
          subtitle: `Here's what's happening at ${branding.hotelName} today`,
          primaryStats: [
            {
              title: 'Room Status',
              value: availableRooms,
              subtitle: `${stats.cleanRooms} clean • ${stats.dirtyRooms} dirty • ${stats.maintenanceRooms} maintenance • ${occupancyRate}% occupied`,
              icon: Home,
              color: 'green',
              onClick: () => onModuleChange('rooms'),
              roomBreakdown: {
                available: availableRooms,
                occupied: stats.occupiedRooms,
                dirty: stats.dirtyRooms,
                maintenance: stats.maintenanceRooms,
                total: stats.totalRooms
              }
            },
            {
              title: 'Today\'s Activity',
              value: stats.todayCheckIns + stats.todayCheckOuts,
              subtitle: `${stats.todayCheckIns} arrivals • ${stats.todayCheckOuts} departures`,
              icon: Clock,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'today' }),
              urgent: (stats.todayCheckIns + stats.todayCheckOuts) > 0
            },
            {
              title: 'Revenue Today',
              value: `${getCurrencySymbol(hotelSettings.displayCurrency)} ${stats.todayRevenue.toLocaleString(undefined, {
                minimumFractionDigits: hotelSettings.decimalPlaces,
                maximumFractionDigits: hotelSettings.decimalPlaces
              })}`,
              subtitle: `in ${hotelSettings.displayCurrency}`,
              icon: Coins,
              color: 'emerald',
              onClick: () => onModuleChange('rooms', { view: 'bookings', revenueFilter: 'today' })
            },
            {
              title: 'Staff on Duty',
              value: Object.values(employeesOnShift).flat().length,
              subtitle: `across ${Object.keys(employeesOnShift).length} departments`,
              icon: Users,
              color: 'purple',
              onClick: () => onModuleChange('admin')
            }
          ]
        };
    }
  };

  const roleContent = getRoleSpecificContent();
  const quickActions = getQuickActions();

  const ClickableCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'indigo', 
    subtitle, 
    onClick,
    urgent = false,
    roomBreakdown
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subtitle?: string;
    onClick?: () => void;
    urgent?: boolean;
    roomBreakdown?: {
      available: number;
      occupied: number;
      dirty: number;
      maintenance: number;
      total: number;
    };
  }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:scale-105 cursor-pointer active:scale-95 touch-manipulation' : ''
      } ${urgent ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${urgent ? 'text-red-700' : 'text-gray-600'} truncate`}>{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold mt-2 ${urgent ? 'text-red-900' : 'text-gray-900'} truncate`}>{value}</p>
          {subtitle && <p className={`text-sm mt-1 ${urgent ? 'text-red-600' : 'text-gray-500'} truncate`}>{subtitle}</p>}
          
          {/* Room Status Breakdown */}
          {roomBreakdown && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="grid grid-cols-5 gap-1">
                <div className="text-center">
                  <div className="w-full h-2 bg-green-200 rounded-full mb-1">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(roomBreakdown.available / roomBreakdown.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{roomBreakdown.available}</span>
                </div>
                <div className="text-center">
                  <div className="w-full h-2 bg-blue-200 rounded-full mb-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(roomBreakdown.occupied / roomBreakdown.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{roomBreakdown.occupied}</span>
                </div>
                <div className="text-center">
                  <div className="w-full h-2 bg-orange-200 rounded-full mb-1">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${(roomBreakdown.dirty / roomBreakdown.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">{roomBreakdown.dirty}</span>
                </div>
                <div className="text-center">
                  <div className="w-full h-2 bg-red-200 rounded-full mb-1">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${(roomBreakdown.maintenance / roomBreakdown.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-red-600 font-medium">{roomBreakdown.maintenance}</span>
                </div>
                <div className="text-center">
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                    <div className="h-full bg-gray-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{roomBreakdown.total}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-1 text-center">
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-xs text-gray-500">Occupied</div>
                <div className="text-xs text-gray-500">Dirty</div>
                <div className="text-xs text-gray-500">Maintenance</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-lg flex-shrink-0 ${urgent ? 'bg-red-200' : `bg-${color}-100`}`}>
          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${urgent ? 'text-red-700' : `text-${color}-600`}`} />
        </div>
      </div>
      {onClick && (
        <div className="mt-3 lg:mt-4 flex items-center text-sm text-indigo-600 font-medium">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );

  // Quick Actions Dropdown Component
  const QuickActionsDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Quick Actions</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
      </button>

      {showQuickActions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowQuickActions(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setShowQuickActions(false);
                      }}
                      className={`p-4 text-left rounded-lg border-2 border-dashed border-${action.color}-300 hover:border-${action.color}-400 hover:bg-${action.color}-50 transition-all duration-200 group`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 text-${action.color}-600 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-${action.color}-900 mb-1 text-sm`}>{action.title}</h4>
                          <p className={`text-xs text-${action.color}-700`}>{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">{roleContent.subtitle}</p>
            <div className="mt-2 text-sm text-gray-500">
              Current time: {formatTime(getCurrentTime())} • {formatDateTime(new Date())}
            </div>
            
            {/* VervConnect Tagline */}
            <div className="mt-3 flex items-center space-x-2">
              <div className="h-1 w-8 lg:w-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Connect with Comfort
              </span>
              <div className="h-1 w-8 lg:w-12 bg-gradient-to-r from-teal-400 via-blue-500 to-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Quick Actions Dropdown - Only for relevant roles */}
          {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'front-desk') && (
            <div className="ml-4 flex-shrink-0">
              <QuickActionsDropdown />
            </div>
          )}
        </div>
      </div>

      {/* Currency Display Notice */}
      {hotelSettings.baseCurrency !== hotelSettings.displayCurrency && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Currency Display: {hotelSettings.displayCurrency} ({getCurrencySymbol(hotelSettings.displayCurrency)})
              </p>
              <p className="text-xs text-blue-600">
                All amounts are converted from base currency ({hotelSettings.baseCurrency}) to display currency ({hotelSettings.displayCurrency})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role-specific Primary Stats - Arranged in 2x2 grid for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {roleContent.primaryStats.slice(0, 4).map((stat, index) => (
          <ClickableCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            onClick={stat.onClick}
            urgent={stat.urgent}
            roomBreakdown={(stat as any).roomBreakdown}
          />
        ))}
      </div>

      {/* Today's Check-ins and Check-outs Section - Only for relevant roles */}
      {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'front-desk') && (probableCheckIns.length > 0 || probableCheckOuts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
          {/* Probable Check-ins */}
          {probableCheckIns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckIn className="w-5 h-5 mr-2 text-green-600" />
                  Today's Arrivals ({probableCheckIns.length})
                </h3>
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' })}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {probableCheckIns.slice(0, 4).map((checkin) => (
                  <div key={checkin.id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">{checkin.guest?.name}</p>
                            {checkin.isVip && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVipTierColor(checkin.vipTier)}`}>
                                  {checkin.vipTier?.toUpperCase() || 'VIP'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Home className="w-4 h-4" />
                                <span>Room {checkin.room?.number}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Timer className="w-4 h-4" />
                                <span>Est. {checkin.estimatedArrival}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {probableCheckIns.length > 4 && (
                  <div className="text-center py-2">
                    <button
                      onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' })}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      View {probableCheckIns.length - 4} more arrivals
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Probable Check-outs */}
          {probableCheckOuts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckOut className="w-5 h-5 mr-2 text-orange-600" />
                  Today's Departures ({probableCheckOuts.length})
                </h3>
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {probableCheckOuts.slice(0, 4).map((checkout) => {
                  const isCheckedOut = checkout.status === 'checked-out';
                  return (
                    <div key={checkout.id} className={`p-4 rounded-lg border transition-colors ${
                      isCheckedOut 
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                        : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCheckedOut ? 'bg-gray-100' : 'bg-orange-100'
                          }`}>
                            <User className={`w-5 h-5 ${isCheckedOut ? 'text-gray-600' : 'text-orange-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">{checkout.guest?.name}</p>
                              {checkout.isVip && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVipTierColor(checkout.vipTier)}`}>
                                    {checkout.vipTier?.toUpperCase() || 'VIP'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Home className="w-4 h-4" />
                                  <span>Room {checkout.room?.number}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Timer className="w-4 h-4" />
                                  <span>By {checkout.estimatedDeparture}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {probableCheckOuts.length > 4 && (
                  <div className="text-center py-2">
                    <button
                      onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                      View {probableCheckOuts.length - 4} more departures
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Staff on Shift Section - Only for admin/manager */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-indigo-600" />
              Staff on Shift
            </h3>
            <div className="text-sm text-gray-500">
              {Object.values(employeesOnShift).flat().length} employees currently on duty
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Object.entries(employeesOnShift).map(([department, employees]) => (
              <div key={department} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">{department}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    employees.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {employees.length} on shift
                  </span>
                </div>
                
                {employees.length > 0 ? (
                  <div className="space-y-2">
                    {employees.slice(0, 3).map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-indigo-600">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{employee.name}</p>
                          <p className="text-xs text-gray-500 truncate capitalize">
                            {employee.role.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      </div>
                    ))}
                    {employees.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{employees.length - 3} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <UserX className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">No staff on shift</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Activity - Relevant to all roles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
          Today's Activity
        </h3>
        <div className="space-y-3">
          {user?.role === 'housekeeping' ? (
            <>
              {stats.dirtyRooms > 0 && (
                <button
                  onClick={() => onModuleChange('housekeeping', { filter: 'dirty' })}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors touch-manipulation active:bg-orange-200"
                >
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-orange-800 flex-1 text-left">
                    <strong>{stats.dirtyRooms}</strong> room{stats.dirtyRooms !== 1 ? 's' : ''} need{stats.dirtyRooms === 1 ? 's' : ''} cleaning
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
                </button>
              )}
              {stats.todayCheckOuts > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation active:bg-blue-200"
                >
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.todayCheckOuts}</strong> guest{stats.todayCheckOuts !== 1 ? 's' : ''} checking out today
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </button>
              )}
            </>
          ) : user?.role === 'restaurant' ? (
            <>
              {stats.pendingRoomService > 0 && (
                <button
                  onClick={() => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation active:bg-blue-200"
                >
                  <UtensilsCrossed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.pendingRoomService}</strong> room service order{stats.pendingRoomService !== 1 ? 's' : ''} pending
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </button>
              )}
              {stats.occupiedTables > 0 && (
                <button
                  onClick={() => onModuleChange('restaurant', { tableFilter: 'occupied' })}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors touch-manipulation active:bg-green-200"
                >
                  <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800 flex-1 text-left">
                    <strong>{stats.occupiedTables}</strong> table{stats.occupiedTables !== 1 ? 's' : ''} currently occupied
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                </button>
              )}
            </>
          ) : (
            <>
              {stats.todayCheckIns > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors touch-manipulation active:bg-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800 flex-1 text-left">
                    <strong>{stats.todayCheckIns}</strong> guest{stats.todayCheckIns !== 1 ? 's' : ''} checking in today
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                </button>
              )}
              {stats.todayCheckOuts > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors touch-manipulation active:bg-orange-200"
                >
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-orange-800 flex-1 text-left">
                    <strong>{stats.todayCheckOuts}</strong> guest{stats.todayCheckOuts !== 1 ? 's' : ''} checking out today
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
                </button>
              )}
              {stats.activeBanquets > 0 && (
                <button
                  onClick={() => onModuleChange('banquet', { dateFilter: 'today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors touch-manipulation active:bg-purple-200"
                >
                  <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-purple-800 flex-1 text-left">
                    <strong>{stats.activeBanquets}</strong> banquet event{stats.activeBanquets !== 1 ? 's' : ''} scheduled today
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                </button>
              )}
              {stats.pendingRoomService > 0 && (
                <button
                  onClick={() => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation active:bg-blue-200"
                >
                  <UtensilsCrossed className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.pendingRoomService}</strong> room service order{stats.pendingRoomService !== 1 ? 's' : ''} pending
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </button>
              )}
              {stats.dirtyRooms > 0 && (
                <button
                  onClick={() => onModuleChange('housekeeping', { filter: 'dirty' })}
                  className="w-full flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors touch-manipulation active:bg-yellow-200"
                >
                  <Bed className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm text-yellow-800 flex-1 text-left">
                    <strong>{stats.dirtyRooms}</strong> room{stats.dirtyRooms !== 1 ? 's' : ''} need{stats.dirtyRooms === 1 ? 's' : ''} cleaning
                  </span>
                  <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                </button>
              )}
            </>
          )}
          
          {/* Show "all caught up" message when no activities */}
          {((user?.role === 'housekeeping' && stats.dirtyRooms === 0 && stats.todayCheckOuts === 0) ||
            (user?.role === 'restaurant' && stats.pendingRoomService === 0 && stats.occupiedTables === 0) ||
            (user?.role !== 'housekeeping' && user?.role !== 'restaurant' && 
             stats.todayCheckIns === 0 && stats.todayCheckOuts === 0 && stats.activeBanquets === 0 && 
             stats.pendingRoomService === 0 && stats.dirtyRooms === 0)) && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">All caught up! No urgent tasks for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
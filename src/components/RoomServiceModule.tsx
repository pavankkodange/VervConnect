import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { MenuManagement } from './MenuManagement';
import { 
  UtensilsCrossed, 
  Clock, 
  ShoppingCart, 
  Plus, 
  Minus,
  Star,
  Leaf,
  Flame,
  Search,
  Filter,
  CheckCircle,
  X,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  ChefHat,
  Coffee,
  Wine,
  Sandwich,
  Cookie,
  Salad,
  Settings,
  Edit,
  Trash2,
  Heart,
  Info
} from 'lucide-react';
import { MenuCategory, MenuItem, RoomServiceOrder, OrderItem } from '../types';

interface RoomServiceModuleProps {
  filters?: {
    view?: string;
    statusFilter?: string;
  };
}

export function RoomServiceModule({ filters }: RoomServiceModuleProps) {
  const { 
    bookings, 
    guests, 
    addRoomCharge,
    roomServiceOrders,
    addRoomServiceOrder,
    updateRoomServiceOrderStatus
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'guest-portal' | 'kitchen-orders'>('guest-portal');
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
    }
  }, [filters]);

  // Demo menu data - in production, this would come from context/API
  const menuCategories: MenuCategory[] = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      description: 'Start your day right',
      icon: 'coffee',
      available: true,
      availableHours: { start: '06:00', end: '11:00' }
    },
    {
      id: 'appetizers',
      name: 'Appetizers',
      description: 'Light bites and starters',
      icon: 'sandwich',
      available: true,
      availableHours: { start: '11:00', end: '23:00' }
    },
    {
      id: 'mains',
      name: 'Main Courses',
      description: 'Hearty meals and entrees',
      icon: 'chef-hat',
      available: true,
      availableHours: { start: '11:00', end: '22:00' }
    },
    {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats and indulgences',
      icon: 'cookie',
      available: true,
      availableHours: { start: '12:00', end: '23:00' }
    },
    {
      id: 'beverages',
      name: 'Beverages',
      description: 'Drinks and refreshments',
      icon: 'wine',
      available: true,
      availableHours: { start: '00:00', end: '23:59' }
    },
    {
      id: 'healthy',
      name: 'Healthy Options',
      description: 'Nutritious and light meals',
      icon: 'salad',
      available: true,
      availableHours: { start: '06:00', end: '22:00' }
    }
  ];

  const menuItems: MenuItem[] = [
    // Breakfast
    {
      id: 'b1',
      categoryId: 'breakfast',
      name: 'Continental Breakfast',
      description: 'Fresh pastries, fruits, yogurt, coffee, and juice',
      price: 28,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      available: true,
      preparationTime: 15,
      dietary: ['vegetarian'],
      popular: true
    },
    {
      id: 'b2',
      categoryId: 'breakfast',
      name: 'Full English Breakfast',
      description: 'Eggs, bacon, sausages, baked beans, toast, and grilled tomatoes',
      price: 35,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
      available: true,
      preparationTime: 25,
      dietary: []
    },
    {
      id: 'b3',
      categoryId: 'breakfast',
      name: 'Avocado Toast',
      description: 'Sourdough bread with smashed avocado, cherry tomatoes, and feta',
      price: 22,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg',
      available: true,
      preparationTime: 12,
      dietary: ['vegetarian', 'healthy']
    },

    // Appetizers
    {
      id: 'a1',
      categoryId: 'appetizers',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce, parmesan, croutons, and caesar dressing',
      price: 18,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',
      available: true,
      preparationTime: 10,
      dietary: ['vegetarian']
    },
    {
      id: 'a2',
      categoryId: 'appetizers',
      name: 'Chicken Wings',
      description: 'Spicy buffalo wings served with blue cheese dip',
      price: 24,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg',
      available: true,
      preparationTime: 20,
      dietary: [],
      spicyLevel: 3
    },

    // Main Courses
    {
      id: 'm1',
      categoryId: 'mains',
      name: 'Grilled Salmon',
      description: 'Atlantic salmon with lemon herb butter, vegetables, and rice',
      price: 42,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
      available: true,
      preparationTime: 30,
      dietary: ['healthy', 'gluten-free'],
      popular: true
    },
    {
      id: 'm2',
      categoryId: 'mains',
      name: 'Beef Tenderloin',
      description: 'Prime beef with garlic mashed potatoes and seasonal vegetables',
      price: 58,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg',
      available: true,
      preparationTime: 35,
      dietary: ['gluten-free']
    },
    {
      id: 'm3',
      categoryId: 'mains',
      name: 'Margherita Pizza',
      description: 'Wood-fired pizza with fresh mozzarella, tomatoes, and basil',
      price: 28,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
      available: true,
      preparationTime: 18,
      dietary: ['vegetarian']
    },

    // Desserts
    {
      id: 'd1',
      categoryId: 'desserts',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center and vanilla ice cream',
      price: 16,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
      available: true,
      preparationTime: 15,
      dietary: ['vegetarian']
    },
    {
      id: 'd2',
      categoryId: 'desserts',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers',
      price: 14,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
      available: true,
      preparationTime: 5,
      dietary: ['vegetarian']
    },

    // Beverages
    {
      id: 'bv1',
      categoryId: 'beverages',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 8,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
      available: true,
      preparationTime: 5,
      dietary: ['vegan', 'healthy']
    },
    {
      id: 'bv2',
      categoryId: 'beverages',
      name: 'House Wine',
      description: 'Red or white wine selection',
      price: 12,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg',
      available: true,
      preparationTime: 2,
      dietary: []
    },

    // Healthy Options
    {
      id: 'h1',
      categoryId: 'healthy',
      name: 'Quinoa Bowl',
      description: 'Quinoa with roasted vegetables, avocado, and tahini dressing',
      price: 26,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg',
      available: true,
      preparationTime: 15,
      dietary: ['vegan', 'healthy', 'gluten-free']
    },
    {
      id: 'h2',
      categoryId: 'healthy',
      name: 'Green Smoothie',
      description: 'Spinach, banana, mango, and coconut water blend',
      price: 12,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
      available: true,
      preparationTime: 5,
      dietary: ['vegan', 'healthy']
    }
  ];

  const activeBookings = bookings.filter(b => b.status === 'checked-in');

  // Filter orders based on status filter
  const filteredOrders = statusFilter 
    ? roomServiceOrders.filter(order => {
        if (statusFilter === 'pending') {
          return ['pending', 'confirmed', 'preparing'].includes(order.status);
        }
        return order.status === statusFilter;
      })
    : roomServiceOrders;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'sandwich': return <Sandwich className="w-6 h-6" />;
      case 'chef-hat': return <ChefHat className="w-6 h-6" />;
      case 'cookie': return <Cookie className="w-6 h-6" />;
      case 'wine': return <Wine className="w-6 h-6" />;
      case 'salad': return <Salad className="w-6 h-6" />;
      default: return <UtensilsCrossed className="w-6 h-6" />;
    }
  };

  // Cart Management Functions
  const addToCart = (menuItem: MenuItem, quantity: number = 1) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const OrderForm = () => {
    const [formData, setFormData] = useState({
      specialInstructions: '',
      paymentMethod: 'room-charge' as 'room-charge' | 'cash' | 'card'
    });

    const selectedBookingData = bookings.find(b => b.id === selectedBooking);
    const guest = selectedBookingData ? guests.find(g => g.id === selectedBookingData.guestId) : null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedBookingData || cart.length === 0) return;

      const subtotal = getCartTotal();
      const tax = subtotal * 0.1; // 10% tax
      const deliveryFee = 5;
      const total = subtotal + tax + deliveryFee;

      const order: Omit<RoomServiceOrder, 'id'> = {
        bookingId: selectedBooking,
        guestId: selectedBookingData.guestId,
        roomNumber: selectedBookingData.roomId,
        items: cart,
        subtotal,
        tax,
        deliveryFee,
        total,
        currency: hotelSettings.baseCurrency,
        status: 'pending',
        orderTime: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(), // 45 minutes
        specialInstructions: formData.specialInstructions,
        paymentMethod: formData.paymentMethod
      };

      addRoomServiceOrder(order);

      // Add charge to room if payment method is room-charge
      if (formData.paymentMethod === 'room-charge') {
        addRoomCharge(selectedBooking, {
          description: `Room Service Order - ${cart.length} items`,
          amount: total,
          currency: hotelSettings.baseCurrency,
          date: new Date().toISOString().split('T')[0],
          category: 'room-service'
        });
      }

      clearCart();
      setShowOrderForm(false);
      alert('Order placed successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Your Order</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Information */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Delivery Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Guest Name</p>
                  <p className="font-semibold text-blue-900">{guest?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room Number</p>
                  <p className="font-semibold text-blue-900">Room {selectedBookingData?.roomId}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Phone</p>
                  <p className="font-semibold text-blue-900">{guest?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Estimated Delivery</p>
                  <p className="font-semibold text-blue-900">45 minutes</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>{formatCurrency(getCartTotal() * 0.1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(5)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(getCartTotal() + (getCartTotal() * 0.1) + 5)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'room-charge', name: 'Charge to Room', icon: Receipt },
                    { id: 'cash', name: 'Cash on Delivery', icon: Phone },
                    { id: 'card', name: 'Credit Card', icon: CreditCard }
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.paymentMethod === method.id
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

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Place Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CartSidebar = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-96 h-full overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6" />
              <span>Your Order</span>
            </h3>
            <button
              onClick={() => setShowCart(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">{formatCurrency(getCartTotal() * 0.1)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(5)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(getCartTotal() + (getCartTotal() * 0.1) + 5)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowOrderForm(true);
                  }}
                  disabled={!selectedBooking}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{selectedBooking ? 'Proceed to Checkout' : 'Select Room First'}</span>
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Service</h1>
          {statusFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                {statusFilter === 'pending' ? 'Pending Orders' : `${statusFilter} Orders`}
              </span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowMenuManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Menu</span>
          </button>
          <button
            onClick={() => setView('guest-portal')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'guest-portal'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Guest Portal
          </button>
          <button
            onClick={() => setView('kitchen-orders')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'kitchen-orders'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Kitchen Orders
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({getCartItemCount()})</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {view === 'guest-portal' && (
        <>
          {/* Room Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Room</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeBookings.map((booking) => {
                const guest = guests.find(g => g.id === booking.guestId);
                return (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedBooking === booking.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">Room {booking.roomId}</p>
                        <p className="text-sm text-gray-600">{guest?.name}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
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

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === ''
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UtensilsCrossed className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">All Items</p>
              </button>
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getCategoryIcon(category.icon)}
                  <p className="text-sm font-medium mt-2">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.availableHours.start} - {category.availableHours.end}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isInCart = cart.some(cartItem => cartItem.menuItemId === item.id);
              const cartItem = cart.find(cartItem => cartItem.menuItemId === item.id);
              const isFavorite = favorites.includes(item.id);
              
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.popular && (
                      <div className="absolute top-4 left-4">
                        <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3" />
                          <span>Popular</span>
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs font-semibold">
                        {item.preparationTime} min
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-semibold text-green-600">{formatCurrency(item.price)}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        {item.dietary.map((diet) => (
                          <span key={diet} className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <Leaf className="w-3 h-3" />
                            <span>{diet}</span>
                          </span>
                        ))}
                        {item.spicyLevel && (
                          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            <Flame className="w-3 h-3" />
                            <span>Spicy {item.spicyLevel}/5</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{item.preparationTime}m</span>
                      </div>
                    </div>
                    
                    {isInCart ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg px-2">
                          <button
                            onClick={() => updateQuantity(cartItem!.id, cartItem!.quantity - 1)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-gray-900">{cartItem?.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem!.id, cartItem!.quantity + 1)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem!.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!selectedBooking}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Section - Popular Items */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Popular Items</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.filter(item => item.popular).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-sm text-green-600">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!selectedBooking}
                    className="p-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Your Favorites</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {menuItems.filter(item => favorites.includes(item.id)).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-sm text-green-600">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!selectedBooking}
                      className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Cart Button for Mobile */}
          {cart.length > 0 && !showCart && (
            <div className="fixed bottom-6 right-6 md:hidden">
              <button
                onClick={() => setShowCart(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">{getCartItemCount()} items</span>
                <span className="font-bold">{formatCurrency(getCartTotal())}</span>
              </button>
            </div>
          )}
        </>
      )}

      {view === 'kitchen-orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kitchen Orders</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const guest = guests.find(g => g.id === order.guestId);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.orderTime).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {order.roomNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                        <div className="text-sm text-gray-500">{guest?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total, order.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateRoomServiceOrderStatus(order.id, 'confirmed')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateRoomServiceOrderStatus(order.id, 'preparing')}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateRoomServiceOrderStatus(order.id, 'ready')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateRoomServiceOrderStatus(order.id, 'delivered')}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Delivered
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

      {showCart && <CartSidebar />}
      {showOrderForm && <OrderForm />}
      {showMenuManagement && <MenuManagement onClose={() => setShowMenuManagement(false)} />}
    </div>
  );
}
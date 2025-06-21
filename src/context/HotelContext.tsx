import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room, Guest, Booking, BanquetHall, BanquetBooking, RestaurantTable, TableReservation, RoomCharge, RoomServiceOrder } from '../types';

interface HotelContextType {
  // Rooms
  rooms: Room[];
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (roomId: string, room: Omit<Room, 'id' | 'status'>) => void;
  deleteRoom: (roomId: string) => void;
  
  // Guests
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'bookingHistory' | 'totalStays'>) => void;
  updateGuest: (guestId: string, guest: Partial<Guest>) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'charges'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addRoomCharge: (bookingId: string, charge: Omit<RoomCharge, 'id'>) => void;
  
  // Banquet
  banquetHalls: BanquetHall[];
  banquetBookings: BanquetBooking[];
  addBanquetBooking: (booking: Omit<BanquetBooking, 'id'>) => void;
  addBanquetHall: (hall: Omit<BanquetHall, 'id'>) => void;
  updateBanquetHall: (hallId: string, hall: Omit<BanquetHall, 'id'>) => void;
  deleteBanquetHall: (hallId: string) => void;
  
  // Restaurant
  restaurantTables: RestaurantTable[];
  tableReservations: TableReservation[];
  updateTableStatus: (tableId: string, status: RestaurantTable['status']) => void;
  addTableReservation: (reservation: Omit<TableReservation, 'id'>) => void;
  addRestaurantTable: (table: Omit<RestaurantTable, 'id'>) => void;
  updateRestaurantTable: (tableId: string, table: Omit<RestaurantTable, 'id' | 'status'>) => void;
  deleteRestaurantTable: (tableId: string) => void;
  
  // Room Service
  roomServiceOrders: RoomServiceOrder[];
  addRoomServiceOrder: (order: Omit<RoomServiceOrder, 'id'>) => void;
  updateRoomServiceOrderStatus: (orderId: string, status: RoomServiceOrder['status']) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Enhanced demo data with VIP rooms and guests
const DEMO_ROOMS: Room[] = [
  { 
    id: '101', 
    number: '101', 
    type: 'single', 
    status: 'clean', 
    rate: 120, 
    photos: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV'],
    smokingAllowed: false,
    floor: 1,
    maxOccupancy: 2,
    size: 25,
    bedType: 'Queen',
    view: 'City'
  },
  { 
    id: '102', 
    number: '102', 
    type: 'double', 
    status: 'occupied', 
    rate: 150, 
    photos: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
    smokingAllowed: false,
    floor: 1,
    maxOccupancy: 4,
    size: 35,
    bedType: 'Two Queens',
    view: 'Garden'
  },
  { 
    id: '103', 
    number: '103', 
    type: 'suite', 
    status: 'dirty', 
    rate: 280, 
    photos: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi'],
    smokingAllowed: false,
    floor: 1,
    maxOccupancy: 6,
    size: 65,
    bedType: 'King + Sofa Bed',
    view: 'Ocean'
  },
  { 
    id: '201', 
    number: '201', 
    type: 'deluxe', 
    status: 'clean', 
    rate: 200, 
    photos: ['https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'],
    smokingAllowed: true,
    floor: 2,
    maxOccupancy: 4,
    size: 45,
    bedType: 'King',
    view: 'Mountain'
  },
  { 
    id: '202', 
    number: '202', 
    type: 'single', 
    status: 'dirty', 
    rate: 120, 
    photos: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV'],
    smokingAllowed: true,
    floor: 2,
    maxOccupancy: 2,
    size: 25,
    bedType: 'Queen',
    view: 'City'
  },
  { 
    id: '203', 
    number: '203', 
    type: 'double', 
    status: 'maintenance', 
    rate: 150, 
    photos: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
    smokingAllowed: false,
    floor: 2,
    maxOccupancy: 4,
    size: 35,
    bedType: 'Two Queens',
    view: 'Garden'
  },
  // VIP Rooms
  { 
    id: '301', 
    number: '301', 
    type: 'suite', 
    status: 'clean', 
    rate: 450, 
    photos: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Butler Service'],
    smokingAllowed: false,
    floor: 3,
    maxOccupancy: 6,
    size: 85,
    bedType: 'King + Sofa Bed',
    view: 'Ocean',
    isVipRoom: true,
    vipAmenities: ['Personal Butler', '24/7 Concierge', 'Premium Minibar', 'Champagne Welcome', 'Priority Housekeeping', 'Express Laundry'],
    vipRate: 400, // Special VIP rate (discounted)
    vipMinimumStay: 2,
    vipServices: ['Airport Transfer', 'Daily Newspaper', 'Turndown Service', 'Fresh Flowers']
  },
  { 
    id: '302', 
    number: '302', 
    type: 'deluxe', 
    status: 'clean', 
    rate: 350, 
    photos: ['https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Premium Bedding'],
    smokingAllowed: false,
    floor: 3,
    maxOccupancy: 4,
    size: 55,
    bedType: 'King',
    view: 'Ocean',
    isVipRoom: true,
    vipAmenities: ['Personal Concierge', 'Premium Minibar', 'Welcome Amenities', 'Priority Services'],
    vipRate: 320, // Special VIP rate
    vipMinimumStay: 1,
    vipServices: ['Late Checkout', 'Complimentary Breakfast', 'Spa Discount']
  },
  { 
    id: '401', 
    number: '401', 
    type: 'suite', 
    status: 'clean', 
    rate: 650, 
    photos: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'], 
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Private Terrace', 'Butler Service'],
    smokingAllowed: false,
    floor: 4,
    maxOccupancy: 8,
    size: 120,
    bedType: 'King + Queen + Sofa Bed',
    view: 'Panoramic Ocean',
    isVipRoom: true,
    vipAmenities: ['Dedicated Butler', '24/7 Concierge', 'Premium Everything', 'Champagne & Caviar Welcome', 'Private Chef Available', 'Helicopter Transfer'],
    vipRate: 550, // Special VIP rate
    vipMinimumStay: 3,
    vipServices: ['Private Dining', 'Spa Suite Access', 'Yacht Charter Discount', 'Personal Shopping']
  }
];

const DEMO_GUESTS: Guest[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@email.com', 
    phone: '+1-555-0101', 
    bookingHistory: [], 
    totalStays: 3, 
    lastStayDate: '2024-01-15', 
    preferredCurrency: 'USD',
    title: 'Mr.',
    company: 'Tech Solutions Inc.',
    nationality: 'American',
    address: '123 Main Street, New York, NY 10001, USA',
    dateOfBirth: '1985-06-15',
    vipStatus: false,
    loyaltyPoints: 1250,
    roomPreferences: {
      smokingRoom: false,
      floor: 'high',
      view: 'city',
      bedType: 'king'
    },
    identificationDetails: {
      type: 'passport',
      number: 'US123456789',
      issuingCountry: 'United States',
      expiryDate: '2028-06-15'
    },
    emergencyContactDetails: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0102',
      email: 'jane.doe@email.com'
    },
    specialRequests: ['Late checkout', 'Extra pillows'],
    dietaryRestrictions: ['Vegetarian']
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@email.com', 
    phone: '+1-555-0102', 
    bookingHistory: [], 
    totalStays: 1, 
    lastStayDate: '2024-01-20', 
    preferredCurrency: 'EUR',
    title: 'Dr.',
    company: 'Medical Associates',
    nationality: 'British',
    address: '456 Oak Avenue, London, UK',
    dateOfBirth: '1978-03-22',
    vipStatus: true,
    vipTier: 'platinum',
    vipSince: '2023-06-15',
    loyaltyPoints: 2800,
    roomPreferences: {
      smokingRoom: false,
      floor: 'any',
      view: 'ocean',
      bedType: 'queen'
    },
    identificationDetails: {
      type: 'passport',
      number: 'GB987654321',
      issuingCountry: 'United Kingdom',
      expiryDate: '2026-03-22'
    },
    emergencyContactDetails: {
      name: 'Robert Smith',
      relationship: 'Brother',
      phone: '+44-20-7946-0958',
      email: 'robert.smith@email.com'
    },
    specialRequests: ['Quiet room', 'High floor'],
    dietaryRestrictions: ['Gluten-free', 'No shellfish'],
    vipBenefits: ['Room Upgrades', 'Late Checkout', 'Complimentary Breakfast', 'Spa Discounts', 'Priority Reservations'],
    personalConcierge: 'concierge-001',
    vipPreferences: {
      preferredRoomType: 'suite',
      preferredFloor: 3,
      preferredAmenities: ['Ocean View', 'Jacuzzi', 'Butler Service'],
      specialServices: ['Airport Transfer', 'Personal Shopping', 'Restaurant Reservations'],
      dietaryRequirements: ['Gluten-free', 'Organic Options'],
      communicationPreference: 'email'
    }
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    email: 'carlos@email.com',
    phone: '+1-555-0103',
    bookingHistory: [],
    totalStays: 5,
    lastStayDate: '2024-01-10',
    preferredCurrency: 'USD',
    title: 'Mr.',
    company: 'Rodriguez Construction',
    nationality: 'Mexican',
    address: '789 Pine Street, Los Angeles, CA 90210, USA',
    dateOfBirth: '1982-11-08',
    vipStatus: false,
    loyaltyPoints: 890,
    roomPreferences: {
      smokingRoom: true,
      floor: 'low',
      view: 'garden',
      bedType: 'double'
    },
    identificationDetails: {
      type: 'drivers_license',
      number: 'CA-DL-123456789',
      issuingCountry: 'United States',
      expiryDate: '2027-11-08'
    },
    emergencyContactDetails: {
      name: 'Maria Rodriguez',
      relationship: 'Wife',
      phone: '+1-555-0104',
      email: 'maria.rodriguez@email.com'
    },
    specialRequests: ['Smoking room', 'Ground floor if possible'],
    dietaryRestrictions: []
  },
  // VIP Guests
  {
    id: '4',
    name: 'Alexander Blackwood',
    email: 'alex.blackwood@luxurygroup.com',
    phone: '+1-555-0201',
    bookingHistory: [],
    totalStays: 15,
    lastStayDate: '2024-01-05',
    preferredCurrency: 'USD',
    title: 'Mr.',
    company: 'Blackwood Luxury Group',
    nationality: 'American',
    address: '1 Park Avenue, New York, NY 10016, USA',
    dateOfBirth: '1975-09-12',
    vipStatus: true,
    vipTier: 'diamond',
    vipSince: '2022-01-01',
    loyaltyPoints: 8500,
    roomPreferences: {
      smokingRoom: false,
      floor: 'high',
      view: 'ocean',
      bedType: 'king'
    },
    identificationDetails: {
      type: 'passport',
      number: 'US987654321',
      issuingCountry: 'United States',
      expiryDate: '2029-09-12'
    },
    emergencyContactDetails: {
      name: 'Victoria Blackwood',
      relationship: 'Spouse',
      phone: '+1-555-0202',
      email: 'victoria.blackwood@email.com'
    },
    specialRequests: ['Presidential Suite Only', 'Private Butler', 'Helicopter Transfer'],
    dietaryRestrictions: ['Keto Diet'],
    vipBenefits: ['Presidential Suite Access', 'Private Butler', 'Helicopter Transfer', 'Michelin Star Chef', 'Yacht Charter', 'Private Jet Coordination'],
    personalConcierge: 'concierge-vip-001',
    vipPreferences: {
      preferredRoomType: 'suite',
      preferredFloor: 4,
      preferredAmenities: ['Panoramic Ocean View', 'Private Terrace', 'Butler Service', 'Jacuzzi'],
      specialServices: ['Helicopter Transfer', 'Private Chef', 'Yacht Charter', 'Personal Security'],
      dietaryRequirements: ['Keto-friendly', 'Organic', 'Premium Ingredients'],
      communicationPreference: 'phone'
    }
  },
  {
    id: '5',
    name: 'Isabella Chen',
    email: 'isabella.chen@techventures.com',
    phone: '+1-555-0301',
    bookingHistory: [],
    totalStays: 8,
    lastStayDate: '2024-01-12',
    preferredCurrency: 'USD',
    title: 'Ms.',
    company: 'Chen Tech Ventures',
    nationality: 'Singaporean',
    address: '88 Marina Bay, Singapore 018956',
    dateOfBirth: '1988-04-25',
    vipStatus: true,
    vipTier: 'gold',
    vipSince: '2023-03-10',
    loyaltyPoints: 4200,
    roomPreferences: {
      smokingRoom: false,
      floor: 'high',
      view: 'ocean',
      bedType: 'king'
    },
    identificationDetails: {
      type: 'passport',
      number: 'SG123456789',
      issuingCountry: 'Singapore',
      expiryDate: '2028-04-25'
    },
    emergencyContactDetails: {
      name: 'David Chen',
      relationship: 'Brother',
      phone: '+65-9123-4567',
      email: 'david.chen@email.com'
    },
    specialRequests: ['High-speed internet', 'Business center access', 'Quiet environment'],
    dietaryRestrictions: ['Pescatarian'],
    vipBenefits: ['Suite Upgrades', 'Express Check-in/out', 'Complimentary Breakfast', 'Business Center Access', 'Spa Credits'],
    personalConcierge: 'concierge-002',
    vipPreferences: {
      preferredRoomType: 'deluxe',
      preferredFloor: 3,
      preferredAmenities: ['Ocean View', 'High-speed WiFi', 'Work Desk'],
      specialServices: ['Business Support', 'Tech Setup', 'Meeting Room Access'],
      dietaryRequirements: ['Pescatarian', 'Asian Cuisine Options'],
      communicationPreference: 'email'
    }
  }
];

const DEMO_BOOKINGS: Booking[] = [
  {
    id: '1',
    guestId: '1',
    roomId: '102',
    checkIn: '2024-01-22',
    checkOut: '2024-01-25',
    status: 'checked-in',
    totalAmount: 450,
    currency: 'USD',
    charges: [
      { id: '1', description: 'Room Rate (3 nights)', amount: 450, currency: 'USD', date: '2024-01-22', category: 'room' }
    ],
    adults: 2,
    children: 0,
    source: 'direct',
    paymentStatus: 'paid',
    createdAt: '2024-01-20T10:00:00Z',
    confirmationNumber: 'HM2024001'
  }
];

const DEMO_BANQUET_HALLS: BanquetHall[] = [
  { 
    id: '1', 
    name: 'Grand Ballroom', 
    capacity: 200, 
    rate: 500, 
    photos: [
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
      'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg'
    ], 
    amenities: ['Stage', 'Audio System', 'Lighting', 'Dance Floor', 'Catering', 'Photography', 'Decorations', 'Parking']
  },
  { 
    id: '2', 
    name: 'Garden Pavilion', 
    capacity: 100, 
    rate: 300, 
    photos: [
      'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg',
      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
    ], 
    amenities: ['Outdoor Setting', 'Garden View', 'Natural Lighting', 'Catering', 'Photography']
  },
  {
    id: '3',
    name: 'Crystal Conference Hall',
    capacity: 80,
    rate: 400,
    photos: [
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg'
    ],
    amenities: ['Projector', 'Audio System', 'Air Conditioning', 'WiFi', 'Catering', 'Parking']
  },
  {
    id: '4',
    name: 'Rooftop Terrace',
    capacity: 150,
    rate: 450,
    photos: [
      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
      'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg',
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg'
    ],
    amenities: ['City View', 'Outdoor Setting', 'Bar Setup', 'Lighting', 'Catering', 'Photography', 'Weather Protection']
  },
  {
    id: '5',
    name: 'Intimate Dining Room',
    capacity: 40,
    rate: 200,
    photos: [
      'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg',
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg'
    ],
    amenities: ['Private Dining', 'Elegant Decor', 'Audio System', 'Catering', 'Wine Service']
  }
];

const DEMO_BANQUET_BOOKINGS: BanquetBooking[] = [
  {
    id: '1',
    hallId: '1',
    eventName: 'Johnson Wedding',
    clientName: 'Robert Johnson',
    clientEmail: 'robert@email.com',
    clientPhone: '+1-555-0201',
    date: '2024-02-14',
    startTime: '18:00',
    endTime: '23:00',
    attendees: 150,
    totalAmount: 2500,
    currency: 'USD',
    status: 'confirmed'
  },
  {
    id: '2',
    hallId: '3',
    eventName: 'Corporate Annual Meeting',
    clientName: 'Sarah Williams',
    clientEmail: 'sarah.williams@techcorp.com',
    clientPhone: '+1-555-0202',
    date: '2024-02-20',
    startTime: '09:00',
    endTime: '17:00',
    attendees: 75,
    totalAmount: 3200,
    currency: 'USD',
    status: 'confirmed'
  }
];

const DEMO_RESTAURANT_TABLES: RestaurantTable[] = [
  { id: '1', number: '1', seats: 2, status: 'available', position: { x: 50, y: 50 } },
  { id: '2', number: '2', seats: 4, status: 'occupied', position: { x: 150, y: 50 } },
  { id: '3', number: '3', seats: 6, status: 'reserved', position: { x: 250, y: 50 } },
  { id: '4', number: '4', seats: 2, status: 'available', position: { x: 50, y: 150 } },
  { id: '5', number: '5', seats: 4, status: 'available', position: { x: 150, y: 150 } },
  { id: '6', number: '6', seats: 8, status: 'cleaning', position: { x: 250, y: 150 } },
];

const DEMO_TABLE_RESERVATIONS: TableReservation[] = [
  {
    id: '1',
    tableId: '3',
    guestName: 'Emily Davis',
    guestPhone: '+1-555-0301',
    date: '2024-01-23',
    time: '19:30',
    partySize: 4,
    status: 'confirmed'
  }
];

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(DEMO_ROOMS);
  const [guests, setGuests] = useState<Guest[]>(DEMO_GUESTS);
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS);
  const [banquetHalls, setBanquetHalls] = useState<BanquetHall[]>(DEMO_BANQUET_HALLS);
  const [banquetBookings, setBanquetBookings] = useState<BanquetBooking[]>(DEMO_BANQUET_BOOKINGS);
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>(DEMO_RESTAURANT_TABLES);
  const [tableReservations, setTableReservations] = useState<TableReservation[]>(DEMO_TABLE_RESERVATIONS);
  const [roomServiceOrders, setRoomServiceOrders] = useState<RoomServiceOrder[]>([]);

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status } : room
    ));
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString()
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (roomId: string, roomData: Omit<Room, 'id' | 'status'>) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, ...roomData } : room
    ));
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const addGuest = (guestData: Omit<Guest, 'id' | 'bookingHistory' | 'totalStays'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: Date.now().toString(),
      bookingHistory: [],
      totalStays: 0
    };
    setGuests(prev => [...prev, newGuest]);
  };

  const updateGuest = (guestId: string, guestData: Partial<Guest>) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, ...guestData } : guest
    ));
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'charges'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      currency: bookingData.currency || 'USD',
      charges: []
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status } : booking
    ));
  };

  const addRoomCharge = (bookingId: string, chargeData: Omit<RoomCharge, 'id'>) => {
    const newCharge: RoomCharge = {
      ...chargeData,
      id: Date.now().toString()
    };
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, charges: [...booking.charges, newCharge] }
        : booking
    ));
  };

  const addBanquetBooking = (bookingData: Omit<BanquetBooking, 'id'>) => {
    const newBooking: BanquetBooking = {
      ...bookingData,
      id: Date.now().toString(),
      currency: bookingData.currency || 'USD'
    };
    setBanquetBookings(prev => [...prev, newBooking]);
  };

  const addBanquetHall = (hallData: Omit<BanquetHall, 'id'>) => {
    const newHall: BanquetHall = {
      ...hallData,
      id: Date.now().toString()
    };
    setBanquetHalls(prev => [...prev, newHall]);
  };

  const updateBanquetHall = (hallId: string, hallData: Omit<BanquetHall, 'id'>) => {
    setBanquetHalls(prev => prev.map(hall => 
      hall.id === hallId ? { ...hall, ...hallData } : hall
    ));
  };

  const deleteBanquetHall = (hallId: string) => {
    setBanquetHalls(prev => prev.filter(hall => hall.id !== hallId));
  };

  const updateTableStatus = (tableId: string, status: RestaurantTable['status']) => {
    setRestaurantTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };

  const addTableReservation = (reservationData: Omit<TableReservation, 'id'>) => {
    const newReservation: TableReservation = {
      ...reservationData,
      id: Date.now().toString()
    };
    setTableReservations(prev => [...prev, newReservation]);
  };

  const addRestaurantTable = (tableData: Omit<RestaurantTable, 'id'>) => {
    const newTable: RestaurantTable = {
      ...tableData,
      id: Date.now().toString()
    };
    setRestaurantTables(prev => [...prev, newTable]);
  };

  const updateRestaurantTable = (tableId: string, tableData: Omit<RestaurantTable, 'id' | 'status'>) => {
    setRestaurantTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, ...tableData } : table
    ));
  };

  const deleteRestaurantTable = (tableId: string) => {
    setRestaurantTables(prev => prev.filter(table => table.id !== tableId));
  };

  const addRoomServiceOrder = (orderData: Omit<RoomServiceOrder, 'id'>) => {
    const newOrder: RoomServiceOrder = {
      ...orderData,
      id: Date.now().toString()
    };
    setRoomServiceOrders(prev => [...prev, newOrder]);
  };

  const updateRoomServiceOrderStatus = (orderId: string, status: RoomServiceOrder['status']) => {
    setRoomServiceOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  return (
    <HotelContext.Provider value={{
      rooms,
      updateRoomStatus,
      addRoom,
      updateRoom,
      deleteRoom,
      guests,
      addGuest,
      updateGuest,
      bookings,
      addBooking,
      updateBookingStatus,
      addRoomCharge,
      banquetHalls,
      banquetBookings,
      addBanquetBooking,
      addBanquetHall,
      updateBanquetHall,
      deleteBanquetHall,
      restaurantTables,
      tableReservations,
      updateTableStatus,
      addTableReservation,
      addRestaurantTable,
      updateRestaurantTable,
      deleteRestaurantTable,
      roomServiceOrders,
      addRoomServiceOrder,
      updateRoomServiceOrderStatus
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
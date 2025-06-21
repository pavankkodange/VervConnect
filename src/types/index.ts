export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'front-desk' | 'housekeeping' | 'restaurant';
  password?: string; // Only used during creation/update
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
  department?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  notes?: string;
  twoFactorEnabled?: boolean;
  passwordLastChanged?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  // Shift Management
  currentShift?: {
    isOnShift: boolean;
    shiftStart: string; // HH:MM format
    shiftEnd: string; // HH:MM format
    shiftType: 'day' | 'evening' | 'night';
    clockedInAt?: string; // ISO timestamp
    clockedOutAt?: string; // ISO timestamp
    breakStart?: string; // ISO timestamp
    breakEnd?: string; // ISO timestamp
    location?: string; // Work location/department
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
}

export interface HotelSettings {
  baseCurrency: string;
  displayCurrency: string;
  autoConvert: boolean;
  decimalPlaces: number;
  showCurrencyCode: boolean;
}

// Hotel Branding Configuration
export interface HotelBranding {
  id: string;
  hotelName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    fax?: string;
  };
  description: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  timeZone: string;
  starRating: number;
  establishedYear?: number;
  licenseNumber?: string;
  taxId?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  policies: {
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
    childPolicy: string;
  };
  theme: {
    headerStyle: 'modern' | 'classic' | 'minimal';
    sidebarStyle: 'dark' | 'light' | 'colored';
    cardStyle: 'rounded' | 'square' | 'elevated';
    fontFamily: 'inter' | 'roboto' | 'poppins' | 'montserrat';
  };
  customCSS?: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'clean' | 'dirty' | 'occupied' | 'out-of-order' | 'maintenance';
  rate: number;
  photos: string[];
  amenities: string[];
  floor?: number;
  maxOccupancy?: number;
  size?: number; // in square meters
  bedType?: string;
  view?: string;
  smokingAllowed?: boolean; // New field for smoking/non-smoking
  lastCleaned?: string;
  maintenanceNotes?: string;
  // VIP Room Features
  isVipRoom?: boolean; // Designates if this is a VIP-only room
  vipAmenities?: string[]; // Special VIP amenities
  vipRate?: number; // Special VIP pricing (optional override)
  vipMinimumStay?: number; // Minimum nights for VIP bookings
  vipServices?: string[]; // Included VIP services
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingHistory: Booking[];
  totalStays: number;
  lastStayDate?: string;
  preferredCurrency?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  address?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string[];
  preferences?: string[];
  loyaltyPoints?: number;
  vipStatus?: boolean;
  blacklisted?: boolean;
  notes?: string;
  // Additional guest details for enhanced display
  company?: string;
  title?: string; // Mr., Mrs., Dr., etc.
  specialRequests?: string[];
  roomPreferences?: {
    smokingRoom?: boolean;
    floor?: 'low' | 'high' | 'any';
    view?: string;
    bedType?: string;
  };
  identificationDetails?: {
    type: 'passport' | 'drivers_license' | 'national_id';
    number: string;
    issuingCountry?: string;
    expiryDate?: string;
  };
  emergencyContactDetails?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  // VIP Guest Features
  vipTier?: 'gold' | 'platinum' | 'diamond'; // VIP membership tiers
  vipSince?: string; // Date when VIP status was granted
  vipBenefits?: string[]; // List of VIP benefits
  personalConcierge?: string; // Assigned concierge ID
  vipPreferences?: {
    preferredRoomType?: string;
    preferredFloor?: number;
    preferredAmenities?: string[];
    specialServices?: string[];
    dietaryRequirements?: string[];
    communicationPreference?: 'email' | 'phone' | 'sms';
  };
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  totalAmount: number;
  currency: string;
  specialRequests?: string;
  charges: RoomCharge[];
  adults: number;
  children: number;
  source: 'direct' | 'booking.com' | 'expedia' | 'phone' | 'walk-in';
  confirmationNumber?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  depositAmount?: number;
  cancellationPolicy?: string;
  rateCode?: string;
  packageDeals?: string[];
  groupBookingId?: string;
  createdAt: string;
  modifiedAt?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  roomUpgrade?: boolean;
  compStatus?: 'none' | 'partial' | 'full';
  invoiceGenerated?: boolean;
  // VIP Booking Features
  isVipBooking?: boolean; // Indicates if this is a VIP booking
  vipServices?: string[]; // VIP services included in booking
  vipUpgrades?: string[]; // Complimentary upgrades provided
  priorityCheckin?: boolean; // Skip regular check-in queue
  personalizedWelcome?: string; // Custom welcome message/setup
}

export interface RoomCharge {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: 'room' | 'restaurant' | 'spa' | 'other' | 'room-service' | 'minibar' | 'laundry' | 'telephone' | 'internet';
  taxAmount?: number;
  discountAmount?: number;
  staffId?: string;
  approved?: boolean;
  refunded?: boolean;
  invoiceId?: string;
}

export interface BanquetHall {
  id: string;
  name: string;
  capacity: number;
  rate: number;
  photos: string[];
  amenities: string[];
  size?: number;
  location?: string;
  setupOptions?: string[];
  cateringOptions?: string[];
  availableEquipment?: string[];
  minimumHours?: number;
  cancellationPolicy?: string;
}

export interface BanquetBooking {
  id: string;
  hallId: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  totalAmount: number;
  currency: string;
  specialRequirements?: string;
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  eventType?: string;
  setupType?: string;
  cateringPackage?: string;
  decorationRequests?: string;
  equipmentNeeded?: string[];
  contactPerson?: string;
  billingAddress?: string;
  paymentTerms?: string;
  depositPaid?: boolean;
  contractSigned?: boolean;
  finalHeadcount?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  eventNotes?: string;
  followUpRequired?: boolean;
}

export interface RestaurantTable {
  id: string;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position: { x: number; y: number };
  section?: string;
  serverAssigned?: string;
  tableType?: 'indoor' | 'outdoor' | 'private';
  smoking?: boolean;
  accessibility?: boolean;
  lastCleaned?: string;
  reservationId?: string;
}

export interface TableReservation {
  id: string;
  tableId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: 'confirmed' | 'seated' | 'completed' | 'no-show' | 'cancelled';
  occasion?: string;
  dietaryRestrictions?: string[];
  seatingPreference?: string;
  estimatedDuration?: number;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  serverAssigned?: string;
  billAmount?: number;
  paymentMethod?: string;
  rating?: number;
  feedback?: string;
}

// Room Service Types
export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  availableHours: {
    start: string;
    end: string;
  };
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  available: boolean;
  preparationTime: number; // in minutes
  dietary: string[]; // vegetarian, vegan, gluten-free, etc.
  spicyLevel?: number; // 1-5 scale
  popular?: boolean;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
}

export interface RoomServiceOrder {
  id: string;
  bookingId: string;
  guestId: string;
  roomNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderTime: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  specialInstructions?: string;
  paymentMethod: 'room-charge' | 'cash' | 'card';
  deliveryStaff?: string;
  kitchenNotes?: string;
  customerRating?: number;
  customerFeedback?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialRequests?: string;
  modifications?: string[];
}

// Communication Hub Types
export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  recipientType: 'user' | 'department' | 'all' | 'guest';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'maintenance' | 'guest-request' | 'emergency' | 'announcement';
  attachments?: string[];
  parentMessageId?: string; // For replies
  guestId?: string; // If message is to/from guest
  roomNumber?: string;
  department?: string;
  expiresAt?: string;
  actionRequired?: boolean;
  actionCompleted?: boolean;
  tags?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'booking' | 'maintenance' | 'guest' | 'system' | 'payment' | 'security';
  priority: 'low' | 'normal' | 'high';
  expiresAt?: string;
  metadata?: any;
}

export interface GuestCommunication {
  id: string;
  guestId: string;
  bookingId?: string;
  type: 'email' | 'sms' | 'in-app' | 'phone';
  subject?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateId?: string;
  scheduledFor?: string;
  sentBy: string;
  category: 'welcome' | 'confirmation' | 'reminder' | 'survey' | 'marketing' | 'service';
  responseReceived?: boolean;
  responseContent?: string;
  responseTimestamp?: string;
}

// Financial Management Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  guestId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
  terms?: string;
  createdBy: string;
  sentDate?: string;
  remindersSent: number;
  lastReminderDate?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  category: string;
  date: string;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  bookingId?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank-transfer' | 'check' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  reference?: string;
  processedBy: string;
  processedAt: string;
  gatewayResponse?: any;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  notes?: string;
}

export interface FinancialReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  data: {
    totalRevenue: number;
    roomRevenue: number;
    restaurantRevenue: number;
    banquetRevenue: number;
    otherRevenue: number;
    totalExpenses: number;
    netProfit: number;
    occupancyRate: number;
    averageDailyRate: number;
    revenuePAR: number;
    guestCount: number;
    averageStayLength: number;
    cancellationRate: number;
    noShowRate: number;
  };
  currency: string;
  notes?: string;
}

// Operational Efficiency Types
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  department: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'maintenance' | 'housekeeping' | 'guest-service' | 'administrative' | 'security';
  dueDate?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  roomNumber?: string;
  guestId?: string;
  bookingId?: string;
  notes?: string;
  attachments?: string[];
  recurring?: boolean;
  recurringPattern?: string;
  parentTaskId?: string;
  subtasks?: string[];
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  trigger: 'manual' | 'check-in' | 'check-out' | 'maintenance-request' | 'guest-complaint';
  steps: WorkflowStep[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  usageCount: number;
}

export interface WorkflowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  assignedRole: string;
  estimatedDuration: number;
  required: boolean;
  autoComplete?: boolean;
  conditions?: any;
  nextSteps?: string[];
}

export interface Inventory {
  id: string;
  itemName: string;
  category: 'amenities' | 'cleaning' | 'maintenance' | 'food' | 'beverage' | 'office';
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
  barcode?: string;
  notes?: string;
  autoReorder: boolean;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber?: string;
  area: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'reported' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'furniture' | 'appliance' | 'structural' | 'other';
  estimatedCost?: number;
  actualCost?: number;
  partsUsed?: string[];
  workDescription?: string;
  preventiveMaintenance: boolean;
  recurringSchedule?: string;
  nextScheduledDate?: string;
  photos?: string[];
  notes?: string;
  guestImpact: boolean;
  roomOutOfOrder: boolean;
}

// Security & Compliance Types
export interface SecurityLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'authentication' | 'authorization' | 'data-access' | 'system' | 'user-action';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AccessControl {
  id: string;
  userId: string;
  resource: string;
  permissions: string[];
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  conditions?: any;
  active: boolean;
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'pci-dss' | 'sox' | 'custom';
  generatedAt: string;
  generatedBy: string;
  period: {
    startDate: string;
    endDate: string;
  };
  findings: ComplianceFinding[];
  status: 'compliant' | 'non-compliant' | 'partial';
  recommendations?: string[];
  nextReviewDate: string;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  assignedTo?: string;
  dueDate?: string;
  resolution?: string;
  resolvedAt?: string;
}

// Advanced Booking Types
export interface GroupBooking {
  id: string;
  groupName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  totalRooms: number;
  checkIn: string;
  checkOut: string;
  status: 'inquiry' | 'quoted' | 'confirmed' | 'cancelled';
  specialRates?: number;
  blockCode?: string;
  roomsBlocked: string[];
  roomsBooked: string[];
  contractTerms?: string;
  paymentTerms?: string;
  cancellationPolicy?: string;
  amenitiesIncluded?: string[];
  meetingRoomsRequired?: boolean;
  cateringRequired?: boolean;
  transportationRequired?: boolean;
  notes?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface PackageDeal {
  id: string;
  name: string;
  description: string;
  inclusions: string[];
  price: number;
  currency: string;
  validFrom: string;
  validTo: string;
  minimumStay?: number;
  maximumStay?: number;
  roomTypes: string[];
  blackoutDates?: string[];
  advanceBookingRequired?: number;
  cancellationPolicy?: string;
  active: boolean;
  bookingCount: number;
  revenue: number;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed-amount' | 'free-nights';
  value: number;
  description: string;
  validFrom: string;
  validTo: string;
  minimumStay?: number;
  roomTypes?: string[];
  maxUsage?: number;
  currentUsage: number;
  stackable: boolean;
  active: boolean;
  conditions?: any;
}

export interface Waitlist {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  requestedDates: {
    checkIn: string;
    checkOut: string;
  };
  roomType?: string;
  partySize: number;
  priority: number;
  status: 'active' | 'contacted' | 'booked' | 'expired' | 'cancelled';
  createdAt: string;
  contactAttempts: number;
  lastContactedAt?: string;
  notes?: string;
  maxPrice?: number;
  flexibleDates: boolean;
  alternativeDates?: Array<{checkIn: string; checkOut: string}>;
}
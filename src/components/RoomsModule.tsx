import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CreditCard,
  Receipt,
  X,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Check,
  Building,
  Home,
  Sparkles,
  Crown,
  Diamond,
  Award,
  Shield,
  Camera,
  FileImage,
  FilePlus,
  Paperclip,
  ExternalLink
} from 'lucide-react';
import { Room, Guest, Booking } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    view?: string;
    dateFilter?: string;
    action?: string;
    revenueFilter?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    guests, 
    bookings, 
    updateRoomStatus, 
    addGuest, 
    updateGuest, 
    addBooking, 
    updateBookingStatus,
    addRoomCharge
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { formatDateTime, getCurrentDate, getCurrentTime } = useBranding();
  const { user } = useAuth();
  
  const [view, setView] = useState<'rooms' | 'bookings' | 'guests'>('rooms');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.dateFilter) {
        if (filters.dateFilter === 'check-in-today' || filters.dateFilter === 'check-out-today' || filters.dateFilter === 'today') {
          setView('bookings');
        }
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
      }
    }
  }, [filters]);

  // Document upload handler
  const handleDocumentUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Document type validator
  const isValidDocumentFile = (file: File): boolean => {
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  // Document Gallery Component for ID documents
  const DocumentGallery = ({ 
    documents, 
    onAdd, 
    onRemove, 
    title = "ID Documents",
    maxDocuments = 5 
  }: {
    documents: Array<{id: string, type: string, documentName: string, fileUrl: string, fileType: string, fileName: string, uploadedAt: string, verified?: boolean}>;
    onAdd: (document: {type: string, documentName: string, fileUrl: string, fileType: string, fileName: string}) => void;
    onRemove: (documentId: string) => void;
    title?: string;
    maxDocuments?: number;
  }) => {
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState('passport');

    const handleDocumentFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (documents.length >= maxDocuments) {
          alert(`Maximum ${maxDocuments} documents allowed`);
          return;
        }
        
        if (!isValidDocumentFile(file)) {
          alert('Please upload a valid document (JPG, PNG, GIF, WebP, PDF) under 10MB');
          return;
        }
        
        setUploadingDocument(true);
        try {
          const documentUrl = await handleDocumentUpload(file);
          const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
          
          onAdd({
            type: selectedDocumentType,
            documentName: getDocumentTypeName(selectedDocumentType),
            fileUrl: documentUrl,
            fileType: fileType,
            fileName: file.name
          });
        } catch (error) {
          alert('Failed to upload document');
        } finally {
          setUploadingDocument(false);
        }
      }
    };

    const getDocumentTypeName = (type: string) => {
      const typeNames = {
        'passport': 'Passport',
        'drivers_license': 'Driver\'s License',
        'national_id': 'National ID Card',
        'visa': 'Visa Document',
        'other': 'Other Document'
      };
      return typeNames[type as keyof typeof typeNames] || 'Document';
    };

    const getDocumentIcon = (fileType: string) => {
      return fileType === 'pdf' ? <FileText className="w-8 h-8" /> : <FileImage className="w-8 h-8" />;
    };

    const getDocumentTypeIcon = (type: string) => {
      switch (type) {
        case 'passport': return <Shield className="w-4 h-4" />;
        case 'drivers_license': return <CreditCard className="w-4 h-4" />;
        case 'national_id': return <User className="w-4 h-4" />;
        case 'visa': return <FileText className="w-4 h-4" />;
        default: return <Paperclip className="w-4 h-4" />;
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{title}</label>
        
        {/* Current Documents */}
        {documents.length > 0 && (
          <div className="space-y-3 mb-6">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-gray-50">
                <div className="flex-shrink-0 text-gray-400">
                  {getDocumentIcon(doc.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getDocumentTypeIcon(doc.type)}
                    <p className="text-sm font-medium text-gray-900">{doc.documentName}</p>
                    {doc.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{doc.fileName}</p>
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Preview for images */}
                {doc.fileType === 'image' && (
                  <div className="flex-shrink-0">
                    <img
                      src={doc.fileUrl}
                      alt={doc.documentName}
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onRemove(doc.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Document */}
        {documents.length < maxDocuments && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center mb-4">
              <FilePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload ID Documents</p>
              <p className="text-xs text-gray-500 mb-4">
                {documents.length}/{maxDocuments} documents • Max 10MB • Supported: JPG, PNG, GIF, WebP, PDF
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                  <option value="visa">Visa Document</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentFileUpload}
                  disabled={uploadingDocument}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploadingDocument && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Uploading document...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">Accepted ID Documents:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Passport (image or PDF scan)</li>
                <li>Driver's License (image or PDF scan)</li>
                <li>National ID Card (image or PDF scan)</li>
                <li>Visa documents (PDF preferred)</li>
                <li>Other government-issued ID</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getVipTierIcon = (tier?: string) => {
    switch (tier) {
      case 'diamond': return <Diamond className="w-4 h-4 text-purple-600" />;
      case 'platinum': return <Award className="w-4 h-4 text-gray-600" />;
      case 'gold': return <Crown className="w-4 h-4 text-yellow-600" />;
      default: return <Star className="w-4 h-4 text-blue-600" />;
    }
  };

  const getVipTierColor = (tier?: string) => {
    switch (tier) {
      case 'diamond': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'platinum': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = !statusFilter || room.status === statusFilter;
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredBookings = bookings.filter(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    const matchesSearch = !searchTerm || 
      guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.includes(searchTerm) ||
      booking.confirmationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply date filters from dashboard
    if (filters?.dateFilter === 'check-in-today') {
      return matchesSearch && booking.checkIn === getCurrentDate();
    }
    if (filters?.dateFilter === 'check-out-today') {
      return matchesSearch && booking.checkOut === getCurrentDate();
    }
    if (filters?.dateFilter === 'today') {
      const today = getCurrentDate();
      return matchesSearch && (booking.checkIn === today || booking.checkOut === today);
    }
    
    return matchesSearch;
  });

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = !searchTerm || 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm);
    return matchesSearch;
  });

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: editingGuest?.name || '',
      email: editingGuest?.email || '',
      phone: editingGuest?.phone || '',
      title: editingGuest?.title || 'Mr.',
      company: editingGuest?.company || '',
      nationality: editingGuest?.nationality || '',
      address: editingGuest?.address || '',
      dateOfBirth: editingGuest?.dateOfBirth || '',
      preferredCurrency: editingGuest?.preferredCurrency || hotelSettings.baseCurrency,
      vipStatus: editingGuest?.vipStatus || false,
      vipTier: editingGuest?.vipTier || 'gold',
      specialRequests: editingGuest?.specialRequests?.join(', ') || '',
      dietaryRestrictions: editingGuest?.dietaryRestrictions?.join(', ') || '',
      identificationDetails: {
        type: editingGuest?.identificationDetails?.type || 'passport',
        number: editingGuest?.identificationDetails?.number || '',
        issuingCountry: editingGuest?.identificationDetails?.issuingCountry || '',
        expiryDate: editingGuest?.identificationDetails?.expiryDate || ''
      },
      emergencyContactDetails: {
        name: editingGuest?.emergencyContactDetails?.name || '',
        relationship: editingGuest?.emergencyContactDetails?.relationship || '',
        phone: editingGuest?.emergencyContactDetails?.phone || '',
        email: editingGuest?.emergencyContactDetails?.email || ''
      },
      roomPreferences: {
        smokingRoom: editingGuest?.roomPreferences?.smokingRoom || false,
        floor: editingGuest?.roomPreferences?.floor || 'any',
        view: editingGuest?.roomPreferences?.view || '',
        bedType: editingGuest?.roomPreferences?.bedType || ''
      }
    });

    const [idDocuments, setIdDocuments] = useState(editingGuest?.idDocuments || []);

    const handleAddDocument = (documentData: {type: string, documentName: string, fileUrl: string, fileType: string, fileName: string}) => {
      const newDocument = {
        id: Date.now().toString(),
        ...documentData,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.id || 'unknown',
        verified: false
      };
      setIdDocuments(prev => [...prev, newDocument]);
    };

    const handleRemoveDocument = (documentId: string) => {
      setIdDocuments(prev => prev.filter(doc => doc.id !== documentId));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const guestData = {
        ...formData,
        specialRequests: formData.specialRequests.split(',').map(s => s.trim()).filter(Boolean),
        dietaryRestrictions: formData.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
        idDocuments,
        lastStayDate: editingGuest?.lastStayDate,
        totalStays: editingGuest?.totalStays || 0,
        loyaltyPoints: editingGuest?.loyaltyPoints || 0,
        bookingHistory: editingGuest?.bookingHistory || []
      };

      if (editingGuest) {
        updateGuest(editingGuest.id, guestData);
      } else {
        addGuest(guestData);
      }
      
      setShowGuestForm(false);
      setEditingGuest(null);
      setIdDocuments([]);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h3>
              <button
                onClick={() => {
                  setShowGuestForm(false);
                  setEditingGuest(null);
                  setIdDocuments([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                    <select
                      value={formData.preferredCurrency}
                      onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* ID Documents Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Identification Documents</h4>
                <DocumentGallery
                  documents={idDocuments}
                  onAdd={handleAddDocument}
                  onRemove={handleRemoveDocument}
                  title="Upload ID Documents"
                  maxDocuments={5}
                />
              </div>

              {/* Identification Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Primary Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                    <select
                      value={formData.identificationDetails.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: { ...formData.identificationDetails, type: e.target.value as any }
                      })}
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
                      value={formData.identificationDetails.number}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: { ...formData.identificationDetails, number: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Country</label>
                    <input
                      type="text"
                      value={formData.identificationDetails.issuingCountry}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: { ...formData.identificationDetails, issuingCountry: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.identificationDetails.expiryDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: { ...formData.identificationDetails, expiryDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* VIP Status */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">VIP Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.vipStatus}
                        onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">VIP Guest</span>
                    </label>
                  </div>
                  {formData.vipStatus && (
                    <div>
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
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactDetails.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: { ...formData.emergencyContactDetails, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactDetails.relationship}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: { ...formData.emergencyContactDetails, relationship: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactDetails.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: { ...formData.emergencyContactDetails, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.emergencyContactDetails.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: { ...formData.emergencyContactDetails, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences & Notes</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <input
                      type="text"
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Separate multiple requests with commas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                    <input
                      type="text"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Separate multiple restrictions with commas"
                    />
                  </div>
                </div>
              </div>

              {/* Room Preferences */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.roomPreferences.smokingRoom}
                        onChange={(e) => setFormData({
                          ...formData,
                          roomPreferences: { ...formData.roomPreferences, smokingRoom: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Smoking Room</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor Preference</label>
                    <select
                      value={formData.roomPreferences.floor}
                      onChange={(e) => setFormData({
                        ...formData,
                        roomPreferences: { ...formData.roomPreferences, floor: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="any">Any Floor</option>
                      <option value="low">Low Floor</option>
                      <option value="high">High Floor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">View Preference</label>
                    <input
                      type="text"
                      value={formData.roomPreferences.view}
                      onChange={(e) => setFormData({
                        ...formData,
                        roomPreferences: { ...formData.roomPreferences, view: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Ocean, City, Garden"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type Preference</label>
                    <input
                      type="text"
                      value={formData.roomPreferences.bedType}
                      onChange={(e) => setFormData({
                        ...formData,
                        roomPreferences: { ...formData.roomPreferences, bedType: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., King, Queen, Twin"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestForm(false);
                    setEditingGuest(null);
                    setIdDocuments([]);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingGuest ? 'Update Guest' : 'Create Guest'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as const
    });

    const availableRooms = rooms.filter(room => room.status === 'clean');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const room = rooms.find(r => r.id === formData.roomId);
      if (room) {
        const nights = Math.ceil(
          (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        addBooking({
          ...formData,
          status: 'confirmed',
          totalAmount: room.rate * nights,
          currency: hotelSettings.baseCurrency,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          confirmationNumber: `HM${Date.now().toString().slice(-6)}`
        });
        
        updateRoomStatus(formData.roomId, 'occupied');
        setShowBookingForm(false);
        setFormData({
          guestId: '', roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '', source: 'direct'
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">New Booking</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest</label>
                <select
                  value={formData.guestId}
                  onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a guest</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} - {guest.email}
                    </option>
                  ))}
                </select>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
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
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => setShowGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'rooms', name: 'Rooms', icon: Bed },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'guests', name: 'Guests', icon: Users }
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

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${view}...`}
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
                {room.photos && room.photos.length > 0 ? (
                  <img
                    src={room.photos[0]}
                    alt={`Room ${room.number}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                {room.isVipRoom && (
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      <Diamond className="w-3 h-3" />
                      <span>VIP</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}/night</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{room.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2}</span>
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
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (room.status === 'clean') {
                        updateRoomStatus(room.id, 'dirty');
                      } else if (room.status === 'dirty') {
                        updateRoomStatus(room.id, 'clean');
                      }
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      room.status === 'clean'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : room.status === 'dirty'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={!['clean', 'dirty'].includes(room.status)}
                  >
                    {room.status === 'clean' ? 'Mark Dirty' : room.status === 'dirty' ? 'Mark Clean' : 'Change Status'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings View */}
      {view === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
          </div>
          
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
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{guest?.name.charAt(0)}</span>
                            </div>
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
                              onClick={() => updateBookingStatus(booking.id, 'checked-in')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check In
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBillGenerator(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Check Out
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => {
                                // Show charge form or add a charge directly
                                const description = prompt('Enter charge description:');
                                const amount = parseFloat(prompt('Enter amount:') || '0');
                                if (description && amount > 0) {
                                  addRoomCharge(booking.id, {
                                    description,
                                    amount,
                                    currency: booking.currency,
                                    date: new Date().toISOString().split('T')[0],
                                    category: 'other'
                                  });
                                  alert('Charge added successfully!');
                                }
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Add Charge
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

      {/* Guests View */}
      {view === 'guests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stays</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">{guest.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                            {guest.vipStatus && (
                              <div className="flex items-center space-x-1">
                                {getVipTierIcon(guest.vipTier)}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVipTierColor(guest.vipTier)}`}>
                                  {guest.vipTier?.toUpperCase() || 'VIP'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{guest.nationality}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.vipStatus ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          VIP
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.totalStays} stays
                      {guest.lastStayDate && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(guest.lastStayDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {guest.idDocuments?.length || 0} documents
                        </span>
                        {guest.idDocuments && guest.idDocuments.length > 0 && (
                          <div className="flex -space-x-1">
                            {guest.idDocuments.slice(0, 3).map((doc, index) => (
                              <div 
                                key={index} 
                                className={`w-6 h-6 rounded-full flex items-center justify-center border border-white ${
                                  doc.fileType === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                                }`}
                                title={doc.documentName}
                              >
                                {doc.fileType === 'pdf' ? 
                                  <FileText className="w-3 h-3 text-red-600" /> : 
                                  <FileImage className="w-3 h-3 text-blue-600" />
                                }
                              </div>
                            ))}
                            {guest.idDocuments.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-white">
                                <span className="text-xs text-gray-600">+{guest.idDocuments.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingGuest(guest);
                            setShowGuestForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowBookingForm(true);
                            // Pre-fill the booking form with this guest
                            // This would need to be implemented
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showGuestForm && <GuestForm />}
      {showBookingForm && <BookingForm />}
      {showBillGenerator && selectedBooking && (
        <BillGenerator
          booking={selectedBooking}
          guest={guests.find(g => g.id === selectedBooking.guestId)!}
          room={rooms.find(r => r.id === selectedBooking.roomId)!}
          onClose={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
          }}
          onCheckoutComplete={() => {
            updateRoomStatus(selectedBooking.roomId, 'dirty');
          }}
        />
      )}
    </div>
  );
}
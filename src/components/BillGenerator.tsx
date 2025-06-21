import React, { useRef, useState } from 'react';
import { useBranding } from '../context/BrandingContext';
import { useCurrency } from '../context/CurrencyContext';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Mail, 
  Printer, 
  X, 
  FileText, 
  Send,
  Check,
  AlertCircle,
  Building,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { Booking, Guest, Room } from '../types';

interface BillGeneratorProps {
  booking: Booking;
  guest: Guest;
  room: Room;
  onClose: () => void;
  onCheckoutComplete?: () => void;
}

export function BillGenerator({ booking, guest, room, onClose, onCheckoutComplete }: BillGeneratorProps) {
  const { branding, formatDateTime, getCurrentDateTime } = useBranding();
  const { formatCurrency } = useCurrency();
  const { updateBookingStatus, updateRoomStatus } = useHotel();
  const { user } = useAuth();
  const billRef = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    to: guest.email,
    subject: `Invoice - ${branding.hotelName} - Booking #${booking.id.slice(-6)}`,
    message: `Dear ${guest.name},\n\nThank you for staying with us at ${branding.hotelName}. Please find your invoice attached.\n\nWe hope you enjoyed your stay and look forward to welcoming you back soon.\n\nBest regards,\n${branding.hotelName} Team`
  });

  // Calculate bill details
  const totalCharges = booking.charges.reduce((sum, charge) => sum + charge.amount, 0);
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const roomRate = room.rate;
  const roomTotal = roomRate * nights;
  
  // Tax calculation (10% for demo)
  const subtotal = totalCharges;
  const taxRate = 0.10;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  // Invoice number generation
  const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.id.slice(-6)}`;
  const invoiceDate = formatDateTime(getCurrentDateTime());

  const generatePDF = async () => {
    if (!billRef.current) return;

    setIsGenerating(true);
    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.4';
      tempContainer.style.color = '#000';
      
      // Clone the bill content
      const billClone = billRef.current.cloneNode(true) as HTMLElement;
      billClone.style.padding = '20px';
      billClone.style.maxWidth = 'none';
      billClone.style.boxShadow = 'none';
      billClone.style.border = 'none';
      billClone.style.borderRadius = '0';
      
      tempContainer.appendChild(billClone);
      document.body.appendChild(tempContainer);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      const fileName = `Invoice_${invoiceNumber}_${guest.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const printBill = () => {
    if (!billRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billHTML = billRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            .no-print { display: none !important; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 14px; }
            .text-xl { font-size: 16px; }
            .text-2xl { font-size: 18px; }
            .text-3xl { font-size: 20px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-4 { margin-top: 16px; }
            .mt-6 { margin-top: 24px; }
            .p-4 { padding: 16px; }
            .border { border: 1px solid #ddd; }
            .bg-gray-50 { background-color: #f9f9f9; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .gap-4 { gap: 16px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${billHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const sendEmail = async () => {
    setIsGenerating(true);
    try {
      // In a real application, this would send the email via an API
      // For demo purposes, we'll simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      setShowEmailForm(false);
      alert(`Invoice has been sent to ${emailData.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const completeCheckout = () => {
    updateBookingStatus(booking.id, 'checked-out');
    updateRoomStatus(room.id, 'dirty');
    onCheckoutComplete?.();
    onClose();
  };

  const EmailForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Send Invoice via Email</h3>
            <button
              onClick={() => setShowEmailForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={6}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowEmailForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Guest Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              onClick={printBill}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={() => setShowEmailForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Mail className="w-4 h-4" />
              <span>Email to Guest</span>
              {emailSent && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={completeCheckout}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto"
            >
              <Check className="w-4 h-4" />
              <span>Complete Checkout</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          <div ref={billRef} className="bg-white max-w-4xl mx-auto">
            {/* Header with Logo and Hotel Info */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={`${branding.hotelName} Logo`}
                      className="h-16 w-auto"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <Building className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{branding.hotelName}</h1>
                    <div className="flex items-center space-x-1 mt-1">
                      {Array.from({ length: branding.starRating }, (_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-lg font-semibold text-gray-700">#{invoiceNumber}</p>
                  <p className="text-sm text-gray-600">Date: {invoiceDate}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hotel Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{branding.address.street}</span>
                    </div>
                    <div className="ml-6">
                      {branding.address.city}, {branding.address.state} {branding.address.zipCode}
                    </div>
                    <div className="ml-6">{branding.address.country}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Phone className="w-4 h-4" />
                      <span>{branding.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{branding.contact.email}</span>
                    </div>
                    {branding.licenseNumber && (
                      <div className="mt-2 text-xs">
                        License: {branding.licenseNumber}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{guest.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{guest.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{guest.phone}</span>
                    </div>
                    {guest.address && (
                      <div className="flex items-start space-x-2 mt-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{guest.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="text-sm font-medium">#{booking.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Room Number:</span>
                      <span className="text-sm font-medium">{room.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Room Type:</span>
                      <span className="text-sm font-medium capitalize">{room.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Guests:</span>
                      <span className="text-sm font-medium">{booking.adults} Adult{booking.adults !== 1 ? 's' : ''}{booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : ''}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-in:</span>
                      <span className="text-sm font-medium">{new Date(booking.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-out:</span>
                      <span className="text-sm font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Number of Nights:</span>
                      <span className="text-sm font-medium">{nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rate per Night:</span>
                      <span className="text-sm font-medium">{formatCurrency(roomRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charges Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Charges</h3>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.charges.map((charge) => (
                    <tr key={charge.id}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {new Date(charge.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {charge.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 capitalize">
                        {charge.category.replace('-', ' ')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">
                        {formatCurrency(charge.amount, charge.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mb-6">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">{formatCurrency(subtotal, booking.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%):</span>
                      <span className="text-sm font-medium">{formatCurrency(taxAmount, booking.currency)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(grandTotal, booking.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Payment Status: PAID</span>
                </div>
                <div className="text-sm text-green-700">
                  <p>Payment Method: Credit Card</p>
                  <p>Transaction Date: {formatDateTime(getCurrentDateTime())}</p>
                  <p>Processed by: {user?.name}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-sm text-gray-600">
                    Thank you for choosing {branding.hotelName}. We hope you enjoyed your stay and look forward to welcoming you back soon.
                  </p>
                  {branding.policies.cancellationPolicy && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 text-sm">Cancellation Policy:</h5>
                      <p className="text-xs text-gray-600 mt-1">{branding.policies.cancellationPolicy}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    <p>Questions about this invoice?</p>
                    <p>Contact us at:</p>
                    <p className="font-medium">{branding.contact.phone}</p>
                    <p className="font-medium">{branding.contact.email}</p>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Invoice generated on {formatDateTime(getCurrentDateTime())}</p>
                    <p>by {user?.name} - {user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEmailForm && <EmailForm />}
    </div>
  );
}
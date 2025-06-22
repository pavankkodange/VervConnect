import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Invoice, Payment, FinancialReport, InvoiceItem } from '../types';

interface FinancialContextType {
  invoices: Invoice[];
  payments: Payment[];
  reports: FinancialReport[];
  
  // Invoice management
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'remindersSent'>) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  markInvoiceAsPaid: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'processedAt'>) => void;
  sendInvoiceReminder: (invoiceId: string) => void;
  generateInvoiceFromBooking: (bookingId: string, bookingData: any, guestData: any) => void;
  
  // Payment processing
  processPayment: (payment: Omit<Payment, 'id' | 'processedAt'>) => void;
  refundPayment: (paymentId: string, amount: number, reason: string) => void;
  getPaymentsByInvoice: (invoiceId: string) => Payment[];
  
  // Financial reporting
  generateReport: (type: FinancialReport['type'], startDate: string, endDate: string) => FinancialReport;
  getRevenueByPeriod: (startDate: string, endDate: string) => number;
  getOutstandingInvoices: () => Invoice[];
  getOverdueInvoices: () => Invoice[];
  
  // Analytics
  getRevenueBreakdown: (startDate: string, endDate: string) => {
    rooms: number;
    restaurant: number;
    banquet: number;
    other: number;
  };
  getPaymentMethodStats: (startDate: string, endDate: string) => Record<string, number>;
  getMonthlyRevenueTrend: (months: number) => Array<{month: string; revenue: number}>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Get current year for realistic demo data
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// Enhanced demo data with current year dates
const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: `INV-${currentYear}-001`,
    bookingId: '1',
    guestId: '1',
    clientName: 'John Doe',
    clientEmail: 'john@email.com',
    clientAddress: '123 Main Street, New York, NY 10001, USA',
    issueDate: `${currentYear}-01-22`,
    dueDate: `${currentYear}-02-22`,
    items: [
      {
        id: '1',
        description: 'Room 102 - 3 nights (Jan 22-25)',
        quantity: 3,
        unitPrice: 150,
        totalPrice: 450,
        taxRate: 0.1,
        category: 'accommodation',
        date: `${currentYear}-01-22`
      },
      {
        id: '2',
        description: 'Room Service - Dinner',
        quantity: 1,
        unitPrice: 85,
        totalPrice: 85,
        taxRate: 0.1,
        category: 'room-service',
        date: `${currentYear}-01-23`
      },
      {
        id: '3',
        description: 'Restaurant Charges',
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120,
        taxRate: 0.1,
        category: 'restaurant',
        date: `${currentYear}-01-23`
      }
    ],
    subtotal: 655,
    taxAmount: 65.5,
    discountAmount: 0,
    totalAmount: 720.5,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    paymentDate: `${currentYear}-01-25`,
    paymentReference: 'CARD-001',
    createdBy: '1',
    remindersSent: 0,
    notes: 'Guest checkout - all charges included',
    terms: 'Payment due upon checkout'
  },
  {
    id: '2',
    invoiceNumber: `INV-${currentYear}-002`,
    bookingId: '2',
    guestId: '2',
    clientName: 'Jane Smith',
    clientEmail: 'jane@email.com',
    clientAddress: '456 Oak Avenue, London, UK',
    issueDate: `${currentYear}-01-20`,
    dueDate: `${currentYear}-02-20`,
    items: [
      {
        id: '1',
        description: 'VIP Suite 301 - 2 nights (Jan 20-22)',
        quantity: 2,
        unitPrice: 400,
        totalPrice: 800,
        taxRate: 0.1,
        category: 'accommodation',
        date: `${currentYear}-01-20`
      },
      {
        id: '2',
        description: 'Spa Services',
        quantity: 1,
        unitPrice: 200,
        totalPrice: 200,
        taxRate: 0.1,
        category: 'spa',
        date: `${currentYear}-01-21`
      }
    ],
    subtotal: 1000,
    taxAmount: 100,
    discountAmount: 50, // VIP discount
    totalAmount: 1050,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    paymentDate: `${currentYear}-01-22`,
    paymentReference: 'CARD-002',
    createdBy: '1',
    remindersSent: 0,
    notes: 'VIP guest - 5% discount applied',
    terms: 'Payment due upon checkout'
  },
  {
    id: '3',
    invoiceNumber: `INV-${currentYear}-003`,
    guestId: '3',
    clientName: 'Corporate Event - Johnson Wedding',
    clientEmail: 'robert@email.com',
    clientAddress: '789 Event Plaza, Chicago, IL 60601, USA',
    issueDate: `${currentYear}-01-15`,
    dueDate: `${currentYear}-02-14`,
    items: [
      {
        id: '1',
        description: 'Grand Ballroom Rental - 5 hours',
        quantity: 5,
        unitPrice: 500,
        totalPrice: 2500,
        taxRate: 0.1,
        category: 'banquet',
        date: `${currentYear}-02-14`
      },
      {
        id: '2',
        description: 'Catering Package - 150 guests',
        quantity: 150,
        unitPrice: 45,
        totalPrice: 6750,
        taxRate: 0.1,
        category: 'catering',
        date: `${currentYear}-02-14`
      },
      {
        id: '3',
        description: 'Audio/Visual Equipment',
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        taxRate: 0.1,
        category: 'equipment',
        date: `${currentYear}-02-14`
      }
    ],
    subtotal: 10050,
    taxAmount: 1005,
    discountAmount: 500, // Early booking discount
    totalAmount: 10555,
    currency: 'USD',
    status: 'sent',
    createdBy: '1',
    remindersSent: 1,
    lastReminderDate: `${currentYear}-01-30`,
    notes: 'Wedding event - early booking discount applied',
    terms: 'Payment due 30 days from invoice date'
  },
  {
    id: '4',
    invoiceNumber: `INV-${currentYear}-004`,
    guestId: '4',
    clientName: 'Alexander Blackwood',
    clientEmail: 'alex.blackwood@luxurygroup.com',
    clientAddress: '1 Park Avenue, New York, NY 10016, USA',
    issueDate: `${currentYear}-01-18`,
    dueDate: `${currentYear}-02-18`,
    items: [
      {
        id: '1',
        description: 'Presidential Suite 401 - 4 nights (Jan 18-22)',
        quantity: 4,
        unitPrice: 550,
        totalPrice: 2200,
        taxRate: 0.1,
        category: 'accommodation',
        date: `${currentYear}-01-18`
      },
      {
        id: '2',
        description: 'Private Butler Service',
        quantity: 4,
        unitPrice: 150,
        totalPrice: 600,
        taxRate: 0.1,
        category: 'service',
        date: `${currentYear}-01-18`
      },
      {
        id: '3',
        description: 'Helicopter Transfer',
        quantity: 2,
        unitPrice: 800,
        totalPrice: 1600,
        taxRate: 0.1,
        category: 'transport',
        date: `${currentYear}-01-18`
      },
      {
        id: '4',
        description: 'Fine Dining - Private Chef',
        quantity: 3,
        unitPrice: 300,
        totalPrice: 900,
        taxRate: 0.1,
        category: 'dining',
        date: `${currentYear}-01-19`
      }
    ],
    subtotal: 5300,
    taxAmount: 530,
    discountAmount: 0,
    totalAmount: 5830,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    paymentDate: `${currentYear}-01-22`,
    paymentReference: 'WIRE-001',
    createdBy: '1',
    remindersSent: 0,
    notes: 'Diamond VIP guest - premium services',
    terms: 'Payment due upon checkout'
  },
  // Additional recent invoices for better data
  {
    id: '5',
    invoiceNumber: `INV-${currentYear}-005`,
    guestId: '5',
    clientName: 'Isabella Chen',
    clientEmail: 'isabella.chen@techventures.com',
    clientAddress: '88 Marina Bay, Singapore 018956',
    issueDate: `${currentYear}-01-12`,
    dueDate: `${currentYear}-02-12`,
    items: [
      {
        id: '1',
        description: 'Deluxe Room 302 - 3 nights (Jan 12-15)',
        quantity: 3,
        unitPrice: 320,
        totalPrice: 960,
        taxRate: 0.1,
        category: 'accommodation',
        date: `${currentYear}-01-12`
      },
      {
        id: '2',
        description: 'Business Center Services',
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150,
        taxRate: 0.1,
        category: 'service',
        date: `${currentYear}-01-13`
      }
    ],
    subtotal: 1110,
    taxAmount: 111,
    discountAmount: 0,
    totalAmount: 1221,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    paymentDate: `${currentYear}-01-15`,
    paymentReference: 'CARD-005',
    createdBy: '1',
    remindersSent: 0,
    notes: 'Gold VIP guest - business traveler',
    terms: 'Payment due upon checkout'
  },
  {
    id: '6',
    invoiceNumber: `INV-${currentYear}-006`,
    guestId: '6',
    clientName: 'Carlos Rodriguez',
    clientEmail: 'carlos@email.com',
    clientAddress: '789 Pine Street, Los Angeles, CA 90210, USA',
    issueDate: `${currentYear}-01-10`,
    dueDate: `${currentYear}-02-10`,
    items: [
      {
        id: '1',
        description: 'Standard Room 201 - 2 nights (Jan 10-12)',
        quantity: 2,
        unitPrice: 200,
        totalPrice: 400,
        taxRate: 0.1,
        category: 'accommodation',
        date: `${currentYear}-01-10`
      },
      {
        id: '2',
        description: 'Restaurant Dinner',
        quantity: 1,
        unitPrice: 95,
        totalPrice: 95,
        taxRate: 0.1,
        category: 'restaurant',
        date: `${currentYear}-01-11`
      }
    ],
    subtotal: 495,
    taxAmount: 49.5,
    discountAmount: 0,
    totalAmount: 544.5,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'cash',
    paymentDate: `${currentYear}-01-12`,
    paymentReference: 'CASH-002',
    createdBy: '1',
    remindersSent: 0,
    notes: 'Regular guest - cash payment',
    terms: 'Payment due upon checkout'
  }
];

const DEMO_PAYMENTS: Payment[] = [
  {
    id: '1',
    invoiceId: '1',
    bookingId: '1',
    amount: 720.5,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn_123456789',
    reference: 'CARD-001',
    processedBy: '1',
    processedAt: `${currentYear}-01-25T11:30:00Z`,
    notes: 'Guest checkout payment'
  },
  {
    id: '2',
    invoiceId: '2',
    bookingId: '2',
    amount: 1050,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn_987654321',
    reference: 'CARD-002',
    processedBy: '1',
    processedAt: `${currentYear}-01-22T14:15:00Z`,
    notes: 'VIP guest checkout payment'
  },
  {
    id: '3',
    invoiceId: '4',
    amount: 5830,
    currency: 'USD',
    method: 'bank-transfer',
    status: 'completed',
    transactionId: 'wire_555666777',
    reference: 'WIRE-001',
    processedBy: '1',
    processedAt: `${currentYear}-01-22T16:45:00Z`,
    notes: 'Diamond VIP guest - wire transfer payment'
  },
  {
    id: '4',
    amount: 450,
    currency: 'USD',
    method: 'cash',
    status: 'completed',
    reference: 'CASH-001',
    processedBy: '2',
    processedAt: `${currentYear}-01-23T09:20:00Z`,
    notes: 'Restaurant payment - cash'
  },
  {
    id: '5',
    amount: 280,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn_111222333',
    reference: 'CARD-003',
    processedBy: '3',
    processedAt: `${currentYear}-01-24T18:30:00Z`,
    notes: 'Room service payment'
  },
  {
    id: '6',
    invoiceId: '5',
    amount: 1221,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn_444555666',
    reference: 'CARD-005',
    processedBy: '1',
    processedAt: `${currentYear}-01-15T10:30:00Z`,
    notes: 'Gold VIP guest checkout payment'
  },
  {
    id: '7',
    invoiceId: '6',
    amount: 544.5,
    currency: 'USD',
    method: 'cash',
    status: 'completed',
    reference: 'CASH-002',
    processedBy: '2',
    processedAt: `${currentYear}-01-12T15:45:00Z`,
    notes: 'Regular guest - cash payment'
  }
];

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(DEMO_PAYMENTS);
  const [reports, setReports] = useState<FinancialReport[]>([]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, '0')}`;
  };

  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'remindersSent'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date().toISOString().split('T')[0],
      remindersSent: 0
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const generateInvoiceFromBooking = (bookingId: string, bookingData: any, guestData: any) => {
    const invoiceItems: InvoiceItem[] = [];
    let subtotal = 0;

    // Add room charges
    if (bookingData.charges && bookingData.charges.length > 0) {
      bookingData.charges.forEach((charge: any, index: number) => {
        const item: InvoiceItem = {
          id: (index + 1).toString(),
          description: charge.description,
          quantity: 1,
          unitPrice: charge.amount,
          totalPrice: charge.amount,
          taxRate: 0.1,
          category: charge.category,
          date: charge.date
        };
        invoiceItems.push(item);
        subtotal += charge.amount;
      });
    }

    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      bookingId: bookingId,
      guestId: guestData.id,
      clientName: guestData.name,
      clientEmail: guestData.email,
      clientAddress: guestData.address || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoiceItems,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      currency: bookingData.currency || 'USD',
      status: 'paid',
      paymentMethod: 'card',
      paymentDate: new Date().toISOString().split('T')[0],
      createdBy: 'system',
      remindersSent: 0,
      notes: `Generated from booking ${bookingId}`,
      terms: 'Payment due upon checkout'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Also create a corresponding payment record
    const payment: Payment = {
      id: Date.now().toString(),
      invoiceId: newInvoice.id,
      bookingId: bookingId,
      amount: totalAmount,
      currency: newInvoice.currency,
      method: 'card',
      status: 'completed',
      transactionId: `txn_${Date.now()}`,
      reference: `AUTO-${Date.now()}`,
      processedBy: 'system',
      processedAt: new Date().toISOString(),
      notes: 'Auto-generated from booking checkout'
    };

    setPayments(prev => [payment, ...prev]);
  };

  const updateInvoice = (invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, ...updates } : invoice
    ));
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
  };

  const markInvoiceAsPaid = (invoiceId: string, paymentData: Omit<Payment, 'id' | 'processedAt'>) => {
    const payment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      processedAt: new Date().toISOString()
    };
    
    setPayments(prev => [payment, ...prev]);
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status: 'paid', 
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: payment.method,
            paymentReference: payment.reference
          } 
        : invoice
    ));
  };

  const sendInvoiceReminder = (invoiceId: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            remindersSent: invoice.remindersSent + 1,
            lastReminderDate: new Date().toISOString().split('T')[0]
          } 
        : invoice
    ));
  };

  const processPayment = (paymentData: Omit<Payment, 'id' | 'processedAt'>) => {
    const payment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      processedAt: new Date().toISOString()
    };
    setPayments(prev => [payment, ...prev]);
  };

  const refundPayment = (paymentId: string, amount: number, reason: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: 'refunded',
            refundAmount: amount,
            refundDate: new Date().toISOString().split('T')[0],
            refundReason: reason
          } 
        : payment
    ));
  };

  const getPaymentsByInvoice = (invoiceId: string) => {
    return payments.filter(payment => payment.invoiceId === invoiceId);
  };

  const generateReport = (type: FinancialReport['type'], startDate: string, endDate: string): FinancialReport => {
    const filteredInvoices = invoices.filter(invoice => 
      invoice.issueDate >= startDate && invoice.issueDate <= endDate && invoice.status === 'paid'
    );
    
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    // Calculate revenue by category
    const roomRevenue = filteredInvoices.reduce((sum, invoice) => {
      const roomItems = invoice.items.filter(item => item.category === 'accommodation');
      return sum + roomItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);
    
    const restaurantRevenue = filteredInvoices.reduce((sum, invoice) => {
      const restaurantItems = invoice.items.filter(item => 
        ['restaurant', 'room-service', 'dining', 'catering'].includes(item.category)
      );
      return sum + restaurantItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);
    
    const banquetRevenue = filteredInvoices.reduce((sum, invoice) => {
      const banquetItems = invoice.items.filter(item => 
        ['banquet', 'equipment', 'event'].includes(item.category)
      );
      return sum + banquetItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);
    
    const otherRevenue = totalRevenue - roomRevenue - restaurantRevenue - banquetRevenue;
    
    const report: FinancialReport = {
      id: Date.now().toString(),
      type,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      data: {
        totalRevenue,
        roomRevenue,
        restaurantRevenue,
        banquetRevenue,
        otherRevenue,
        totalExpenses: totalRevenue * 0.35, // Estimated expenses
        netProfit: totalRevenue * 0.65,
        occupancyRate: 78,
        averageDailyRate: 185,
        revenuePAR: 144.3,
        guestCount: filteredInvoices.length,
        averageStayLength: 2.8,
        cancellationRate: 4.2,
        noShowRate: 1.8
      },
      currency: 'USD'
    };
    
    setReports(prev => [report, ...prev]);
    return report;
  };

  const getRevenueByPeriod = (startDate: string, endDate: string) => {
    return invoices
      .filter(invoice => 
        invoice.issueDate >= startDate && 
        invoice.issueDate <= endDate && 
        invoice.status === 'paid'
      )
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };

  const getOutstandingInvoices = () => {
    return invoices.filter(invoice => invoice.status === 'sent');
  };

  const getOverdueInvoices = () => {
    const today = new Date().toISOString().split('T')[0];
    return invoices.filter(invoice => 
      invoice.status === 'sent' && invoice.dueDate < today
    );
  };

  const getRevenueBreakdown = (startDate: string, endDate: string) => {
    const filteredInvoices = invoices.filter(invoice => 
      invoice.issueDate >= startDate && invoice.issueDate <= endDate && invoice.status === 'paid'
    );
    
    let rooms = 0, restaurant = 0, banquet = 0, other = 0;
    
    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        switch (item.category) {
          case 'accommodation':
            rooms += item.totalPrice;
            break;
          case 'restaurant':
          case 'room-service':
          case 'dining':
          case 'catering':
            restaurant += item.totalPrice;
            break;
          case 'banquet':
          case 'equipment':
          case 'event':
            banquet += item.totalPrice;
            break;
          default:
            other += item.totalPrice;
        }
      });
    });
    
    return { rooms, restaurant, banquet, other };
  };

  const getPaymentMethodStats = (startDate: string, endDate: string) => {
    const relevantPayments = payments.filter(payment => 
      payment.processedAt >= startDate && payment.processedAt <= endDate && payment.status === 'completed'
    );
    
    return relevantPayments.reduce((stats, payment) => {
      const method = payment.method.replace('-', ' ');
      stats[method] = (stats[method] || 0) + payment.amount;
      return stats;
    }, {} as Record<string, number>);
  };

  const getMonthlyRevenueTrend = (months: number) => {
    const trend = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      trend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: getRevenueByPeriod(monthStart, monthEnd)
      });
    }
    
    return trend;
  };

  return (
    <FinancialContext.Provider value={{
      invoices,
      payments,
      reports,
      createInvoice,
      updateInvoice,
      deleteInvoice,
      markInvoiceAsPaid,
      sendInvoiceReminder,
      generateInvoiceFromBooking,
      processPayment,
      refundPayment,
      getPaymentsByInvoice,
      generateReport,
      getRevenueByPeriod,
      getOutstandingInvoices,
      getOverdueInvoices,
      getRevenueBreakdown,
      getPaymentMethodStats,
      getMonthlyRevenueTrend
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
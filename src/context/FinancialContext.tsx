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

// Demo data
const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    bookingId: '1',
    guestId: '1',
    clientName: 'John Doe',
    clientEmail: 'john@email.com',
    issueDate: '2024-01-22',
    dueDate: '2024-02-22',
    items: [
      {
        id: '1',
        description: 'Room 102 - 3 nights',
        quantity: 3,
        unitPrice: 150,
        totalPrice: 450,
        taxRate: 0.1,
        category: 'accommodation',
        date: '2024-01-22'
      }
    ],
    subtotal: 450,
    taxAmount: 45,
    discountAmount: 0,
    totalAmount: 495,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    paymentDate: '2024-01-22',
    createdBy: '1',
    remindersSent: 0
  }
];

const DEMO_PAYMENTS: Payment[] = [
  {
    id: '1',
    invoiceId: '1',
    bookingId: '1',
    amount: 495,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn_123456789',
    reference: 'CARD-001',
    processedBy: '1',
    processedAt: '2024-01-22T10:30:00Z'
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
    const roomRevenue = filteredInvoices.reduce((sum, invoice) => {
      const roomItems = invoice.items.filter(item => item.category === 'accommodation');
      return sum + roomItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);
    
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
        restaurantRevenue: totalRevenue * 0.3, // Mock data
        banquetRevenue: totalRevenue * 0.2,
        otherRevenue: totalRevenue * 0.1,
        totalExpenses: totalRevenue * 0.4,
        netProfit: totalRevenue * 0.6,
        occupancyRate: 75,
        averageDailyRate: 150,
        revenuePAR: 112.5,
        guestCount: filteredInvoices.length,
        averageStayLength: 2.5,
        cancellationRate: 5,
        noShowRate: 2
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
    const total = getRevenueByPeriod(startDate, endDate);
    return {
      rooms: total * 0.5,
      restaurant: total * 0.3,
      banquet: total * 0.15,
      other: total * 0.05
    };
  };

  const getPaymentMethodStats = (startDate: string, endDate: string) => {
    const relevantPayments = payments.filter(payment => 
      payment.processedAt >= startDate && payment.processedAt <= endDate
    );
    
    return relevantPayments.reduce((stats, payment) => {
      stats[payment.method] = (stats[payment.method] || 0) + payment.amount;
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
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, Notification, GuestCommunication } from '../types';

interface CommunicationContextType {
  messages: Message[];
  notifications: Notification[];
  guestCommunications: GuestCommunication[];
  unreadCount: number;
  
  // Messages
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  getMessagesByRecipient: (recipientId: string) => Message[];
  getMessagesByDepartment: (department: string) => Message[];
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByUser: (userId: string) => Notification[];
  
  // Guest Communications
  sendGuestCommunication: (communication: Omit<GuestCommunication, 'id' | 'timestamp' | 'status'>) => void;
  updateCommunicationStatus: (communicationId: string, status: GuestCommunication['status']) => void;
  getGuestCommunications: (guestId: string) => GuestCommunication[];
  
  // Bulk operations
  sendBulkNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>, userIds: string[]) => void;
  sendDepartmentMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read' | 'recipientId'>, department: string) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

// Demo data
const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: '1',
    recipientId: '2',
    recipientType: 'user',
    subject: 'Room 203 Maintenance Issue',
    content: 'Guest reported AC not working in room 203. Please check immediately.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    category: 'maintenance',
    roomNumber: '203',
    actionRequired: true,
    actionCompleted: false
  },
  {
    id: '2',
    senderId: '3',
    recipientType: 'department',
    department: 'front-desk',
    subject: 'VIP Guest Arrival',
    content: 'VIP guest Mr. Johnson arriving at 3 PM. Please ensure room upgrade and welcome amenities.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'high',
    category: 'guest-request',
    actionRequired: true,
    actionCompleted: true
  }
];

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'New Booking Received',
    message: 'Room 105 booked for tonight by John Smith',
    type: 'info',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    category: 'booking',
    priority: 'normal'
  },
  {
    id: '2',
    userId: '2',
    title: 'Maintenance Request',
    message: 'Room 203 AC repair needed urgently',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    category: 'maintenance',
    priority: 'high',
    actionUrl: '/maintenance/203',
    actionText: 'View Request'
  }
];

const DEMO_GUEST_COMMUNICATIONS: GuestCommunication[] = [
  {
    id: '1',
    guestId: '1',
    bookingId: '1',
    type: 'email',
    subject: 'Welcome to Harmony Suites',
    content: 'Thank you for choosing Harmony Suites. Your check-in is confirmed for today.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    sentBy: '1',
    category: 'welcome'
  }
];

export function CommunicationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [guestCommunications, setGuestCommunications] = useState<GuestCommunication[]>(DEMO_GUEST_COMMUNICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length + messages.filter(m => !m.read).length;

  const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getMessagesByRecipient = (recipientId: string) => {
    return messages.filter(msg => msg.recipientId === recipientId);
  };

  const getMessagesByDepartment = (department: string) => {
    return messages.filter(msg => msg.department === department);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsByUser = (userId: string) => {
    return notifications.filter(notif => notif.userId === userId);
  };

  const sendGuestCommunication = (communicationData: Omit<GuestCommunication, 'id' | 'timestamp' | 'status'>) => {
    const newCommunication: GuestCommunication = {
      ...communicationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setGuestCommunications(prev => [newCommunication, ...prev]);
  };

  const updateCommunicationStatus = (communicationId: string, status: GuestCommunication['status']) => {
    setGuestCommunications(prev => prev.map(comm => 
      comm.id === communicationId ? { ...comm, status } : comm
    ));
  };

  const getGuestCommunications = (guestId: string) => {
    return guestCommunications.filter(comm => comm.guestId === guestId);
  };

  const sendBulkNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>, userIds: string[]) => {
    const newNotifications = userIds.map(userId => ({
      ...notificationData,
      userId,
      id: `${Date.now()}-${userId}`,
      timestamp: new Date().toISOString(),
      read: false
    }));
    setNotifications(prev => [...newNotifications, ...prev]);
  };

  const sendDepartmentMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read' | 'recipientId'>, department: string) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      recipientType: 'department',
      department
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  return (
    <CommunicationContext.Provider value={{
      messages,
      notifications,
      guestCommunications,
      unreadCount,
      sendMessage,
      markMessageAsRead,
      deleteMessage,
      getMessagesByRecipient,
      getMessagesByDepartment,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications,
      getNotificationsByUser,
      sendGuestCommunication,
      updateCommunicationStatus,
      getGuestCommunications,
      sendBulkNotification,
      sendDepartmentMessage
    }}>
      {children}
    </CommunicationContext.Provider>
  );
}

export function useCommunication() {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
}
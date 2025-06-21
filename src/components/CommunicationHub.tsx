import React, { useState } from 'react';
import { useCommunication } from '../context/CommunicationContext';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { 
  MessageSquare, 
  Bell, 
  Send, 
  Users, 
  Mail, 
  Phone, 
  Search,
  Filter,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Archive,
  Reply,
  Forward,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export function CommunicationHub() {
  const { 
    messages, 
    notifications, 
    guestCommunications,
    unreadCount,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    addNotification,
    markNotificationAsRead,
    sendGuestCommunication,
    sendBulkNotification,
    sendDepartmentMessage
  } = useCommunication();
  
  const { user, users } = useAuth();
  const { guests, bookings } = useHotel();
  
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'guest-comms'>('messages');
  const [showComposeMessage, setShowComposeMessage] = useState(false);
  const [showComposeNotification, setShowComposeNotification] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'guest-request': return <Users className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'announcement': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const ComposeMessageModal = () => {
    const [formData, setFormData] = useState({
      recipientType: 'user' as 'user' | 'department' | 'all',
      recipientId: '',
      department: '',
      subject: '',
      content: '',
      priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
      category: 'general' as 'general' | 'maintenance' | 'guest-request' | 'emergency' | 'announcement',
      roomNumber: '',
      actionRequired: false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.recipientType === 'department') {
        sendDepartmentMessage({
          senderId: user!.id,
          recipientType: 'department',
          subject: formData.subject,
          content: formData.content,
          priority: formData.priority,
          category: formData.category,
          roomNumber: formData.roomNumber || undefined,
          actionRequired: formData.actionRequired
        }, formData.department);
      } else {
        sendMessage({
          senderId: user!.id,
          recipientId: formData.recipientId || undefined,
          recipientType: formData.recipientType,
          subject: formData.subject,
          content: formData.content,
          priority: formData.priority,
          category: formData.category,
          roomNumber: formData.roomNumber || undefined,
          actionRequired: formData.actionRequired
        });
      }
      
      setShowComposeMessage(false);
      setFormData({
        recipientType: 'user',
        recipientId: '',
        department: '',
        subject: '',
        content: '',
        priority: 'normal',
        category: 'general',
        roomNumber: '',
        actionRequired: false
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Compose Message</h3>
              <button
                onClick={() => setShowComposeMessage(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
                  <select
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="user">Individual User</option>
                    <option value="department">Department</option>
                    <option value="all">All Staff</option>
                  </select>
                </div>

                {formData.recipientType === 'user' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                    <select
                      value={formData.recipientId}
                      onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select user</option>
                      {users.filter(u => u.id !== user?.id).map(u => (
                        <option key={u.id} value={u.id}>{u.name} - {u.role}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.recipientType === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select department</option>
                      <option value="front-desk">Front Desk</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="guest-request">Guest Request</option>
                    <option value="emergency">Emergency</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number (Optional)</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 203"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.actionRequired}
                    onChange={(e) => setFormData({ ...formData, actionRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Action Required</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowComposeMessage(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const GuestMessageModal = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      bookingId: '',
      type: 'email' as 'email' | 'sms',
      subject: '',
      content: '',
      category: 'general' as 'welcome' | 'confirmation' | 'reminder' | 'survey' | 'marketing' | 'service'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      sendGuestCommunication({
        guestId: formData.guestId,
        bookingId: formData.bookingId || undefined,
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
        sentBy: user!.id,
        category: formData.category
      });
      
      setShowGuestMessage(false);
      setFormData({
        guestId: '',
        bookingId: '',
        type: 'email',
        subject: '',
        content: '',
        category: 'general'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send Guest Communication</h3>
              <button
                onClick={() => setShowGuestMessage(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guest</label>
                  <select
                    value={formData.guestId}
                    onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select guest</option>
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>{guest.name} - {guest.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Communication Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking (Optional)</label>
                  <select
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select booking</option>
                    {bookings.filter(b => b.guestId === formData.guestId).map(booking => (
                      <option key={booking.id} value={booking.id}>
                        Room {booking.roomId} - {booking.checkIn} to {booking.checkOut}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="welcome">Welcome</option>
                    <option value="confirmation">Confirmation</option>
                    <option value="reminder">Reminder</option>
                    <option value="service">Service Information</option>
                    <option value="survey">Survey</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>

              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={6}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowGuestMessage(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = !searchTerm || 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || msg.priority === filterPriority;
    const matchesCategory = !filterCategory || msg.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = !searchTerm || 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || notif.priority === filterPriority;
    const matchesCategory = !filterCategory || notif.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-2">Manage internal messages, notifications, and guest communications</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">{unreadCount} unread</span>
            </div>
          )}
          <button
            onClick={() => setShowGuestMessage(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Mail className="w-4 h-4" />
            <span>Guest Message</span>
          </button>
          <button
            onClick={() => setShowComposeMessage(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'messages', name: 'Internal Messages', icon: MessageSquare, count: messages.filter(m => !m.read).length },
              { id: 'notifications', name: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
              { id: 'guest-comms', name: 'Guest Communications', icon: Users, count: guestCommunications.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="guest-request">Guest Request</option>
            <option value="emergency">Emergency</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Internal Messages</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => {
              const sender = users.find(u => u.id === message.senderId);
              return (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      markMessageAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(message.category)}
                          <span className="text-sm font-medium text-gray-900">{sender?.name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        {message.actionRequired && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Action Required
                          </span>
                        )}
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{message.subject}</h4>
                      <p className="text-gray-600 mb-2 line-clamp-2">{message.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                        {message.roomNumber && (
                          <span className="flex items-center space-x-1">
                            <span>Room {message.roomNumber}</span>
                          </span>
                        )}
                        <span className="capitalize">{message.category.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredMessages.length === 0 && (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        notification.type === 'error' ? 'bg-red-100 text-red-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{notification.title}</h4>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      <span className="capitalize">{notification.category.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.actionUrl && (
                      <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        {notification.actionText || 'View'}
                      </button>
                    )}
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      {notification.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guest Communications Tab */}
      {activeTab === 'guest-comms' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guest Communications</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {guestCommunications.map((comm) => {
              const guest = guests.find(g => g.id === comm.guestId);
              return (
                <div key={comm.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">{guest?.name}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          comm.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {comm.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          comm.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comm.status}
                        </span>
                      </div>
                      {comm.subject && (
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{comm.subject}</h4>
                      )}
                      <p className="text-gray-600 mb-2 line-clamp-2">{comm.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(comm.timestamp).toLocaleString()}</span>
                        <span className="capitalize">{comm.category}</span>
                        {guest?.email && <span>{guest.email}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {guestCommunications.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No guest communications found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showComposeMessage && <ComposeMessageModal />}
      {showGuestMessage && <GuestMessageModal />}
    </div>
  );
}
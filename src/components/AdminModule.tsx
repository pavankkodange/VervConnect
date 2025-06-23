import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useCurrency } from '../context/CurrencyContext';
import { useSecurity } from '../context/SecurityContext';
import { BrandingSettings } from './BrandingSettings';
import { ShiftManagement } from './ShiftManagement';
import { RoomManagement } from './RoomManagement';
import { BanquetHallManagement } from './BanquetHallManagement';
import { TableManagement } from './TableManagement';
import { 
  Users, 
  Settings, 
  Shield, 
  Calendar, 
  Bed, 
  Building, 
  UtensilsCrossed, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Download,
  Upload,
  Database,
  HardDrive,
  Cpu,
  Wifi,
  RefreshCw,
  DollarSign,
  Mail,
  Info,
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  Lock,
  Key,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer,
  Save
} from 'lucide-react';

export function AdminModule() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const { branding, updateBranding } = useBranding();
  const { currencies, hotelSettings, updateHotelSettings, formatCurrency } = useCurrency();
  const { securityLogs, auditLogs, accessControls, complianceReports, generateComplianceReport } = useSecurity();
  
  const [activeTab, setActiveTab] = useState<'users' | 'branding' | 'shifts' | 'rooms' | 'banquet' | 'tables' | 'system' | 'reports' | 'security'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBanquetManagement, setShowBanquetManagement] = useState(false);
  const [showTableManagement, setShowTableManagement] = useState(false);
  
  // System Settings State
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'healthy', uptime: '99.98%', connections: 24 },
    storage: { status: 'healthy', used: '42.3 GB', total: '100 GB', percentage: 42 },
    cpu: { status: 'healthy', usage: '23%', temperature: '45°C' },
    network: { status: 'healthy', bandwidth: '120 Mbps', latency: '15ms' }
  });
  
  // Reports State
  const [reportType, setReportType] = useState('financial');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  // Security State
  const [securityFilter, setSecurityFilter] = useState('all');
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [selectedSecurityItem, setSelectedSecurityItem] = useState<any>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserForm = () => {
    const [formData, setFormData] = useState({
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      role: editingUser?.role || 'front-desk',
      department: editingUser?.department || 'Front Office',
      phoneNumber: editingUser?.phoneNumber || '',
      emergencyContact: editingUser?.emergencyContact || '',
      isActive: editingUser?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingUser) {
        updateUser(editingUser.id, formData);
      } else {
        addUser(formData);
      }
      
      setShowUserForm(false);
      setEditingUser(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <button
              onClick={() => {
                setShowUserForm(false);
                setEditingUser(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="front-desk">Front Desk</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Front Office">Front Office</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Operations">Operations</option>
                <option value="Administration">Administration</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active User</span>
              </label>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SystemStatusCard = ({ title, status, icon: Icon, details }: { title: string, status: 'healthy' | 'warning' | 'critical', icon: React.ElementType, details: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${
            status === 'healthy' ? 'bg-green-100' : 
            status === 'warning' ? 'bg-yellow-100' : 
            'bg-red-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              status === 'healthy' ? 'text-green-600' : 
              status === 'warning' ? 'text-yellow-600' : 
              'text-red-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className={`text-sm font-medium ${
              status === 'healthy' ? 'text-green-600' : 
              status === 'warning' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="space-y-2">
        {details}
      </div>
    </div>
  );

  const generateReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const today = new Date();
      const startDate = new Date();
      
      if (reportPeriod === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (reportPeriod === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else if (reportPeriod === 'quarter') {
        startDate.setMonth(today.getMonth() - 3);
      } else if (reportPeriod === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
      }
      
      const report = {
        type: reportType,
        period: reportPeriod,
        generatedAt: new Date().toISOString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        data: {
          revenue: {
            total: 125750.50,
            rooms: 78500.25,
            restaurant: 22450.75,
            banquet: 18500.00,
            other: 6299.50
          },
          occupancy: {
            rate: 78.5,
            averageDailyRate: 185.25,
            revPAR: 145.42
          },
          guests: {
            total: 845,
            newGuests: 312,
            returningGuests: 533,
            averageStay: 2.7
          }
        }
      };
      
      setGeneratedReport(report);
      setIsGeneratingReport(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">Manage users, settings, and system configuration</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-8">
            {[
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'branding', name: 'Branding', icon: Building },
              { id: 'shifts', name: 'Shift Management', icon: Calendar },
              { id: 'rooms', name: 'Room Management', icon: Bed },
              { id: 'banquet', name: 'Banquet Halls', icon: Building },
              { id: 'tables', name: 'Table Management', icon: UtensilsCrossed },
              { id: 'system', name: 'System Settings', icon: Settings },
              { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
              { id: 'security', name: 'Security & Logs', icon: Shield }
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-lg">{user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                deleteUser(user.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <BrandingSettings />
      )}

      {/* Shift Management Tab */}
      {activeTab === 'shifts' && (
        <ShiftManagement />
      )}

      {/* Room Management Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Room Management</h3>
              <button
                onClick={() => setShowRoomManagement(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Rooms</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Bed className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Total Rooms</h4>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{9}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Available</h4>
                <p className="text-3xl font-bold text-green-600 mt-2">{4}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Occupied</h4>
                <p className="text-3xl font-bold text-blue-600 mt-2">{3}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Maintenance</h4>
                <p className="text-3xl font-bold text-orange-600 mt-2">{2}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banquet Management Tab */}
      {activeTab === 'banquet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Banquet Hall Management</h3>
              <button
                onClick={() => setShowBanquetManagement(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Banquet Halls</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Building className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Total Halls</h4>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{5}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Events This Month</h4>
                <p className="text-3xl font-bold text-green-600 mt-2">{12}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Revenue This Month</h4>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(25000)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Management Tab */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Table Management</h3>
              <button
                onClick={() => setShowTableManagement(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Tables</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <UtensilsCrossed className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Total Tables</h4>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{6}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Available</h4>
                <p className="text-3xl font-bold text-green-600 mt-2">{3}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Occupied</h4>
                <p className="text-3xl font-bold text-red-600 mt-2">{2}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Reserved</h4>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{1}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* System Status Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemStatusCard 
                title="Database" 
                status={systemStatus.database.status as any} 
                icon={Database}
                details={
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="text-sm font-medium">{systemStatus.database.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Connections:</span>
                      <span className="text-sm font-medium">{systemStatus.database.connections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Backup:</span>
                      <span className="text-sm font-medium">Today, 03:00 AM</span>
                    </div>
                  </div>
                }
              />
              
              <SystemStatusCard 
                title="Storage" 
                status={systemStatus.storage.status as any} 
                icon={HardDrive}
                details={
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used Space:</span>
                      <span className="text-sm font-medium">{systemStatus.storage.used} / {systemStatus.storage.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${systemStatus.storage.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Free Space:</span>
                      <span className="text-sm font-medium">57.7 GB</span>
                    </div>
                  </div>
                }
              />
              
              <SystemStatusCard 
                title="CPU & Memory" 
                status={systemStatus.cpu.status as any} 
                icon={Cpu}
                details={
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CPU Usage:</span>
                      <span className="text-sm font-medium">{systemStatus.cpu.usage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memory Usage:</span>
                      <span className="text-sm font-medium">2.1 GB / 8 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Temperature:</span>
                      <span className="text-sm font-medium">{systemStatus.cpu.temperature}</span>
                    </div>
                  </div>
                }
              />
              
              <SystemStatusCard 
                title="Network" 
                status={systemStatus.network.status as any} 
                icon={Wifi}
                details={
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bandwidth:</span>
                      <span className="text-sm font-medium">{systemStatus.network.bandwidth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Latency:</span>
                      <span className="text-sm font-medium">{systemStatus.network.latency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
          
          {/* System Maintenance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Database Management</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Database className="w-4 h-4" />
                    <span>Backup Database</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Optimize Database</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span>Restore from Backup</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Cache Management</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear Application Cache</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear Image Cache</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" />
                    <span>Rebuild Cache</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">System Operations</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Restart Application</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Restart Server</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    <span>Download System Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Currency Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
                <select
                  value={hotelSettings.baseCurrency}
                  onChange={(e) => updateHotelSettings({ baseCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Base currency is used for all financial transactions and reporting
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Currency</label>
                <select
                  value={hotelSettings.displayCurrency}
                  onChange={(e) => updateHotelSettings({ displayCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Display currency is used for showing prices to users
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Places</label>
                <select
                  value={hotelSettings.decimalPlaces}
                  onChange={(e) => updateHotelSettings({ decimalPlaces: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">0 (e.g., 100)</option>
                  <option value="1">1 (e.g., 100.5)</option>
                  <option value="2">2 (e.g., 100.50)</option>
                  <option value="3">3 (e.g., 100.500)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hotelSettings.showCurrencyCode}
                    onChange={(e) => updateHotelSettings({ showCurrencyCode: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show currency code with prices</span>
                </label>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Standard Room Rate:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(150)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Email Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                <input
                  type="text"
                  value="smtp.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="number"
                  value="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value="notifications@harmonysuite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value="••••••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                <input
                  type="text"
                  value={branding.hotelName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  value={branding.contact.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Test Connection
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* System Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Software Version</h4>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">VervConnect</span>
                    <span className="font-medium">v2.5.3</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Server Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Operating System</span>
                      <span className="font-medium">Linux 5.15.0</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Web Server</span>
                      <span className="font-medium">Nginx 1.22.1</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">PHP Version</span>
                      <span className="font-medium">8.2.7</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Database</span>
                      <span className="font-medium">PostgreSQL 15.3</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">License Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">License Type</span>
                      <span className="font-medium">Enterprise</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Licensed To</span>
                      <span className="font-medium">{branding.hotelName}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Expiration</span>
                      <span className="font-medium">December 31, 2025</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Support Plan</span>
                      <span className="font-medium">Premium</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">System Health</h4>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">All systems operational</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Last system check: Today at 10:45 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Analytics Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue (MTD)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(125750.50)}</p>
                  <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">78.5%</p>
                  <p className="text-sm text-green-600 mt-1">+5.2% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Guest Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">4.8/5</p>
                  <p className="text-sm text-green-600 mt-1">+0.2 from last month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Generator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="financial">Financial Report</option>
                  <option value="occupancy">Occupancy Report</option>
                  <option value="revenue">Revenue Analysis</option>
                  <option value="guest">Guest Statistics</option>
                  <option value="staff">Staff Performance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {generatedReport && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Period: {generatedReport.startDate} to {generatedReport.endDate}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Printer className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold">{formatCurrency(generatedReport.data.revenue.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Revenue:</span>
                        <span>{formatCurrency(generatedReport.data.revenue.rooms)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">F&B Revenue:</span>
                        <span>{formatCurrency(generatedReport.data.revenue.restaurant)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Banquet Revenue:</span>
                        <span>{formatCurrency(generatedReport.data.revenue.banquet)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Other Revenue:</span>
                        <span>{formatCurrency(generatedReport.data.revenue.other)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Occupancy Metrics</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy Rate:</span>
                        <span className="font-semibold">{generatedReport.data.occupancy.rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Daily Rate:</span>
                        <span>{formatCurrency(generatedReport.data.occupancy.averageDailyRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">RevPAR:</span>
                        <span>{formatCurrency(generatedReport.data.occupancy.revPAR)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Guest Statistics</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Guests:</span>
                        <span className="font-semibold">{generatedReport.data.guests.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Guests:</span>
                        <span>{generatedReport.data.guests.newGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Returning Guests:</span>
                        <span>{generatedReport.data.guests.returningGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Stay:</span>
                        <span>{generatedReport.data.guests.averageStay} nights</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>View Full Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Revenue by Department</h4>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <PieChart className="w-12 h-12 text-gray-400" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Rooms (62%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Restaurant (18%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Banquet (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Other (5%)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Payment Methods</h4>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-400" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Credit Card (72%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm">Bank Transfer (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Cash (8%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-sm">Other (5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-medium text-gray-900">Financial Statements</h4>
                </div>
                <p className="text-sm text-gray-600">Income statements, balance sheets, and cash flow reports</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Market Segment Analysis</h4>
                </div>
                <p className="text-sm text-gray-600">Booking sources, guest demographics, and market trends</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Forecasting</h4>
                </div>
                <p className="text-sm text-gray-600">Revenue forecasts, occupancy predictions, and trend analysis</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Guest Analysis</h4>
                </div>
                <p className="text-sm text-gray-600">Guest satisfaction, loyalty metrics, and feedback analysis</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-gray-900">F&B Performance</h4>
                </div>
                <p className="text-sm text-gray-600">Restaurant sales, menu analysis, and cost of goods sold</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-gray-900">Banquet & Events</h4>
                </div>
                <p className="text-sm text-gray-600">Event bookings, revenue, and space utilization</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & Logs Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* Security Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Security Status</h4>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-600 font-medium">Secure</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Active Users</h4>
                <p className="text-3xl font-bold text-blue-600 mt-2">{users.filter(u => u.isActive).length}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Key className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Access Controls</h4>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{accessControls.length}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-gray-900">Security Alerts</h4>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {securityLogs.filter(log => log.severity === 'warning' || log.severity === 'error' || log.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Security Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Logs</h3>
              <div className="flex space-x-4">
                <select
                  value={securityFilter}
                  onChange={(e) => setSecurityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Events</option>
                  <option value="login">Login Events</option>
                  <option value="data">Data Access</option>
                  <option value="settings">Settings Changes</option>
                  <option value="critical">Critical Events</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityLogs.slice(0, 5).map((log) => {
                    const user = users.find(u => u.id === log.userId);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                        setSelectedSecurityItem(log);
                        setShowSecurityDetails(true);
                      }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user?.name || 'System'}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            log.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                            log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            log.severity === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Audit Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.slice(0, 5).map((log) => {
                    const user = users.find(u => u.id === log.userId);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                        setSelectedSecurityItem(log);
                        setShowSecurityDetails(true);
                      }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user?.name || 'System'}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            log.action === 'create' ? 'bg-green-100 text-green-800' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'delete' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.entityType} #{log.entityId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.reason || 'No details provided'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Compliance Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">GDPR Compliance</h4>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Compliant</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Last audit: 2 months ago</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Generate Report
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-yellow-600" />
                  <h4 className="text-lg font-semibold text-gray-900">PCI-DSS Compliance</h4>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Review Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Last audit: 6 months ago</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Schedule Audit
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">SOX Compliance</h4>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Compliant</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Last audit: 3 months ago</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Generate Report
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Active Compliance Findings</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finding</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Regular review of user permissions required</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Access Control
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Medium
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          In Progress
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        June 30, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Resolve
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Guest data retention policy implementation</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Data Protection
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          High
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Open
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        May 15, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Assign
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Authentication</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input type="checkbox" className="sr-only" checked />
                      <span className="absolute inset-0 rounded-full bg-indigo-600"></span>
                      <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Password Policy</p>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                        <span className="text-sm text-gray-700">Minimum 8 characters</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                        <span className="text-sm text-gray-700">Require uppercase letters</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                        <span className="text-sm text-gray-700">Require numbers</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked />
                        <span className="text-sm text-gray-700">Require special characters</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Password Expiry</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90" selected>90 days</option>
                      <option value="180">180 days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Session & Access Control</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Session Timeout</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="15">15 minutes</option>
                      <option value="30" selected>30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Failed Login Lockout</p>
                      <p className="text-sm text-gray-600">Lock account after 5 failed attempts</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input type="checkbox" className="sr-only" checked />
                      <span className="absolute inset-0 rounded-full bg-indigo-600"></span>
                      <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">IP Restriction</p>
                      <p className="text-sm text-gray-600">Limit access to specific IP addresses</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input type="checkbox" className="sr-only" />
                      <span className="absolute inset-0 rounded-full"></span>
                      <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Audit Log Retention</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365" selected>1 year</option>
                      <option value="730">2 years</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Security Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserForm && <UserForm />}
      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBanquetManagement && <BanquetHallManagement onClose={() => setShowBanquetManagement(false)} />}
      {showTableManagement && <TableManagement onClose={() => setShowTableManagement(false)} />}
    </div>
  );
}
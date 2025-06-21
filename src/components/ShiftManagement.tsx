import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { 
  Clock, 
  Calendar, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Upload,
  Bell,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Copy,
  Shuffle,
  Timer,
  Coffee,
  Moon,
  Sun,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  department: string;
  requiredStaff: number;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  breakDuration: number; // minutes
  isActive: boolean;
}

interface ShiftSchedule {
  id: string;
  userId: string;
  templateId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'missed' | 'cancelled';
  actualStartTime?: string;
  actualEndTime?: string;
  breakStart?: string;
  breakEnd?: string;
  overtimeHours?: number;
  notes?: string;
  swapRequestId?: string;
}

interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  requesterShiftId: string;
  targetShiftId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
}

export function ShiftManagement() {
  const { users, updateUser } = useAuth();
  const { formatTime, getCurrentTime, getCurrentDate } = useBranding();
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'templates' | 'timetracking' | 'swaps' | 'reports'>('schedule');
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data - in production this would come from context/API
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([
    {
      id: '1',
      name: 'Morning Front Desk',
      startTime: '07:00',
      endTime: '15:00',
      department: 'Front Office',
      requiredStaff: 2,
      type: 'morning',
      breakDuration: 30,
      isActive: true
    },
    {
      id: '2',
      name: 'Evening Housekeeping',
      startTime: '15:00',
      endTime: '23:00',
      department: 'Housekeeping',
      requiredStaff: 3,
      type: 'evening',
      breakDuration: 45,
      isActive: true
    },
    {
      id: '3',
      name: 'Night Security',
      startTime: '23:00',
      endTime: '07:00',
      department: 'Security',
      requiredStaff: 1,
      type: 'night',
      breakDuration: 60,
      isActive: true
    }
  ]);

  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>([
    {
      id: '1',
      userId: '2',
      templateId: '1',
      date: getCurrentDate(),
      startTime: '07:00',
      endTime: '15:00',
      status: 'in-progress',
      actualStartTime: '07:05'
    },
    {
      id: '2',
      userId: '3',
      templateId: '2',
      date: getCurrentDate(),
      startTime: '15:00',
      endTime: '23:00',
      status: 'scheduled'
    }
  ]);

  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);

  const departments = ['Front Office', 'Housekeeping', 'Food & Beverage', 'Security', 'Maintenance', 'Administration'];

  const getShiftTypeIcon = (type: string) => {
    switch (type) {
      case 'morning': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-4 h-4 text-orange-500" />;
      case 'evening': return <Moon className="w-4 h-4 text-blue-500" />;
      case 'night': return <Moon className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clockIn = (scheduleId: string) => {
    setShiftSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            status: 'in-progress',
            actualStartTime: getCurrentTime()
          }
        : schedule
    ));
  };

  const clockOut = (scheduleId: string) => {
    setShiftSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            status: 'completed',
            actualEndTime: getCurrentTime()
          }
        : schedule
    ));
  };

  const startBreak = (scheduleId: string) => {
    setShiftSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            breakStart: getCurrentTime()
          }
        : schedule
    ));
  };

  const endBreak = (scheduleId: string) => {
    setShiftSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            breakEnd: getCurrentTime()
          }
        : schedule
    ));
  };

  const TemplateForm = () => {
    const [formData, setFormData] = useState({
      name: editingTemplate?.name || '',
      startTime: editingTemplate?.startTime || '09:00',
      endTime: editingTemplate?.endTime || '17:00',
      department: editingTemplate?.department || '',
      requiredStaff: editingTemplate?.requiredStaff || 1,
      type: editingTemplate?.type || 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
      breakDuration: editingTemplate?.breakDuration || 30,
      isActive: editingTemplate?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingTemplate) {
        setShiftTemplates(prev => prev.map(template => 
          template.id === editingTemplate.id ? { ...template, ...formData } : template
        ));
      } else {
        const newTemplate: ShiftTemplate = {
          ...formData,
          id: Date.now().toString()
        };
        setShiftTemplates(prev => [...prev, newTemplate]);
      }
      
      setShowTemplateForm(false);
      setEditingTemplate(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              {editingTemplate ? 'Edit Shift Template' : 'Create Shift Template'}
            </h3>
            <button
              onClick={() => {
                setShowTemplateForm(false);
                setEditingTemplate(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Staff</label>
                <input
                  type="number"
                  value={formData.requiredStaff}
                  onChange={(e) => setFormData({ ...formData, requiredStaff: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="15"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Template</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowTemplateForm(false);
                  setEditingTemplate(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const generateWeeklySchedule = () => {
    // Auto-generate schedules for the week based on templates
    const startDate = new Date(selectedDate);
    const schedules: ShiftSchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      shiftTemplates.filter(t => t.isActive).forEach(template => {
        const availableStaff = users.filter(u => u.department === template.department && u.isActive);
        const assignedStaff = availableStaff.slice(0, template.requiredStaff);
        
        assignedStaff.forEach(staff => {
          schedules.push({
            id: `${Date.now()}-${i}-${template.id}-${staff.id}`,
            userId: staff.id,
            templateId: template.id,
            date: dateString,
            startTime: template.startTime,
            endTime: template.endTime,
            status: 'scheduled'
          });
        });
      });
    }
    
    setShiftSchedules(prev => [...prev, ...schedules]);
  };

  const filteredSchedules = shiftSchedules.filter(schedule => {
    const user = users.find(u => u.id === schedule.userId);
    const template = shiftTemplates.find(t => t.id === schedule.templateId);
    
    const matchesDate = schedule.date === selectedDate;
    const matchesDepartment = !selectedDepartment || template?.department === selectedDepartment;
    const matchesSearch = !searchTerm || 
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesDepartment && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-2">Manage staff schedules, time tracking, and shift operations</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowTemplateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
          <button
            onClick={generateWeeklySchedule}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Calendar className="w-4 h-4" />
            <span>Generate Schedule</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'schedule', name: 'Daily Schedule', icon: Calendar },
              { id: 'templates', name: 'Shift Templates', icon: Clock },
              { id: 'timetracking', name: 'Time Tracking', icon: Timer },
              { id: 'swaps', name: 'Shift Swaps', icon: Shuffle },
              { id: 'reports', name: 'Reports', icon: BarChart3 }
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

      {/* Daily Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search staff or shifts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule for {new Date(selectedDate).toLocaleDateString()}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => {
                    const user = users.find(u => u.id === schedule.userId);
                    const template = shiftTemplates.find(t => t.id === schedule.templateId);
                    const isOnBreak = schedule.breakStart && !schedule.breakEnd;
                    
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {user?.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                              <div className="text-sm text-gray-500">{template?.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getShiftTypeIcon(template?.type || '')}
                            <span className="text-sm font-medium text-gray-900">{template?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                          {schedule.actualStartTime && (
                            <div className="text-xs text-gray-500">
                              Actual: {formatTime(schedule.actualStartTime)}
                              {schedule.actualEndTime && ` - ${formatTime(schedule.actualEndTime)}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                              {schedule.status.replace('-', ' ')}
                            </span>
                            {isOnBreak && (
                              <div className="flex items-center space-x-1">
                                <Coffee className="w-3 h-3 text-orange-500" />
                                <span className="text-xs text-orange-600">On Break</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {schedule.status === 'scheduled' && (
                              <button
                                onClick={() => clockIn(schedule.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                <Play className="w-3 h-3" />
                                <span>Clock In</span>
                              </button>
                            )}
                            {schedule.status === 'in-progress' && !isOnBreak && (
                              <>
                                <button
                                  onClick={() => startBreak(schedule.id)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                >
                                  <Coffee className="w-3 h-3" />
                                  <span>Break</span>
                                </button>
                                <button
                                  onClick={() => clockOut(schedule.id)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  <Pause className="w-3 h-3" />
                                  <span>Clock Out</span>
                                </button>
                              </>
                            )}
                            {isOnBreak && (
                              <button
                                onClick={() => endBreak(schedule.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>End Break</span>
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
        </div>
      )}

      {/* Shift Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Shift Templates</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shiftTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getShiftTypeIcon(template.type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.type} shift</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(template.startTime)} - {formatTime(template.endTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.breakDuration}min break
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.requiredStaff} staff
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShiftTemplates(prev => prev.filter(t => t.id !== template.id));
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
      )}

      {/* Time Tracking Tab */}
      {activeTab === 'timetracking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently On Shift</p>
                  <p className="text-3xl font-bold text-green-600">
                    {shiftSchedules.filter(s => s.status === 'in-progress').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Break</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {shiftSchedules.filter(s => s.breakStart && !s.breakEnd).length}
                  </p>
                </div>
                <Coffee className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {shiftSchedules.filter(s => s.status === 'completed' && s.date === getCurrentDate()).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missed Shifts</p>
                  <p className="text-3xl font-bold text-red-600">
                    {shiftSchedules.filter(s => s.status === 'missed').length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Today's Time Tracking</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shiftSchedules.filter(s => s.date === getCurrentDate()).map((schedule) => {
                    const user = users.find(u => u.id === schedule.userId);
                    const hoursWorked = schedule.actualStartTime && schedule.actualEndTime 
                      ? ((new Date(`1970-01-01T${schedule.actualEndTime}`).getTime() - 
                          new Date(`1970-01-01T${schedule.actualStartTime}`).getTime()) / (1000 * 60 * 60)).toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.actualStartTime ? formatTime(schedule.actualStartTime) : '-'}
                          {schedule.actualEndTime ? ` - ${formatTime(schedule.actualEndTime)}` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.breakStart && schedule.breakEnd 
                            ? `${formatTime(schedule.breakStart)} - ${formatTime(schedule.breakEnd)}`
                            : schedule.breakStart 
                              ? `Started ${formatTime(schedule.breakStart)}`
                              : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {hoursWorked}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                            {schedule.status.replace('-', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Hours</h4>
              <div className="space-y-3">
                {departments.map(dept => {
                  const deptSchedules = shiftSchedules.filter(s => {
                    const template = shiftTemplates.find(t => t.id === s.templateId);
                    return template?.department === dept && s.status === 'completed';
                  });
                  const totalHours = deptSchedules.reduce((sum, s) => {
                    if (s.actualStartTime && s.actualEndTime) {
                      const hours = (new Date(`1970-01-01T${s.actualEndTime}`).getTime() - 
                                   new Date(`1970-01-01T${s.actualStartTime}`).getTime()) / (1000 * 60 * 60);
                      return sum + hours;
                    }
                    return sum;
                  }, 0);
                  
                  return (
                    <div key={dept} className="flex justify-between">
                      <span className="text-sm text-gray-600">{dept}</span>
                      <span className="text-sm font-medium">{totalHours.toFixed(1)}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">94.2%</div>
                <p className="text-sm text-gray-600">This week</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Overtime Hours</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">12.5h</div>
                <p className="text-sm text-gray-600">This week</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Export Reports</h4>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Available Reports</h5>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm">Daily Attendance Report</div>
                    <div className="text-xs text-gray-500">Staff attendance for selected date</div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm">Weekly Hours Summary</div>
                    <div className="text-xs text-gray-500">Total hours worked by department</div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm">Overtime Report</div>
                    <div className="text-xs text-gray-500">Staff overtime hours and costs</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Report Settings</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTemplateForm && <TemplateForm />}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Users, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Move,
  Settings,
  Coffee,
  Utensils,
  User,
  Eye
} from 'lucide-react';
import { RestaurantTable } from '../types';

interface TableManagementProps {
  onClose?: () => void;
}

export function TableManagement({ onClose }: TableManagementProps) {
  const { restaurantTables, addRestaurantTable, updateRestaurantTable, deleteRestaurantTable, updateTableStatus } = useHotel();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [draggedTable, setDraggedTable] = useState<RestaurantTable | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || selectedTable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, selectedTable]);

  // Get unique sections for filtering
  const sections = [...new Set(restaurantTables.map(table => table.section).filter(Boolean))];

  // Filter tables based on search and filters
  const filteredTables = restaurantTables.filter(table => {
    const matchesSearch = !searchTerm || 
      table.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || table.status === filterStatus;
    const matchesSection = !filterSection || table.section === filterSection;
    
    return matchesSearch && matchesStatus && matchesSection;
  });

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'cleaning': return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleDragStart = (table: RestaurantTable) => {
    if (!isEditingLayout) return;
    setDraggedTable(table);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditingLayout) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditingLayout || !draggedTable) return;
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateRestaurantTable(draggedTable.id, {
      ...draggedTable,
      position: { x, y }
    });
    
    setDraggedTable(null);
  };

  const TableForm = () => {
    const [formData, setFormData] = useState({
      number: editingTable?.number || '',
      seats: editingTable?.seats || 2,
      status: editingTable?.status || 'available',
      position: editingTable?.position || { x: 100, y: 100 },
      section: editingTable?.section || '',
      tableType: editingTable?.tableType || 'indoor',
      smoking: editingTable?.smoking || false,
      accessibility: editingTable?.accessibility || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingTable) {
        updateRestaurantTable(editingTable.id, formData);
      } else {
        addRestaurantTable(formData);
      }
      
      setShowForm(false);
      setEditingTable(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTable(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Main, Terrace, Bar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table Type</label>
                <select
                  value={formData.tableType}
                  onChange={(e) => setFormData({ ...formData, tableType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.smoking}
                    onChange={(e) => setFormData({ ...formData, smoking: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.accessibility}
                    onChange={(e) => setFormData({ ...formData, accessibility: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Accessibility Friendly</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTable(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingTable ? 'Update Table' : 'Add Table'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TableDetails = () => {
    if (!selectedTable) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Table {selectedTable.number}</h3>
            <button
              onClick={() => setSelectedTable(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
              <div className={`w-32 h-32 rounded-lg flex items-center justify-center ${
                selectedTable.status === 'available' ? 'bg-green-500' :
                selectedTable.status === 'occupied' ? 'bg-red-500' :
                selectedTable.status === 'reserved' ? 'bg-yellow-500' :
                'bg-gray-500'
              } text-white`}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedTable.number}</div>
                  <div className="text-sm">{selectedTable.seats} seats</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTable.status)}`}>
                  {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Section:</span>
                <span className="font-medium">{selectedTable.section || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{selectedTable.tableType || 'Indoor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Smoking:</span>
                <span className="font-medium">{selectedTable.smoking ? 'Allowed' : 'Not allowed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accessibility:</span>
                <span className="font-medium">{selectedTable.accessibility ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setEditingTable(selectedTable);
                  setSelectedTable(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Table
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this table?')) {
                    deleteRestaurantTable(selectedTable.id);
                    setSelectedTable(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Table
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Change Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'available');
                    setSelectedTable({
                      ...selectedTable,
                      status: 'available'
                    });
                  }}
                  className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  Available
                </button>
                <button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'occupied');
                    setSelectedTable({
                      ...selectedTable,
                      status: 'occupied'
                    });
                  }}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  Occupied
                </button>
                <button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'reserved');
                    setSelectedTable({
                      ...selectedTable,
                      status: 'reserved'
                    });
                  }}
                  className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                >
                  Reserved
                </button>
                <button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'cleaning');
                    setSelectedTable({
                      ...selectedTable,
                      status: 'cleaning'
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  Cleaning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-2">Manage restaurant tables, layout, and status</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            className={`flex items-center space-x-2 px-4 py-2 ${
              isEditingLayout ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white rounded-lg transition-colors`}
          >
            <Move className="w-4 h-4" />
            <span>{isEditingLayout ? 'Save Layout' : 'Edit Layout'}</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
          
          {sections.length > 0 && (
            <div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{restaurantTables.filter(t => t.status === 'available').length}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{restaurantTables.filter(t => t.status === 'occupied').length}</div>
          <div className="text-sm text-gray-600">Occupied</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{restaurantTables.filter(t => t.status === 'reserved').length}</div>
          <div className="text-sm text-gray-600">Reserved</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{restaurantTables.filter(t => t.status === 'cleaning').length}</div>
          <div className="text-sm text-gray-600">Cleaning</div>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Floor Plan</h3>
        <div 
          className="relative bg-gray-50 rounded-lg h-96 p-4 border-2 border-dashed border-gray-300"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isEditingLayout && (
            <div className="absolute inset-0 bg-yellow-100 bg-opacity-30 pointer-events-none flex items-center justify-center">
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
                <p className="font-medium">Layout Edit Mode</p>
                <p className="text-sm">Drag tables to reposition them</p>
              </div>
            </div>
          )}
          
          {filteredTables.map((table) => (
            <div
              key={table.id}
              draggable={isEditingLayout}
              onDragStart={() => handleDragStart(table)}
              onClick={() => !isEditingLayout && setSelectedTable(table)}
              className={`absolute w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all ${
                isEditingLayout ? 'cursor-move shadow-lg' : 'cursor-pointer hover:shadow-md'
              } ${
                table.status === 'available' ? 'bg-green-500' :
                table.status === 'occupied' ? 'bg-red-500' :
                table.status === 'reserved' ? 'bg-yellow-500' :
                'bg-gray-500'
              } text-white`}
              style={{ 
                left: `${table.position.x}px`, 
                top: `${table.position.y}px`,
                transform: draggedTable?.id === table.id ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span className="text-xs">{table.tableType === 'outdoor' ? '🌳' : table.tableType === 'private' ? '🔒' : ''}</span>
              <span className="text-sm font-bold">T{table.number}</span>
              <span className="text-xs">{table.seats} seats</span>
              {table.smoking && <span className="text-xs">🚬</span>}
            </div>
          ))}
          
          {filteredTables.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center">
              <Utensils className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No tables found</p>
              <p className="text-sm text-gray-400 text-center mt-2">
                {restaurantTables.length === 0 
                  ? "Add tables to create your restaurant layout" 
                  : "No tables match your current filters"}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Cleaning</span>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Table {table.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.seats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.section || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {table.tableType || 'Indoor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(table.status)}`}>
                      {getStatusIcon(table.status)}
                      <span className="capitalize">{table.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {table.smoking && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          Smoking
                        </span>
                      )}
                      {table.accessibility && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Accessible
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTable(table)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTable(table);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this table?')) {
                            deleteRestaurantTable(table.id);
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

      {showForm && <TableForm />}
      {selectedTable && <TableDetails />}
    </div>
  );
}
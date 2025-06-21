import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Image,
  Star,
  Clock,
  Leaf,
  Flame,
  Eye,
  EyeOff,
  Copy,
  Search,
  Filter,
  Grid,
  List,
  Coffee,
  Wine,
  Sandwich,
  Cookie,
  ChefHat,
  Salad
} from 'lucide-react';
import { MenuCategory, MenuItem } from '../types';

interface MenuManagementProps {
  onClose: () => void;
}

export function MenuManagement({ onClose }: MenuManagementProps) {
  const { formatCurrency, hotelSettings } = useCurrency();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');

  // Demo data - in production, this would come from context/API
  const [categories, setCategories] = useState<MenuCategory[]>([
    {
      id: 'breakfast',
      name: 'Breakfast',
      description: 'Start your day right with our delicious breakfast options',
      icon: 'coffee',
      available: true,
      availableHours: { start: '06:00', end: '11:00' }
    },
    {
      id: 'appetizers',
      name: 'Appetizers',
      description: 'Light bites and starters to whet your appetite',
      icon: 'sandwich',
      available: true,
      availableHours: { start: '11:00', end: '23:00' }
    },
    {
      id: 'mains',
      name: 'Main Courses',
      description: 'Hearty meals and signature entrees',
      icon: 'chef-hat',
      available: true,
      availableHours: { start: '11:00', end: '22:00' }
    },
    {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats and indulgent desserts',
      icon: 'cookie',
      available: true,
      availableHours: { start: '12:00', end: '23:00' }
    },
    {
      id: 'beverages',
      name: 'Beverages',
      description: 'Refreshing drinks and specialty beverages',
      icon: 'wine',
      available: true,
      availableHours: { start: '00:00', end: '23:59' }
    },
    {
      id: 'healthy',
      name: 'Healthy Options',
      description: 'Nutritious and light meals for health-conscious guests',
      icon: 'salad',
      available: true,
      availableHours: { start: '06:00', end: '22:00' }
    }
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 'b1',
      categoryId: 'breakfast',
      name: 'Continental Breakfast',
      description: 'Fresh pastries, seasonal fruits, yogurt, coffee, and juice',
      price: 28,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      available: true,
      preparationTime: 15,
      dietary: ['vegetarian'],
      popular: true,
      calories: 450,
      allergens: ['gluten', 'dairy']
    },
    {
      id: 'b2',
      categoryId: 'breakfast',
      name: 'Full English Breakfast',
      description: 'Eggs, bacon, sausages, baked beans, toast, and grilled tomatoes',
      price: 35,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
      available: true,
      preparationTime: 25,
      dietary: [],
      calories: 680,
      allergens: ['gluten', 'eggs']
    },
    {
      id: 'm1',
      categoryId: 'mains',
      name: 'Grilled Salmon',
      description: 'Atlantic salmon with lemon herb butter, seasonal vegetables, and jasmine rice',
      price: 42,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
      available: true,
      preparationTime: 30,
      dietary: ['healthy', 'gluten-free'],
      popular: true,
      calories: 520,
      allergens: ['fish']
    },
    {
      id: 'd1',
      categoryId: 'desserts',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 16,
      currency: 'USD',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
      available: true,
      preparationTime: 15,
      dietary: ['vegetarian'],
      calories: 380,
      allergens: ['gluten', 'dairy', 'eggs']
    }
  ]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'sandwich': return <Sandwich className="w-6 h-6" />;
      case 'chef-hat': return <ChefHat className="w-6 h-6" />;
      case 'cookie': return <Cookie className="w-6 h-6" />;
      case 'wine': return <Wine className="w-6 h-6" />;
      case 'salad': return <Salad className="w-6 h-6" />;
      default: return <UtensilsCrossed className="w-6 h-6" />;
    }
  };

  const iconOptions = [
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'sandwich', label: 'Sandwich', icon: Sandwich },
    { value: 'chef-hat', label: 'Chef Hat', icon: ChefHat },
    { value: 'cookie', label: 'Cookie', icon: Cookie },
    { value: 'wine', label: 'Wine', icon: Wine },
    { value: 'salad', label: 'Salad', icon: Salad },
    { value: 'utensils', label: 'Utensils', icon: UtensilsCrossed }
  ];

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'healthy', 'keto', 'low-carb'];
  const allergenOptions = ['gluten', 'dairy', 'eggs', 'nuts', 'soy', 'fish', 'shellfish', 'sesame'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    const matchesAvailability = !availabilityFilter || 
      (availabilityFilter === 'available' && item.available) ||
      (availabilityFilter === 'unavailable' && !item.available);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Image upload handler
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      // Create FileReader to convert to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const CategoryForm = () => {
    const [formData, setFormData] = useState({
      name: editingCategory?.name || '',
      description: editingCategory?.description || '',
      icon: editingCategory?.icon || 'utensils',
      available: editingCategory?.available ?? true,
      availableHours: editingCategory?.availableHours || { start: '00:00', end: '23:59' }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingCategory) {
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        ));
      } else {
        const newCategory: MenuCategory = {
          ...formData,
          id: Date.now().toString()
        };
        setCategories(prev => [...prev, newCategory]);
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mx-auto" />
                      <p className="text-xs mt-1">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                <input
                  type="time"
                  value={formData.availableHours.start}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    availableHours: { ...formData.availableHours, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Until</label>
                <input
                  type="time"
                  value={formData.availableHours.end}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    availableHours: { ...formData.availableHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Category Available</span>
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ItemForm = () => {
    const [formData, setFormData] = useState({
      categoryId: editingItem?.categoryId || '',
      name: editingItem?.name || '',
      description: editingItem?.description || '',
      price: editingItem?.price || 0,
      image: editingItem?.image || '',
      available: editingItem?.available ?? true,
      preparationTime: editingItem?.preparationTime || 15,
      dietary: editingItem?.dietary || [],
      spicyLevel: editingItem?.spicyLevel || 0,
      popular: editingItem?.popular || false,
      calories: editingItem?.calories || 0,
      allergens: editingItem?.allergens || [],
      ingredients: editingItem?.ingredients || []
    });

    const [newIngredient, setNewIngredient] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUploadClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setIsUploading(true);
          try {
            const imageUrl = await handleImageUpload(file);
            setFormData({ ...formData, image: imageUrl });
          } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to upload image');
          } finally {
            setIsUploading(false);
          }
        }
      };
      input.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const itemData = {
        ...formData,
        currency: hotelSettings.baseCurrency
      };

      if (editingItem) {
        setMenuItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...itemData } : item
        ));
      } else {
        const newItem: MenuItem = {
          ...itemData,
          id: Date.now().toString()
        };
        setMenuItems(prev => [...prev, newItem]);
      }
      
      setShowItemForm(false);
      setEditingItem(null);
    };

    const toggleDietary = (option: string) => {
      setFormData(prev => ({
        ...prev,
        dietary: prev.dietary.includes(option)
          ? prev.dietary.filter(d => d !== option)
          : [...prev.dietary, option]
      }));
    };

    const toggleAllergen = (allergen: string) => {
      setFormData(prev => ({
        ...prev,
        allergens: prev.allergens.includes(allergen)
          ? prev.allergens.filter(a => a !== allergen)
          : [...prev.allergens, allergen]
      }));
    };

    const addIngredient = () => {
      if (newIngredient.trim()) {
        setFormData(prev => ({
          ...prev,
          ingredients: [...prev.ingredients, newIngredient.trim()]
        }));
        setNewIngredient('');
      }
    };

    const removeIngredient = (index: number) => {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ({hotelSettings.baseCurrency})
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories (optional)</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/image.jpg or upload a file"
                    />
                    <button
                      type="button"
                      onClick={handleImageUploadClick}
                      disabled={isUploading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>
                  
                  {formData.image && (
                    <div className="relative inline-block">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    You can either paste an image URL or upload an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Options</label>
                <div className="grid grid-cols-4 gap-2">
                  {dietaryOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dietary.includes(option)}
                        onChange={() => toggleDietary(option)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                <div className="grid grid-cols-4 gap-2">
                  {allergenOptions.map((allergen) => (
                    <label key={allergen} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm capitalize">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add ingredient"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <span>{ingredient}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spicy Level (0-5)</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mild</span>
                    <span>Medium</span>
                    <span>Hot</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm font-medium">Level: {formData.spicyLevel}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Popular Item</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemForm(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full m-4 max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
              <p className="text-gray-600 mt-1">Manage your restaurant and room service menu</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'categories', name: 'Categories', count: categories.length },
                  { id: 'items', name: 'Menu Items', count: menuItems.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Menu Categories</h3>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          {getCategoryIcon(category.icon)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-500">
                            {category.availableHours.start} - {category.availableHours.end}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category?')) {
                              setCategories(prev => prev.filter(c => c.id !== category.id));
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.available ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {menuItems.filter(item => item.categoryId === category.id).length} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Items</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Menu Items */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const category = categories.find(c => c.id === item.categoryId);
                    return (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-200 relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                            }}
                          />
                          <div className="absolute top-4 left-4 flex space-x-2">
                            {item.popular && (
                              <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                <Star className="w-3 h-3" />
                                <span>Popular</span>
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs font-semibold">
                              {item.preparationTime} min
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {category?.name}
                            </span>
                            {item.calories > 0 && (
                              <span className="text-xs text-gray-500">
                                {item.calories} cal
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.dietary.slice(0, 3).map((diet) => (
                              <span key={diet} className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                <Leaf className="w-3 h-3" />
                                <span>{diet}</span>
                              </span>
                            ))}
                            {item.spicyLevel > 0 && (
                              <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                <Flame className="w-3 h-3" />
                                <span>Spicy {item.spicyLevel}/5</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowItemForm(true);
                              }}
                              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                const newItem = { ...item, id: Date.now().toString(), name: `${item.name} (Copy)` };
                                setMenuItems(prev => [...prev, newItem]);
                              }}
                              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this item?')) {
                                  setMenuItems(prev => prev.filter(i => i.id !== item.id));
                                }
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prep Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => {
                        const category = categories.find(c => c.id === item.categoryId);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg mr-4"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                                  }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                    <span>{item.name}</span>
                                    {item.popular && <Star className="w-4 h-4 text-yellow-500" />}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {category?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.preparationTime} min
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setShowItemForm(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const newItem = { ...item, id: Date.now().toString(), name: `${item.name} (Copy)` };
                                    setMenuItems(prev => [...prev, newItem]);
                                  }}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this item?')) {
                                      setMenuItems(prev => prev.filter(i => i.id !== item.id));
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Forms */}
        {showCategoryForm && <CategoryForm />}
        {showItemForm && <ItemForm />}
      </div>
    </div>
  );
}
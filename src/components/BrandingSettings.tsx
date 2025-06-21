import React, { useState } from 'react';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import { 
  Palette, 
  Upload, 
  Download, 
  RotateCcw, 
  Save, 
  Eye,
  Settings,
  Image,
  Type,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  FileText,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

export function BrandingSettings() {
  const { branding, updateBranding, resetToDefaults, uploadLogo, uploadFavicon, exportBranding, importBranding, formatDateTime, getCurrentDateTime, getTimezoneOffset } = useBranding();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'contact' | 'policies' | 'preview'>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const logoUrl = await uploadLogo(file);
        updateBranding({ logoUrl, updatedBy: user?.id || 'unknown' });
      } catch (error) {
        alert('Failed to upload logo');
      }
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const faviconUrl = await uploadFavicon(file);
        updateBranding({ faviconUrl, updatedBy: user?.id || 'unknown' });
      } catch (error) {
        alert('Failed to upload favicon');
      }
    }
  };

  const handleExport = () => {
    const data = exportBranding();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${branding.hotelName.toLowerCase().replace(/\s+/g, '-')}-branding.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          importBranding(data);
          alert('Branding settings imported successfully!');
        } catch (error) {
          alert('Failed to import branding settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  // Comprehensive timezone list
  const timezones = [
    // Americas
    { value: 'America/New_York', label: 'Eastern Time (New York)', region: 'Americas' },
    { value: 'America/Chicago', label: 'Central Time (Chicago)', region: 'Americas' },
    { value: 'America/Denver', label: 'Mountain Time (Denver)', region: 'Americas' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', region: 'Americas' },
    { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)', region: 'Americas' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)', region: 'Americas' },
    { value: 'America/Toronto', label: 'Eastern Time (Toronto)', region: 'Americas' },
    { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)', region: 'Americas' },
    { value: 'America/Mexico_City', label: 'Central Time (Mexico City)', region: 'Americas' },
    { value: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)', region: 'Americas' },
    { value: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', region: 'Americas' },
    { value: 'America/Lima', label: 'Peru Time (Lima)', region: 'Americas' },
    { value: 'America/Bogota', label: 'Colombia Time (Bogotá)', region: 'Americas' },
    { value: 'America/Caracas', label: 'Venezuela Time (Caracas)', region: 'Americas' },
    
    // Europe
    { value: 'Europe/London', label: 'Greenwich Mean Time (London)', region: 'Europe' },
    { value: 'Europe/Paris', label: 'Central European Time (Paris)', region: 'Europe' },
    { value: 'Europe/Berlin', label: 'Central European Time (Berlin)', region: 'Europe' },
    { value: 'Europe/Rome', label: 'Central European Time (Rome)', region: 'Europe' },
    { value: 'Europe/Madrid', label: 'Central European Time (Madrid)', region: 'Europe' },
    { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)', region: 'Europe' },
    { value: 'Europe/Brussels', label: 'Central European Time (Brussels)', region: 'Europe' },
    { value: 'Europe/Vienna', label: 'Central European Time (Vienna)', region: 'Europe' },
    { value: 'Europe/Zurich', label: 'Central European Time (Zurich)', region: 'Europe' },
    { value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)', region: 'Europe' },
    { value: 'Europe/Oslo', label: 'Central European Time (Oslo)', region: 'Europe' },
    { value: 'Europe/Copenhagen', label: 'Central European Time (Copenhagen)', region: 'Europe' },
    { value: 'Europe/Helsinki', label: 'Eastern European Time (Helsinki)', region: 'Europe' },
    { value: 'Europe/Warsaw', label: 'Central European Time (Warsaw)', region: 'Europe' },
    { value: 'Europe/Prague', label: 'Central European Time (Prague)', region: 'Europe' },
    { value: 'Europe/Budapest', label: 'Central European Time (Budapest)', region: 'Europe' },
    { value: 'Europe/Bucharest', label: 'Eastern European Time (Bucharest)', region: 'Europe' },
    { value: 'Europe/Athens', label: 'Eastern European Time (Athens)', region: 'Europe' },
    { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)', region: 'Europe' },
    { value: 'Europe/Moscow', label: 'Moscow Time (Moscow)', region: 'Europe' },
    
    // Asia
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)', region: 'Asia' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)', region: 'Asia' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (Hong Kong)', region: 'Asia' },
    { value: 'Asia/Singapore', label: 'Singapore Time (Singapore)', region: 'Asia' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)', region: 'Asia' },
    { value: 'Asia/Taipei', label: 'Taipei Time (Taipei)', region: 'Asia' },
    { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)', region: 'Asia' },
    { value: 'Asia/Jakarta', label: 'Western Indonesia Time (Jakarta)', region: 'Asia' },
    { value: 'Asia/Manila', label: 'Philippine Time (Manila)', region: 'Asia' },
    { value: 'Asia/Kuala_Lumpur', label: 'Malaysia Time (Kuala Lumpur)', region: 'Asia' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Indochina Time (Ho Chi Minh)', region: 'Asia' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (Kolkata)', region: 'Asia' },
    { value: 'Asia/Mumbai', label: 'India Standard Time (Mumbai)', region: 'Asia' },
    { value: 'Asia/Delhi', label: 'India Standard Time (Delhi)', region: 'Asia' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (Karachi)', region: 'Asia' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (Dhaka)', region: 'Asia' },
    { value: 'Asia/Kathmandu', label: 'Nepal Time (Kathmandu)', region: 'Asia' },
    { value: 'Asia/Colombo', label: 'Sri Lanka Time (Colombo)', region: 'Asia' },
    
    // Middle East
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)', region: 'Middle East' },
    { value: 'Asia/Riyadh', label: 'Arabia Standard Time (Riyadh)', region: 'Middle East' },
    { value: 'Asia/Kuwait', label: 'Arabia Standard Time (Kuwait)', region: 'Middle East' },
    { value: 'Asia/Qatar', label: 'Arabia Standard Time (Qatar)', region: 'Middle East' },
    { value: 'Asia/Bahrain', label: 'Arabia Standard Time (Bahrain)', region: 'Middle East' },
    { value: 'Asia/Muscat', label: 'Gulf Standard Time (Muscat)', region: 'Middle East' },
    { value: 'Asia/Tehran', label: 'Iran Standard Time (Tehran)', region: 'Middle East' },
    { value: 'Asia/Baghdad', label: 'Arabia Standard Time (Baghdad)', region: 'Middle East' },
    { value: 'Asia/Jerusalem', label: 'Israel Standard Time (Jerusalem)', region: 'Middle East' },
    { value: 'Asia/Beirut', label: 'Eastern European Time (Beirut)', region: 'Middle East' },
    
    // Africa
    { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)', region: 'Africa' },
    { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (Johannesburg)', region: 'Africa' },
    { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)', region: 'Africa' },
    { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)', region: 'Africa' },
    { value: 'Africa/Casablanca', label: 'Western European Time (Casablanca)', region: 'Africa' },
    { value: 'Africa/Tunis', label: 'Central European Time (Tunis)', region: 'Africa' },
    { value: 'Africa/Algiers', label: 'Central European Time (Algiers)', region: 'Africa' },
    { value: 'Africa/Addis_Ababa', label: 'East Africa Time (Addis Ababa)', region: 'Africa' },
    
    // Oceania
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)', region: 'Oceania' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)', region: 'Oceania' },
    { value: 'Australia/Brisbane', label: 'Australian Eastern Time (Brisbane)', region: 'Oceania' },
    { value: 'Australia/Perth', label: 'Australian Western Time (Perth)', region: 'Oceania' },
    { value: 'Australia/Adelaide', label: 'Australian Central Time (Adelaide)', region: 'Oceania' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)', region: 'Oceania' },
    { value: 'Pacific/Fiji', label: 'Fiji Time (Suva)', region: 'Oceania' },
    { value: 'Pacific/Tahiti', label: 'Tahiti Time (Tahiti)', region: 'Oceania' }
  ];

  // Group timezones by region
  const groupedTimezones = timezones.reduce((acc, tz) => {
    if (!acc[tz.region]) {
      acc[tz.region] = [];
    }
    acc[tz.region].push(tz);
    return acc;
  }, {} as Record<string, typeof timezones>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Branding & Settings</h1>
          <p className="text-gray-600 mt-2">Customize your hotel's appearance and information</p>
          <div className="mt-2 text-sm text-gray-500">
            Current time: {formatDateTime(getCurrentDateTime())} ({getTimezoneOffset()})
          </div>
        </div>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', name: 'General Info', icon: Settings },
              { id: 'design', name: 'Design & Theme', icon: Palette },
              { id: 'contact', name: 'Contact & Location', icon: MapPin },
              { id: 'policies', name: 'Policies', icon: FileText },
              { id: 'preview', name: 'Preview', icon: Eye }
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

      {/* General Info Tab */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                <input
                  type="text"
                  value={branding.hotelName}
                  onChange={(e) => updateBranding({ hotelName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
                <select
                  value={branding.starRating}
                  onChange={(e) => updateBranding({ starRating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                <input
                  type="number"
                  value={branding.establishedYear || ''}
                  onChange={(e) => updateBranding({ establishedYear: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={branding.licenseNumber || ''}
                  onChange={(e) => updateBranding({ licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={branding.description}
                onChange={(e) => updateBranding({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Free WiFi', 'Fitness Center', 'Swimming Pool', 'Spa & Wellness',
                  'Business Center', 'Restaurant & Bar', 'Room Service', 'Concierge',
                  'Valet Parking', 'Airport Shuttle', 'Pet Friendly', 'Laundry Service'
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={branding.amenities.includes(amenity)}
                      onChange={(e) => {
                        const amenities = e.target.checked
                          ? [...branding.amenities, amenity]
                          : branding.amenities.filter(a => a !== amenity);
                        updateBranding({ amenities });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours & Timezone</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                <input
                  type="time"
                  value={branding.checkInTime}
                  onChange={(e) => updateBranding({ checkInTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                <input
                  type="time"
                  value={branding.checkOutTime}
                  onChange={(e) => updateBranding({ checkOutTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select
                  value={branding.timeZone}
                  onChange={(e) => updateBranding({ timeZone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(groupedTimezones).map(([region, timezones]) => (
                    <optgroup key={region} label={region}>
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Current Hotel Time</span>
              </div>
              <p className="text-lg font-semibold text-blue-900">
                {formatDateTime(getCurrentDateTime())}
              </p>
              <p className="text-sm text-blue-700">
                Timezone: {branding.timeZone} ({getTimezoneOffset()})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Design & Theme Tab */}
      {activeTab === 'design' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Logo & Branding</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {branding.logoUrl ? (
                    <div className="space-y-4">
                      <img
                        src={branding.logoUrl}
                        alt="Hotel Logo"
                        className="max-h-24 mx-auto"
                      />
                      <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Change Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Image className="w-12 h-12 text-gray-400 mx-auto" />
                      <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {branding.faviconUrl ? (
                    <div className="space-y-4">
                      <img
                        src={branding.faviconUrl}
                        alt="Favicon"
                        className="w-8 h-8 mx-auto"
                      />
                      <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Change Favicon</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Image className="w-8 h-8 text-gray-400 mx-auto" />
                      <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload Favicon</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Color Scheme</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColorPicker
                label="Primary Color"
                value={branding.primaryColor}
                onChange={(color) => updateBranding({ primaryColor: color })}
              />
              <ColorPicker
                label="Secondary Color"
                value={branding.secondaryColor}
                onChange={(color) => updateBranding({ secondaryColor: color })}
              />
              <ColorPicker
                label="Accent Color"
                value={branding.accentColor}
                onChange={(color) => updateBranding({ accentColor: color })}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                <select
                  value={branding.theme.headerStyle}
                  onChange={(e) => updateBranding({ 
                    theme: { ...branding.theme, headerStyle: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Style</label>
                <select
                  value={branding.theme.sidebarStyle}
                  onChange={(e) => updateBranding({ 
                    theme: { ...branding.theme, sidebarStyle: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="colored">Colored</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Style</label>
                <select
                  value={branding.theme.cardStyle}
                  onChange={(e) => updateBranding({ 
                    theme: { ...branding.theme, cardStyle: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="elevated">Elevated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={branding.theme.fontFamily}
                  onChange={(e) => updateBranding({ 
                    theme: { ...branding.theme, fontFamily: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="inter">Inter</option>
                  <option value="roboto">Roboto</option>
                  <option value="poppins">Poppins</option>
                  <option value="montserrat">Montserrat</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Custom CSS</h3>
            <textarea
              value={branding.customCSS || ''}
              onChange={(e) => updateBranding({ customCSS: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              rows={10}
              placeholder="/* Add your custom CSS here */"
            />
          </div>
        </div>
      )}

      {/* Contact & Location Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={branding.contact.phone}
                  onChange={(e) => updateBranding({ 
                    contact: { ...branding.contact, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={branding.contact.email}
                  onChange={(e) => updateBranding({ 
                    contact: { ...branding.contact, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={branding.contact.website || ''}
                  onChange={(e) => updateBranding({ 
                    contact: { ...branding.contact, website: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="www.example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fax Number</label>
                <input
                  type="tel"
                  value={branding.contact.fax || ''}
                  onChange={(e) => updateBranding({ 
                    contact: { ...branding.contact, fax: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Address</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={branding.address.street}
                  onChange={(e) => updateBranding({ 
                    address: { ...branding.address, street: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={branding.address.city}
                    onChange={(e) => updateBranding({ 
                      address: { ...branding.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={branding.address.state}
                    onChange={(e) => updateBranding({ 
                      address: { ...branding.address, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={branding.address.zipCode}
                    onChange={(e) => updateBranding({ 
                      address: { ...branding.address, zipCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={branding.address.country}
                  onChange={(e) => updateBranding({ 
                    address: { ...branding.address, country: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  value={branding.socialMedia?.facebook || ''}
                  onChange={(e) => updateBranding({ 
                    socialMedia: { ...branding.socialMedia, facebook: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://facebook.com/yourhotel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  value={branding.socialMedia?.twitter || ''}
                  onChange={(e) => updateBranding({ 
                    socialMedia: { ...branding.socialMedia, twitter: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://twitter.com/yourhotel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  value={branding.socialMedia?.instagram || ''}
                  onChange={(e) => updateBranding({ 
                    socialMedia: { ...branding.socialMedia, instagram: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://instagram.com/yourhotel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={branding.socialMedia?.linkedin || ''}
                  onChange={(e) => updateBranding({ 
                    socialMedia: { ...branding.socialMedia, linkedin: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/company/yourhotel"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Hotel Policies</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                <textarea
                  value={branding.policies.cancellationPolicy}
                  onChange={(e) => updateBranding({ 
                    policies: { ...branding.policies, cancellationPolicy: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Policy</label>
                <textarea
                  value={branding.policies.petPolicy}
                  onChange={(e) => updateBranding({ 
                    policies: { ...branding.policies, petPolicy: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Policy</label>
                <textarea
                  value={branding.policies.smokingPolicy}
                  onChange={(e) => updateBranding({ 
                    policies: { ...branding.policies, smokingPolicy: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child Policy</label>
                <textarea
                  value={branding.policies.childPolicy}
                  onChange={(e) => updateBranding({ 
                    policies: { ...branding.policies, childPolicy: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg ${previewDevice === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-lg ${previewDevice === 'tablet' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Tablet className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg ${previewDevice === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className={`mx-auto border border-gray-300 rounded-lg overflow-hidden ${
              previewDevice === 'desktop' ? 'max-w-full' :
              previewDevice === 'tablet' ? 'max-w-2xl' :
              'max-w-sm'
            }`}>
              <div className="bg-gray-100 p-2 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600">
                  {branding.contact.website || 'www.yourhotel.com'}
                </div>
              </div>
              
              <div className="bg-white">
                {/* Preview Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    {branding.logoUrl ? (
                      <img
                        src={branding.logoUrl}
                        alt={`${branding.hotelName} Logo`}
                        className="h-8 w-auto"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        <span className="text-white text-xs font-bold">
                          {branding.hotelName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">{branding.hotelName}</h1>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: branding.starRating }, (_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to {branding.hotelName}</h2>
                    <p className="text-gray-600 text-sm">{branding.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: `${branding.primaryColor}20`, color: branding.primaryColor }}
                    >
                      <Clock className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Check-in: {branding.checkInTime}</p>
                    </div>
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: `${branding.accentColor}20`, color: branding.accentColor }}
                    >
                      <Clock className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Check-out: {branding.checkOutTime}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Contact Information</h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{branding.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>{branding.contact.email}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <div>
                          <p>{branding.address.street}</p>
                          <p>{branding.address.city}, {branding.address.state} {branding.address.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
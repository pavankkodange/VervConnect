import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { HotelBranding } from '../types';

interface BrandingContextType {
  branding: HotelBranding;
  updateBranding: (updates: Partial<HotelBranding>) => void;
  resetToDefaults: () => void;
  uploadLogo: (file: File) => Promise<string>;
  uploadFavicon: (file: File) => Promise<string>;
  applyTheme: () => void;
  exportBranding: () => string;
  importBranding: (data: string) => void;
  formatDateTime: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (time: string) => string;
  formatDate: (date: string | Date) => string;
  getCurrentDateTime: () => string;
  getCurrentDate: () => string;
  getCurrentTime: () => string;
  convertToHotelTime: (utcDate: string | Date) => Date;
  getTimezoneOffset: () => string;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_BRANDING: HotelBranding = {
  id: '1',
  hotelName: 'Harmony Suites',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#4F46E5', // Indigo-600
  secondaryColor: '#6366F1', // Indigo-500
  accentColor: '#10B981', // Emerald-500
  address: {
    street: '123 Luxury Avenue',
    city: 'Metropolitan City',
    state: 'State',
    zipCode: '12345',
    country: 'Country'
  },
  contact: {
    phone: '+1 (555) 123-4567',
    email: 'info@harmonysuite.com',
    website: 'www.harmonysuite.com',
    fax: '+1 (555) 123-4568'
  },
  description: 'Experience luxury and comfort at Harmony Suites, where exceptional service meets modern elegance. Our premium accommodations and world-class amenities ensure an unforgettable stay.',
  amenities: [
    'Free WiFi',
    'Fitness Center',
    'Swimming Pool',
    'Spa & Wellness',
    'Business Center',
    'Restaurant & Bar',
    'Room Service',
    'Concierge',
    'Valet Parking',
    'Airport Shuttle'
  ],
  checkInTime: '15:00',
  checkOutTime: '11:00',
  timeZone: 'America/New_York',
  starRating: 5,
  establishedYear: 2010,
  licenseNumber: 'HTL-2024-001',
  taxId: 'TAX-123456789',
  socialMedia: {
    facebook: 'https://facebook.com/harmonysuite',
    twitter: 'https://twitter.com/harmonysuite',
    instagram: 'https://instagram.com/harmonysuite',
    linkedin: 'https://linkedin.com/company/harmonysuite'
  },
  policies: {
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in. Late cancellations subject to one night charge.',
    petPolicy: 'Pets are welcome with advance notice. Additional cleaning fee may apply.',
    smokingPolicy: 'Non-smoking property. Designated smoking areas available outdoors.',
    childPolicy: 'Children under 12 stay free when using existing bedding. Cribs available upon request.'
  },
  theme: {
    headerStyle: 'modern',
    sidebarStyle: 'light',
    cardStyle: 'rounded',
    fontFamily: 'inter'
  },
  customCSS: '',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<HotelBranding>(DEFAULT_BRANDING);

  // Load branding from localStorage on mount
  useEffect(() => {
    const savedBranding = localStorage.getItem('hotelBranding');
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding);
        // Fix any invalid timezone values that might be stored
        if (parsed.timeZone === 'Asia/Mumbai') {
          parsed.timeZone = 'Asia/Kolkata';
        }
        setBranding({ ...DEFAULT_BRANDING, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved branding:', error);
      }
    }
  }, []);

  // Apply theme whenever branding changes
  useEffect(() => {
    applyTheme();
  }, [branding]);

  const updateBranding = (updates: Partial<HotelBranding>) => {
    // Fix timezone if it's the invalid 'Asia/Mumbai'
    if (updates.timeZone === 'Asia/Mumbai') {
      updates.timeZone = 'Asia/Kolkata';
    }
    
    const updatedBranding = {
      ...branding,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    setBranding(updatedBranding);
    localStorage.setItem('hotelBranding', JSON.stringify(updatedBranding));
  };

  const resetToDefaults = () => {
    setBranding(DEFAULT_BRANDING);
    localStorage.removeItem('hotelBranding');
  };

  const uploadLogo = async (file: File): Promise<string> => {
    // In a real application, this would upload to a cloud storage service
    // For demo purposes, we'll create a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFavicon = async (file: File): Promise<string> => {
    // Similar to logo upload
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for colors
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    root.style.setProperty('--accent-color', branding.accentColor);
    
    // Apply font family
    const fontMap = {
      inter: '"Inter", sans-serif',
      roboto: '"Roboto", sans-serif',
      poppins: '"Poppins", sans-serif',
      montserrat: '"Montserrat", sans-serif'
    };
    root.style.setProperty('--font-family', fontMap[branding.theme.fontFamily]);
    
    // Update page title and favicon - Keep VervConnect branding for the app
    document.title = `VervConnect - Connect with Comfort`;
    
    if (branding.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = branding.faviconUrl;
    }
    
    // Apply custom CSS if provided
    if (branding.customCSS) {
      let customStyle = document.getElementById('custom-hotel-styles');
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-hotel-styles';
        document.head.appendChild(customStyle);
      }
      customStyle.textContent = branding.customCSS;
    }
  };

  const exportBranding = (): string => {
    return JSON.stringify(branding, null, 2);
  };

  const importBranding = (data: string) => {
    try {
      const imported = JSON.parse(data);
      // Fix timezone if it's the invalid 'Asia/Mumbai'
      if (imported.timeZone === 'Asia/Mumbai') {
        imported.timeZone = 'Asia/Kolkata';
      }
      updateBranding(imported);
    } catch (error) {
      throw new Error('Invalid branding data format');
    }
  };

  // Helper function to validate and fix timezone
  const getValidTimeZone = (timeZone: string): string => {
    if (timeZone === 'Asia/Mumbai') {
      return 'Asia/Kolkata';
    }
    
    // Test if the timezone is valid
    try {
      new Date().toLocaleString('en-US', { timeZone });
      return timeZone;
    } catch (error) {
      console.warn(`Invalid timezone ${timeZone}, falling back to America/New_York`);
      return 'America/New_York';
    }
  };

  // Timezone-aware date/time formatting functions
  const convertToHotelTime = (utcDate: string | Date): Date => {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return new Date(date.toLocaleString("en-US", { timeZone: validTimeZone }));
  };

  const formatDateTime = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const validTimeZone = getValidTimeZone(branding.timeZone);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: validTimeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return dateObj.toLocaleString('en-US', { ...defaultOptions, ...options });
  };

  const formatTime = (time: string): string => {
    // Handle both HH:MM format and full datetime strings
    let timeToFormat: Date;
    
    if (time.includes('T') || time.includes(' ')) {
      // Full datetime string
      timeToFormat = new Date(time);
    } else {
      // Just time string (HH:MM)
      const today = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      timeToFormat = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    }
    
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return timeToFormat.toLocaleTimeString('en-US', {
      timeZone: validTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return dateObj.toLocaleDateString('en-US', {
      timeZone: validTimeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return now.toLocaleString('sv-SE', { timeZone: validTimeZone }).replace(' ', 'T');
  };

  const getCurrentDate = (): string => {
    const now = new Date();
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return now.toLocaleDateString('sv-SE', { timeZone: validTimeZone });
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    const validTimeZone = getValidTimeZone(branding.timeZone);
    return now.toLocaleTimeString('en-US', {
      timeZone: validTimeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimezoneOffset = (): string => {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const validTimeZone = getValidTimeZone(branding.timeZone);
    const hotelTime = new Date(utc.toLocaleString("en-US", { timeZone: validTimeZone }));
    const offset = (hotelTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <BrandingContext.Provider value={{
      branding,
      updateBranding,
      resetToDefaults,
      uploadLogo,
      uploadFavicon,
      applyTheme,
      exportBranding,
      importBranding,
      formatDateTime,
      formatTime,
      formatDate,
      getCurrentDateTime,
      getCurrentDate,
      getCurrentTime,
      convertToHotelTime,
      getTimezoneOffset
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
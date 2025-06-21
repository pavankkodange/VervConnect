import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Currency, HotelSettings } from '../types';

interface CurrencyContextType {
  currencies: Currency[];
  hotelSettings: HotelSettings;
  updateHotelSettings: (settings: Partial<HotelSettings>) => void;
  convertAmount: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, currency?: string, options?: { showCode?: boolean }) => string;
  getCurrencySymbol: (currencyCode: string) => string;
  getCurrencyName: (currencyCode: string) => string;
  updateExchangeRates: () => Promise<void>;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Comprehensive list of world currencies with symbols
const WORLD_CURRENCIES: Currency[] = [
  // Major Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.42 },
  
  // Asian Currencies
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1180.0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.8 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 33.0 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.15 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 14250.0 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 50.5 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 23000.0 },
  
  // Middle Eastern Currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', rate: 3.64 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', rate: 0.30 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', rate: 0.38 },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', rate: 0.38 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', rate: 0.71 },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', rate: 1507.5 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', rate: 3.25 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 8.5 },
  
  // European Currencies
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 8.6 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 8.7 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 6.35 },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', rate: 3.9 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 21.5 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 295.0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', rate: 4.15 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', rate: 1.66 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', rate: 6.4 },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', rate: 100.0 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 73.5 },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', rate: 27.0 },
  
  // African Currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 14.8 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', rate: 15.7 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 411.0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 108.0 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 6.1 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', rate: 9.0 },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', rate: 2.8 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rate: 43.5 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 3550.0 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2320.0 },
  
  // Latin American Currencies
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 20.1 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', rate: 98.5 },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', rate: 795.0 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', rate: 3750.0 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', rate: 4.0 },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', rate: 43.5 },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', rate: 6.9 },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', rate: 6850.0 },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', rate: 4200000.0 },
  
  // Other Notable Currencies
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', rate: 127.0 },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', rate: 558.0 },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', rate: 558.0 },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', rate: 2.7 },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', rate: 2.1 },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', rate: 2.3 },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', rate: 2.6 },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', rate: 3.5 },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', rate: 8.0 },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', rate: 112.0 },
];

const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  baseCurrency: 'USD',
  displayCurrency: 'USD',
  autoConvert: true,
  decimalPlaces: 2,
  showCurrencyCode: false
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>(WORLD_CURRENCIES);
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('hotelCurrencySettings');
    if (savedSettings) {
      setHotelSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateHotelSettings = (newSettings: Partial<HotelSettings>) => {
    const updatedSettings = { ...hotelSettings, ...newSettings };
    setHotelSettings(updatedSettings);
    localStorage.setItem('hotelCurrencySettings', JSON.stringify(updatedSettings));
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || hotelSettings.displayCurrency;
    
    if (fromCurrency === targetCurrency) {
      return amount;
    }

    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === targetCurrency)?.rate || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    const convertedAmount = usdAmount * toRate;
    
    return Math.round(convertedAmount * Math.pow(10, hotelSettings.decimalPlaces)) / Math.pow(10, hotelSettings.decimalPlaces);
  };

  const formatCurrency = (amount: number, currency?: string, options?: { showCode?: boolean }): string => {
    const currencyCode = currency || hotelSettings.displayCurrency;
    const currencyData = currencies.find(c => c.code === currencyCode);
    const symbol = currencyData?.symbol || currencyCode;
    const showCode = options?.showCode ?? hotelSettings.showCurrencyCode;
    
    const formattedAmount = amount.toLocaleString(undefined, {
      minimumFractionDigits: hotelSettings.decimalPlaces,
      maximumFractionDigits: hotelSettings.decimalPlaces
    });

    if (showCode) {
      return `${symbol} ${formattedAmount} ${currencyCode}`;
    }
    
    return `${symbol} ${formattedAmount}`;
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    return currencies.find(c => c.code === currencyCode)?.symbol || currencyCode;
  };

  const getCurrencyName = (currencyCode: string): string => {
    return currencies.find(c => c.code === currencyCode)?.name || currencyCode;
  };

  // Mock function for updating exchange rates (in production, this would call a real API)
  const updateExchangeRates = async (): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would fetch real exchange rates from an API like:
      // - https://api.exchangerate-api.com/
      // - https://openexchangerates.org/
      // - https://fixer.io/
      
      // For demo purposes, we'll just update the timestamp
      setLastUpdated(new Date());
      
      // You could also slightly randomize rates for demo purposes:
      // setCurrencies(prev => prev.map(currency => ({
      //   ...currency,
      //   rate: currency.code === 'USD' ? 1.0 : currency.rate * (0.98 + Math.random() * 0.04)
      // })));
      
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currencies,
      hotelSettings,
      updateHotelSettings,
      convertAmount,
      formatCurrency,
      getCurrencySymbol,
      getCurrencyName,
      updateExchangeRates,
      lastUpdated
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
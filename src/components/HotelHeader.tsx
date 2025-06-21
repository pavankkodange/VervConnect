import React from 'react';
import { useBranding } from '../context/BrandingContext';
import { VervConnectLogo } from './VervConnectLogo';
import { Hotel, Star, MapPin, Phone, Mail, Globe, Building } from 'lucide-react';

interface HotelHeaderProps {
  variant?: 'full' | 'compact' | 'minimal';
  showContact?: boolean;
  showRating?: boolean;
  showAddress?: boolean;
  className?: string;
}

export function HotelHeader({ 
  variant = 'compact', 
  showContact = false, 
  showRating = false, 
  showAddress = false,
  className = ''
}: HotelHeaderProps) {
  const { branding } = useBranding();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={`${branding.hotelName} Logo`}
            className="h-8 w-auto"
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Building className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-xl font-bold text-gray-900">{branding.hotelName}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-3">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={`${branding.hotelName} Logo`}
              className="h-10 w-auto"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Building className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{branding.hotelName}</h1>
            {showRating && branding.starRating > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(branding.starRating)}
                <span className="text-sm text-gray-600 ml-2">{branding.starRating} Star Hotel</span>
              </div>
            )}
          </div>
        </div>
        
        {showContact && (
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{branding.contact.phone}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="w-4 h-4" />
              <span>{branding.contact.email}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={`${branding.hotelName} Logo`}
                className="h-16 w-auto"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor }}
              >
                <Building className="w-10 h-10 text-white" />
              </div>
            )}
            
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{branding.hotelName}</h1>
              
              {showRating && branding.starRating > 0 && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(branding.starRating)}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">{branding.starRating} Star Hotel</span>
                  {branding.establishedYear && (
                    <span className="text-gray-500">• Est. {branding.establishedYear}</span>
                  )}
                </div>
              )}
              
              <p className="text-gray-600 max-w-2xl leading-relaxed">{branding.description}</p>
              
              {showAddress && (
                <div className="mt-4 flex items-start space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{branding.address.street}</p>
                    <p>{branding.address.city}, {branding.address.state} {branding.address.zipCode}</p>
                    <p>{branding.address.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {showContact && (
            <div className="text-right space-y-3">
              <div className="flex items-center space-x-2 justify-end">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900">{branding.contact.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 justify-end">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{branding.contact.email}</span>
              </div>
              
              {branding.contact.website && (
                <div className="flex items-center space-x-2 justify-end">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`https://${branding.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    {branding.contact.website}
                  </a>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Check-in: {branding.checkInTime}</p>
                <p className="text-sm text-gray-600">Check-out: {branding.checkOutTime}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Amenities */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {branding.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full border"
                style={{ 
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  backgroundColor: `${branding.primaryColor}10`
                }}
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
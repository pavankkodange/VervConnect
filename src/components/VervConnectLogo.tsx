import React from 'react';

interface VervConnectLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function VervConnectLogo({ size = 'md', animated = true, className = '' }: VervConnectLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <>
      {animated && (
        <style>{`
          @keyframes vervLogoFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(1deg); }
          }
          
          @keyframes vervLogoPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.95; transform: scale(1.02); }
          }
          
          @keyframes vervLogoGlow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3)); }
            25% { filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.4)); }
            50% { filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3)); }
            75% { filter: drop-shadow(0 0 14px rgba(99, 102, 241, 0.4)); }
          }
          
          .verv-logo-container:hover img {
            animation-duration: 1s;
          }
        `}</style>
      )}
      
      <div className={`verv-logo-container ${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <img
          src="/Only Logo for Hotel copy copy copy.png"
          alt="VervConnect Logo"
          className={`${sizeClasses[size]} object-contain rounded-lg`}
          style={{ 
            animation: animated ? 'vervLogoFloat 3s ease-in-out infinite, vervLogoPulse 4s ease-in-out infinite, vervLogoGlow 5s ease-in-out infinite' : 'none'
          }}
          onError={(e) => {
            // Fallback to SVG if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackSvg = target.nextElementSibling as HTMLElement;
            if (fallbackSvg) {
              fallbackSvg.style.display = 'block';
            }
          }}
        />
        
        {/* Fallback SVG (hidden by default) */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className={`${sizeClasses[size]} object-contain hidden`}
          style={{ 
            animation: animated ? 'vervLogoFloat 3s ease-in-out infinite, vervLogoPulse 4s ease-in-out infinite, vervLogoGlow 5s ease-in-out infinite' : 'none'
          }}
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#vervGradient)"
            stroke="url(#vervBorder)"
            strokeWidth="2"
          />
          
          {/* Connection Nodes */}
          <circle cx="30" cy="30" r="8" fill="url(#nodeGradient1)" />
          <circle cx="70" cy="30" r="8" fill="url(#nodeGradient2)" />
          <circle cx="30" cy="70" r="8" fill="url(#nodeGradient3)" />
          <circle cx="70" cy="70" r="8" fill="url(#nodeGradient4)" />
          <circle cx="50" cy="50" r="10" fill="url(#centerGradient)" />
          
          {/* Connection Lines */}
          <line x1="30" y1="30" x2="50" y2="50" stroke="url(#lineGradient1)" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="30" x2="50" y2="50" stroke="url(#lineGradient2)" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="70" x2="50" y2="50" stroke="url(#lineGradient3)" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="70" x2="50" y2="50" stroke="url(#lineGradient4)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Letter V in center */}
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="white"
            fontFamily="Arial, sans-serif"
          >
            V
          </text>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="vervGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            
            <linearGradient id="vervBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            
            <radialGradient id="nodeGradient1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>
            
            <radialGradient id="nodeGradient2">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
            
            <radialGradient id="nodeGradient3">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>
            
            <radialGradient id="nodeGradient4">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
            
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            
            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            
            <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { VervConnectLogo } from './VervConnectLogo';
import { Lock, Mail, Shield } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { login } = useAuth();
  const { branding } = useBranding();

  const demoAccounts = [
    { role: 'admin', email: 'admin@harmonysuite.com', name: 'Alex Thompson - Administrator', icon: Shield, color: 'purple' },
    { role: 'manager', email: 'sarah@harmonysuite.com', name: 'Sarah Johnson - Manager', icon: Shield, color: 'blue' },
    { role: 'front-desk', email: 'mike@harmonysuite.com', name: 'Mike Chen - Front Desk', icon: Shield, color: 'green' },
    { role: 'housekeeping', email: 'lisa@harmonysuite.com', name: 'Lisa Rodriguez - Housekeeping', icon: Shield, color: 'orange' },
    { role: 'restaurant', email: 'david@harmonysuite.com', name: 'David Kim - Restaurant', icon: Shield, color: 'red' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password || 'demo');
      if (!success) {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f8fafc 50%, #f1f5f9 75%, #e2e8f0 100%)'
      }}
    >
      {/* Floating Elements - Bright and Welcoming */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-sky-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300/30 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-purple-300/25 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-cyan-300/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-10 left-1/3 w-20 h-20 bg-emerald-300/25 rounded-full blur-lg animate-float"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 border border-gray-200/50">
          <div className="text-center mb-6 lg:mb-8">
            <div className="mb-4 lg:mb-6">
              {/* VervConnect Logo with bright branding */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 lg:mb-6">
                <VervConnectLogo size="xl" animated={true} />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    VervConnect
                  </h1>
                </div>
              </div>
              
              {/* Tagline with bright colors */}
              <div className="mb-4">
                <p className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  "Connect with Comfort"
                </p>
              </div>
            </div>
            <p className="text-gray-600 mt-2 font-medium">Hotel Management Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 lg:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-600 rounded-full font-medium">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 lg:mt-6 space-y-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.email)}
                    className="w-full text-left px-3 lg:px-4 py-3 text-sm text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all bg-white touch-manipulation active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{account.name}</div>
                        <div className="text-xs text-gray-500 truncate">{account.email}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 lg:mt-6 p-3 lg:p-4 rounded-xl border border-blue-200 bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-blue-800">
                  Administrator Access
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Use the Administrator account to access the full hotel configuration panel, including room setup, banquet hall management, branding customization, and system settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
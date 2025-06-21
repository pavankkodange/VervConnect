import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CommunicationProvider } from './context/CommunicationContext';
import { FinancialProvider } from './context/FinancialContext';
import { OperationsProvider } from './context/OperationsContext';
import { SecurityProvider } from './context/SecurityContext';
import { BrandingProvider } from './context/BrandingContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RoomsModule } from './components/RoomsModule';
import { HousekeepingModule } from './components/HousekeepingModule';
import { BanquetModule } from './components/BanquetModule';
import { RestaurantModule } from './components/RestaurantModule';
import { RoomServiceModule } from './components/RoomServiceModule';
import { AdminModule } from './components/AdminModule';
import { CommunicationHub } from './components/CommunicationHub';
import { FinancialManagement } from './components/FinancialManagement';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [moduleFilters, setModuleFilters] = useState<any>({});

  // Move useEffect before any conditional returns to ensure hooks are called in the same order
  React.useEffect(() => {
    if (user?.role === 'housekeeping' && currentModule !== 'housekeeping' && currentModule !== 'dashboard' && currentModule !== 'rooms' && currentModule !== 'communications') {
      setCurrentModule('housekeeping');
    }
    if (user?.role === 'restaurant' && currentModule !== 'restaurant' && currentModule !== 'dashboard' && currentModule !== 'room-service' && currentModule !== 'communications') {
      setCurrentModule('restaurant');
    }
  }, [user, currentModule]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleModuleChange = (module: string, filters?: any) => {
    // Check if user has access to the module
    const hasAccess = checkModuleAccess(module, user?.role);
    if (!hasAccess) {
      // Redirect to dashboard if no access
      setCurrentModule('dashboard');
      return;
    }

    setCurrentModule(module);
    if (filters) {
      setModuleFilters({ [module]: filters });
    } else {
      setModuleFilters(prev => ({ ...prev, [module]: undefined }));
    }
  };

  const checkModuleAccess = (module: string, role?: string) => {
    if (!role) return false;

    const moduleAccess = {
      'dashboard': ['admin', 'manager', 'front-desk', 'housekeeping', 'restaurant'],
      'rooms': ['admin', 'manager', 'front-desk', 'housekeeping'],
      'housekeeping': ['admin', 'manager', 'housekeeping'],
      'banquet': ['admin', 'manager', 'front-desk'],
      'restaurant': ['admin', 'manager', 'front-desk', 'restaurant'],
      'room-service': ['admin', 'manager', 'front-desk', 'restaurant'],
      'communications': ['admin', 'manager', 'front-desk', 'housekeeping', 'restaurant'],
      'financial': ['admin', 'manager'],
      'admin': ['admin']
    };

    return moduleAccess[module]?.includes(role) || false;
  };

  const renderModule = () => {
    const filters = moduleFilters[currentModule];
    
    switch (currentModule) {
      case 'rooms':
        return <RoomsModule filters={filters} />;
      case 'housekeeping':
        return <HousekeepingModule filters={filters} />;
      case 'banquet':
        return <BanquetModule filters={filters} />;
      case 'restaurant':
        return <RestaurantModule filters={filters} />;
      case 'room-service':
        return <RoomServiceModule filters={filters} />;
      case 'communications':
        return <CommunicationHub />;
      case 'financial':
        return <FinancialManagement />;
      case 'admin':
        // Only allow admin role to access admin module
        return user?.role === 'admin' ? <AdminModule /> : <Dashboard onModuleChange={handleModuleChange} />;
      default:
        return <Dashboard onModuleChange={handleModuleChange} />;
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 25%, #fff8f5 50%, #ffe4d9 75%, #ffc9b3 100%)'
      }}
    >
      <Layout currentModule={currentModule} onModuleChange={handleModuleChange}>
        {renderModule()}
      </Layout>
    </div>
  );
}

function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <SecurityProvider>
          <CommunicationProvider>
            <FinancialProvider>
              <OperationsProvider>
                <CurrencyProvider>
                  <HotelProvider>
                    <AppContent />
                  </HotelProvider>
                </CurrencyProvider>
              </OperationsProvider>
            </FinancialProvider>
          </CommunicationProvider>
        </SecurityProvider>
      </AuthProvider>
    </BrandingProvider>
  );
}

export default App;
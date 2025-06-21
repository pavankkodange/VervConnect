import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'isActive'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  updateLastLogin: (userId: string) => void;
  getEmployeesOnShift: (department?: string) => User[];
  updateShiftStatus: (userId: string, onShift: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for MVP - using hotel domain names for user accounts
const DEMO_USERS: User[] = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    email: 'sarah@harmonysuite.com', 
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T08:30:00Z',
    department: 'Operations',
    phoneNumber: '+1-555-0101',
    emergencyContact: '+1-555-0102',
    notes: 'Senior manager with 5+ years experience',
    currentShift: {
      isOnShift: true,
      shiftStart: '08:00',
      shiftEnd: '17:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T08:15:00Z'
    }
  },
  { 
    id: '2', 
    name: 'Mike Chen', 
    email: 'mike@harmonysuite.com', 
    role: 'front-desk',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T09:15:00Z',
    department: 'Front Office',
    phoneNumber: '+1-555-0103',
    emergencyContact: '+1-555-0104',
    notes: 'Excellent customer service skills',
    currentShift: {
      isOnShift: true,
      shiftStart: '09:00',
      shiftEnd: '18:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T09:05:00Z'
    }
  },
  { 
    id: '3', 
    name: 'Lisa Rodriguez', 
    email: 'lisa@harmonysuite.com', 
    role: 'housekeeping',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T06:45:00Z',
    department: 'Housekeeping',
    phoneNumber: '+1-555-0105',
    emergencyContact: '+1-555-0106',
    notes: 'Team lead for housekeeping department',
    currentShift: {
      isOnShift: true,
      shiftStart: '07:00',
      shiftEnd: '15:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T06:55:00Z'
    }
  },
  { 
    id: '4', 
    name: 'David Kim', 
    email: 'david@harmonysuite.com', 
    role: 'restaurant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T10:00:00Z',
    department: 'Food & Beverage',
    phoneNumber: '+1-555-0107',
    emergencyContact: '+1-555-0108',
    notes: 'Head chef with culinary expertise',
    currentShift: {
      isOnShift: true,
      shiftStart: '10:00',
      shiftEnd: '22:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T09:50:00Z'
    }
  },
  { 
    id: '5', 
    name: 'Alex Thompson', 
    email: 'admin@harmonysuite.com', 
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T07:30:00Z',
    department: 'Administration',
    phoneNumber: '+1-555-0109',
    emergencyContact: '+1-555-0110',
    notes: 'System administrator with full access',
    currentShift: {
      isOnShift: true,
      shiftStart: '08:00',
      shiftEnd: '17:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T07:45:00Z'
    }
  },
  // Additional staff members for better demonstration
  { 
    id: '6', 
    name: 'Maria Santos', 
    email: 'maria@harmonysuite.com', 
    role: 'housekeeping',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T07:00:00Z',
    department: 'Housekeeping',
    phoneNumber: '+1-555-0111',
    emergencyContact: '+1-555-0112',
    notes: 'Housekeeping specialist',
    currentShift: {
      isOnShift: true,
      shiftStart: '07:00',
      shiftEnd: '15:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T07:10:00Z'
    }
  },
  { 
    id: '7', 
    name: 'James Wilson', 
    email: 'james@harmonysuite.com', 
    role: 'front-desk',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T15:00:00Z',
    department: 'Front Office',
    phoneNumber: '+1-555-0113',
    emergencyContact: '+1-555-0114',
    notes: 'Evening shift supervisor',
    currentShift: {
      isOnShift: false,
      shiftStart: '15:00',
      shiftEnd: '23:00',
      shiftType: 'evening',
      clockedInAt: undefined
    }
  },
  { 
    id: '8', 
    name: 'Emma Davis', 
    email: 'emma@harmonysuite.com', 
    role: 'restaurant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T11:00:00Z',
    department: 'Food & Beverage',
    phoneNumber: '+1-555-0115',
    emergencyContact: '+1-555-0116',
    notes: 'Restaurant server and bartender',
    currentShift: {
      isOnShift: true,
      shiftStart: '11:00',
      shiftEnd: '19:00',
      shiftType: 'day',
      clockedInAt: '2024-01-22T10:55:00Z'
    }
  },
  { 
    id: '9', 
    name: 'Robert Brown', 
    email: 'robert@harmonysuite.com', 
    role: 'housekeeping',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-21T23:00:00Z',
    department: 'Housekeeping',
    phoneNumber: '+1-555-0117',
    emergencyContact: '+1-555-0118',
    notes: 'Night shift maintenance',
    currentShift: {
      isOnShift: false,
      shiftStart: '23:00',
      shiftEnd: '07:00',
      shiftType: 'night',
      clockedInAt: undefined
    }
  },
  { 
    id: '10', 
    name: 'Sophie Martinez', 
    email: 'sophie@harmonysuite.com', 
    role: 'front-desk',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-21T23:30:00Z',
    department: 'Front Office',
    phoneNumber: '+1-555-0119',
    emergencyContact: '+1-555-0120',
    notes: 'Night audit specialist',
    currentShift: {
      isOnShift: false,
      shiftStart: '23:00',
      shiftEnd: '07:00',
      shiftType: 'night',
      clockedInAt: undefined
    }
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - in production, this would be a real API call
    const foundUser = users.find(u => u.email === email && u.isActive);
    if (foundUser) {
      setUser(foundUser);
      updateLastLogin(foundUser.id);
      localStorage.setItem('vervConnectUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vervConnectUser');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    ));
    
    // Update current user if it's the same user
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const updateLastLogin = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, lastLogin: new Date().toISOString() } : user
    ));
  };

  const getEmployeesOnShift = (department?: string) => {
    return users.filter(user => {
      const isOnShift = user.currentShift?.isOnShift || false;
      const matchesDepartment = department ? user.department === department : true;
      return user.isActive && isOnShift && matchesDepartment;
    });
  };

  const updateShiftStatus = (userId: string, onShift: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            currentShift: {
              ...user.currentShift,
              isOnShift: onShift,
              clockedInAt: onShift ? new Date().toISOString() : undefined
            }
          } 
        : user
    ));
  };

  // Check for stored user on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('vervConnectUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Verify user still exists and is active
      const currentUser = users.find(u => u.id === parsedUser.id && u.isActive);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('vervConnectUser');
      }
    }
  }, [users]);

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      isAuthenticated: !!user,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      updateLastLogin,
      getEmployeesOnShift,
      updateShiftStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
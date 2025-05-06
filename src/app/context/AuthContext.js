'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [employeeId, setEmployeeId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for employee ID in localStorage on mount
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedPermissions = localStorage.getItem('permissions');
    
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (id) => {
    try {
      setLoginError('');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store employee ID and permissions
      localStorage.setItem('employeeId', data.employeeId);
      localStorage.setItem('permissions', JSON.stringify(data.permissions));
      
      setEmployeeId(data.employeeId);
      setPermissions(data.permissions);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Error during login');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('employeeId');
    localStorage.removeItem('permissions');
    setEmployeeId(null);
    setPermissions([]);
    router.push('/login');
  };

  const isAuthenticated = !!employeeId;
  
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ 
      employeeId, 
      permissions,
      login, 
      logout, 
      isAuthenticated,
      loginError,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 
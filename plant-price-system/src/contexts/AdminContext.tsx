import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminToken: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  checkAdmin: () => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load admin token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      checkAdminStatus(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAdminStatus = async (token: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const response = await fetch(`${backendUrl}/api/admin/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        }
      });

      const data = await response.json();
      if (data.success && data.data?.isAdmin) {
        setIsAdmin(true);
        setAdminToken(token);
      } else {
        setIsAdmin(false);
        setAdminToken(null);
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminToken(null);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (data.success && data.data?.token) {
        const token = data.data.token;
        setAdminToken(token);
        setIsAdmin(true);
        localStorage.setItem('adminToken', token);
        return true;
      } else {
        setIsAdmin(false);
        setAdminToken(null);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAdmin(false);
      setAdminToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (adminToken) {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
        const backendUrl = apiUrl.replace(/\/api$/, '');
        
        await fetch(`${backendUrl}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token: adminToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdmin(false);
      setAdminToken(null);
      localStorage.removeItem('adminToken');
    }
  };

  const checkAdmin = async () => {
    if (adminToken) {
      await checkAdminStatus(adminToken);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        adminToken,
        login,
        logout,
        checkAdmin,
        isLoading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};


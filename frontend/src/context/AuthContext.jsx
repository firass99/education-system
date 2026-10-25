import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch((err) => {
          // Only drop the session when the token is actually rejected; a network blip or 5xx keeps it
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const isAdmin = () => user?.role?.name === 'admin';
  const isStudent = () => user?.role?.name === 'student';
  const isParent = () => user?.role?.name === 'parent';
  const hasRole = (...roles) => roles.includes(user?.role?.name);

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isStudent,
    isParent,
    hasRole,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('innovbit_token');
      const storedUser = localStorage.getItem('innovbit_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Quick fetch to verify token validity
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('innovbit_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Session validation failed:', error);
          // Session expired or invalid
          localStorage.removeItem('innovbit_token');
          localStorage.removeItem('innovbit_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('innovbit_token', token);
      localStorage.setItem('innovbit_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('innovbit_token');
    localStorage.removeItem('innovbit_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

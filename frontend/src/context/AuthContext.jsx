import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ginraide_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem('ginraide_token', token);
    localStorage.setItem('ginraide_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ginraide_token');
    localStorage.removeItem('ginraide_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    localStorage.setItem('ginraide_user', JSON.stringify(updated));
    setUser(updated);
  };

  const getToken = () => localStorage.getItem('ginraide_token');

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

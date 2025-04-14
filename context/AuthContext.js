import React, { createContext, useState, useContext } from "react";

// Create context
const AuthContext = createContext();

// Provider component to wrap the app with authentication context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in

  const login = (userData) => {
    setUser(userData); // Set the user data when logged in
  };

  const logout = () => {
    setUser(null); // Remove user data when logged out
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};

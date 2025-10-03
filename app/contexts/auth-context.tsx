"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../utils/types";

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);

      // Initialize tenant subscription status if not already set
      const initializeSubscriptionStatus = () => {
        if (!user || !user.tenantId) return;

        try {
          let tenantSubscriptions: Record<string, string> = {};
          const storedSubscriptions = localStorage.getItem(
            "tenantSubscriptions"
          );

          if (storedSubscriptions) {
            tenantSubscriptions = JSON.parse(storedSubscriptions);
          }

          // Only set default if not already present
          if (tenantSubscriptions[user.tenantId] === undefined) {
            // For demo purposes, let's default acme to 'pro' and others to 'free'
            // In a real app, you'd fetch this from the database
            const defaultPlan = user.tenantId === "acme" ? "pro" : "free";
            tenantSubscriptions[user.tenantId] = defaultPlan;
            localStorage.setItem(
              "tenantSubscriptions",
              JSON.stringify(tenantSubscriptions)
            );
          }
        } catch (err) {
          console.error("Error initializing subscription status:", err);
        }
      };

      initializeSubscriptionStatus();
      setUser(user);
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (
    tenantId: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId, email, password }),
      });

      const data = await response.json();
      // console.log("DATA RECEIVED FROM LOGIN: ", data);
      if (data.success) {
        // Save token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update state
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

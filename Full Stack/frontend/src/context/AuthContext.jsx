import React, { createContext, useState, useEffect } from "react";
import { api, AUTH_TOKEN_KEY } from "../services/api";

export const AuthContext = createContext();
const AUTH_SESSION_KEY = "isLoggedInSession";
const AUTH_USER_KEY = "signedInUser";

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
};

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const hasActiveSession = sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!hasActiveSession || !storedToken) {
      clearStoredAuth();
      setAuthChecked(true);
      return;
    }

    let ignore = false;

    const restoreSession = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
        if (storedUser?.username) {
          setUser(storedUser);
        }

        const response = await api.get("/auth/me");
        if (ignore) {
          return;
        }

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
        setAuthChecked(true);
      } catch {
        if (ignore) {
          return;
        }

        clearStoredAuth();
        setUser(null);
        setAuthChecked(true);
      }
    };

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  const signup = async (newUser) => {
    const preparedUser = {
      ...newUser,
      name: String(newUser.name || "").trim(),
      mobile: String(newUser.mobile || "").trim(),
      email: String(newUser.email || "").trim(),
      username: String(newUser.username || "").trim(),
      password: String(newUser.password || ""),
    };

    try {
      const response = await api.post("/auth/register", preparedUser);
      localStorage.setItem("lastRegisteredUser", JSON.stringify(response.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Registration failed" };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const signedInUser = response.user;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(signedInUser));
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      setUser(signedInUser);
      setAuthChecked(true);
      return { success: true, role: signedInUser.role, homePath: signedInUser.homePath };
    } catch {
      return { success: false };
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setAuthChecked(true);
  };

  const loginWithData = (response) => {
    const signedInUser = response.user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(signedInUser));
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    sessionStorage.setItem(AUTH_SESSION_KEY, "true");
    setUser(signedInUser);
    setAuthChecked(true);
    return { success: true, role: signedInUser.role, homePath: signedInUser.homePath };
  };

  return (
    <AuthContext.Provider value={{ user, authChecked, login, loginWithData, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
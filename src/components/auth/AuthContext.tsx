import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode"; // исправленный импорт
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  const setTokens = (access: string, refresh: string) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    navigate("/auth");
  };

  // Check if the access token is expired (using jwt-decode)
  const isTokenExpired = (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp) {
        return decoded.exp * 1000 < Date.now();
      }
      return true;
    } catch (error) {
      return true;
    }
  };

  // Attempt to refresh the access token using the refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      logout();
      return false;
    }
    try {
      const response = await axios.post("http://localhost:8081/auth-api/api/v1/auth/refresh", {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // On app mount, if there's an access token, check if it's expired
  useEffect(() => {
    if (accessToken && isTokenExpired(accessToken)) {
      refreshAccessToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, setTokens, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

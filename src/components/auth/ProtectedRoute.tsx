import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accessToken, refreshAccessToken } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        setIsAuthorized(false);
      } else {
        // If the access token is expired, attempt a refresh.
        // (The refreshAccessToken method also handles logout on failure.)
        const success = await refreshAccessToken();
        setIsAuthorized(success);
      }
    };
    checkAuth();
  }, [accessToken, refreshAccessToken]);

  // While checking, you can show a spinner or nothing
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/auth" />;
};

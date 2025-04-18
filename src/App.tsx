import React from "react";
import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import {
  Navigation,
  AuthProvider,
  ProtectedRoute,
  useAuth,
} from "./components";
import {
  TestPage,
  RawDataChartsPage,
  MainPage,
  DataWOutliersChartsPage,
  NotificationsPage,
  LoginPage,
  GoogleFitnessAuthPage,
  QRAuthPage
} from "./pages";
import { Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import axios, { AxiosRequestConfig } from "axios";

// Определяем тип для элементов навигации
export interface INavigationItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: INavigationItem[] = [
  {
    text: "Главная",
    path: "/",
    icon: <HomeIcon />,
  },
  {
    text: "Графики исходных данных",
    path: "/rawDataPage",
    icon: <CodeIcon />,
  },
  {
    text: "Графики данных с обнаруженными аномалиями",
    path: "/dataWOutliersPage",
    icon: <BugReportIcon />,
  },
  {
    text: "QR Auth Page",
    path: "/QRAuthPage",
    icon: <BugReportIcon />,
  },
];

// Применяем interceptor к глобальному axios, чтобы каждый раз подставлялся актуальный токен
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Убедимся, что headers существуют
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Accept = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AppContent = () => {
  const { accessToken } = useAuth(); // Используем контекст для реактивного обновления

  return (
    <Box sx={{ display: "flex" }}>
      {accessToken && <Navigation items={menuItems} />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/testpage"
            element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rawDataPage"
            element={
              <ProtectedRoute>
                <RawDataChartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dataWOutliersPage"
            element={
              <ProtectedRoute>
                <DataWOutliersChartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificationsPage"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/googleFitnessAuthPage"
            element={
              <ProtectedRoute>
                <GoogleFitnessAuthPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/QRAuthPage"
            element={
              <ProtectedRoute>
                <QRAuthPage />
              </ProtectedRoute>
            }
          />

          {/* Public route: Login page */}
          <Route path="/auth" element={<GoogleFitnessAuthPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export const App = () => {
  return (
    <BrowserRouter basename="/">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

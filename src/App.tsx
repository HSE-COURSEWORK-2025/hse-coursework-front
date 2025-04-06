import React from "react";
import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Navigation } from "./components";
import {
  TestPage,
  RawDataChartsPage,
  MainPage,
  DataWOutliersChartsPage,
  NotificationsPage,
  LoginPage
} from "./pages";
import { Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";

// Определяем тип для элементов навигации
export interface INavigationItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

export const App = () => {
  // Массив элементов навигации
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
      text: "Login test",
      path: "/auth",
      icon: <CodeIcon />,
    }
  ];

  return (
    <BrowserRouter basename="/frontend">
      <Box sx={{ display: "flex" }}>
        <Navigation items={menuItems} />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/testpage" element={<TestPage />} />
            <Route path="/rawDataPage" element={<RawDataChartsPage />} />
            <Route
              path="/dataWOutliersPage"
              element={<DataWOutliersChartsPage />}
            />
            <Route
              path="/notificationsPage"
              element={<NotificationsPage />}
            />
            <Route
              path="/auth"
              element={<LoginPage />}
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
};

export default App;

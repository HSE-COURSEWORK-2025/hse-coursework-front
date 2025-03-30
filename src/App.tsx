import React from "react";
import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Navigation } from "./components";
import { TestPage, RawDataChartsPage, MainPage } from "./pages";
import { Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CodeIcon from "@mui/icons-material/Code";

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
      icon: <HomeIcon />
    },
    {
      text: "Графики исходных данных",
      path: "/rawDataPage",
      icon: <CodeIcon />
    }
  ];

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex" }}>
        <Navigation items={menuItems} />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/testpage" element={<TestPage />} />
            <Route path="/rawDataPage" element={<RawDataChartsPage />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
};

export default App;
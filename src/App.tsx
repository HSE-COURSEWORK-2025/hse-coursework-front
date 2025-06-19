// App.tsx
import React, { useState } from "react";
import "./App.css";
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import {
  Navigation,
  AuthProvider,
  ProtectedRoute,
  useAuth,
} from "./components";
import {
  RawDataChartsPage,
  MainPage,
  DataWOutliersChartsPage,
  NotificationsPage,
  GoogleFitnessAuthPage,
  QRAuthPage,
  IntegrationStatusPage,
  MLPredictionsPage,
  GenerateReportPage,
  GetFHIRDataQRPage,
  AppRatingPage,
  AppDisclaimerPage,
} from "./pages";
import { Box, Button } from "@mui/material";
import axios from "axios";

// HTML → canvas → PNG
import html2canvas from "html2canvas";
// Генерация PDF
import jsPDF from "jspdf";
import ReactDOM from "react-dom";
import { createRoot, Root } from "react-dom/client";

// Ваши пункты меню
export interface INavigationItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: INavigationItem[] = [
  { text: "Как работать с сервисом", path: "/", icon: <>🏠</> },
  { text: "Графики исходных данных", path: "/rawDataPage", icon: <>📈</> },
  { text: "Графики с выбросами", path: "/dataWOutliersPage", icon: <>🚨</> },
  {
    text: "Выгрузка с мобильного устройства",
    path: "/QRAuthPage",
    icon: <>📲</>,
  },
  {
    text: "Статус выгрузки данных",
    path: "/IntegrationStatusPage",
    icon: <>⏳</>,
  },
  { text: "ML-прогнозы", path: "/MLPredictionsPage", icon: <>🤖</> },
  { text: "Сгенерировать отчет", path: "/GenerateReportPage", icon: <>📄</> },
  { text: "Оценить приложение", path: "/AppRatingPage", icon: <>✨</> },
];

const pageComponents: Record<string, React.FC<any>> = {
  "/": MainPage,
  "/rawDataPage": RawDataChartsPage,
  "/dataWOutliersPage": DataWOutliersChartsPage,
  "/notificationsPage": NotificationsPage,
  "/QRAuthPage": QRAuthPage,
  "/IntegrationStatusPage": IntegrationStatusPage,
  "/MLPredictionsPage": MLPredictionsPage,
  // "/GenerateReportPage": GenerateReportPage,

  "/FHIRDataQRPage": GetFHIRDataQRPage,
};

// Axios interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Accept = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const AppContent = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // Пути страниц для отчёта
  const reportPages = [
    "/rawDataPage",
    "/dataWOutliersPage",
    "/MLPredictionsPage",
    "/FHIRDataQRPage",
    // "/dataWOutliersPage",
  ];

  // Функция генерации многостраничного PDF

  const [progress, setProgress] = useState<number | undefined>(undefined);

  const generateFullReport = async () => {
    setProgress(0);
    let pdf: jsPDF | null = null;
    const offscreen = document.getElementById("pdf-offscreen")!;
    const total = reportPages.length;

    for (let i = 0; i < total; i++) {
      const path = reportPages[i];
      const PageComp = pageComponents[path];
      if (!PageComp) continue;

      offscreen.innerHTML = "";
      const root: Root = createRoot(offscreen);
      const loadedPromise = new Promise<void>((resolve) => {
        const root = createRoot(offscreen);
        // Теперь resolve определён и передаётся как проп
        root.render(<PageComp onLoaded={resolve} />);
      });
      await loadedPromise;

      // подождать, пока отрисуется
      await new Promise((r) => setTimeout(r, 1000));

      // зафиксировать всю высоту
      offscreen.style.height = offscreen.scrollHeight + "px";

      const canvas = await html2canvas(offscreen, {
        scale: 2,
        width: offscreen.scrollWidth,
        height: offscreen.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = canvas.width;
      const imgH = canvas.height;
      const orient = imgW > imgH ? "landscape" : "portrait";

      if (i === 0) {
        pdf = new jsPDF({
          unit: "px",
          format: [imgW, imgH],
          orientation: orient,
        });
      } else {
        pdf!.addPage([imgW, imgH], orient);
      }
      pdf!.addImage(imgData, "PNG", 0, 0, imgW, imgH);

      root.unmount();

      // обновить прогресс
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    pdf?.save("full-report.pdf");
    // можно сбросить progress в undefined или оставить на 100
    // setProgress(undefined);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {accessToken && <Navigation items={menuItems} />}

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
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
          <Route
            path="/IntegrationStatusPage"
            element={
              <ProtectedRoute>
                <IntegrationStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MLPredictionsPage"
            element={
              <ProtectedRoute>
                <MLPredictionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/GenerateReportPage"
            element={
              <ProtectedRoute>
                <GenerateReportPage
                  onGenerate={generateFullReport}
                  progress={progress}
                />
              </ProtectedRoute>
            }
          />

          <Route path="/auth" element={<GoogleFitnessAuthPage />} />

          <Route
            path="/FHIRDataQRPage"
            element={
              <ProtectedRoute>
                <GetFHIRDataQRPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/AppRatingPage"
            element={
              <ProtectedRoute>
                <AppRatingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/AppDisclaimerPage"
            element={
              <ProtectedRoute>
                <AppDisclaimerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
};

export const App = () => (
  <BrowserRouter basename="/">
    <AuthProvider>
      <AppContent />
      <div
        id="pdf-offscreen"
        style={{
          position: "absolute",
          top: 0,
          left: "-100vw", // hide off to the left
          width: "100vw", // full viewport width
          minHeight: "100vh", // at least full viewport height
          overflow: "auto", // so tall pages scroll inside it
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;

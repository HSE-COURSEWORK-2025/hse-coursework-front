import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.REACT_APP_AUTH_API_URL || "";

// Тип для получения Blob из ответа
type QrResponse = Blob;

export const QRAuthPage: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [appQrCodeUrl, setAppQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appQrError, setAppQrError] = useState<string | null>(null);

  // Получение QR-кода для авторизации
  const fetchAuthQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<QrResponse>(
        `${API_URL}/api/v1/qr_auth/get_auth_qr_code`,
        { responseType: "blob" }
      );
      const blobUrl = URL.createObjectURL(response.data);
      setQrCodeUrl(blobUrl);
    } catch (err: any) {
      setError(err.message || "Ошибка при получении QR кода");
    } finally {
      setIsLoading(false);
    }
  };

  // Получение QR-кода для загрузки приложения
  const fetchAppQRCode = async () => {
    try {
      setAppQrError(null);
      const response = await axios.get<QrResponse>(
        `${API_URL}/api/v1/qr_auth/get_app_qr_code`,
        { responseType: "blob" }
      );
      const blobUrl = URL.createObjectURL(response.data);
      setAppQrCodeUrl(blobUrl);
    } catch (err: any) {
      setAppQrError(err.message || "Ошибка при получении QR кода приложения");
    }
  };

  // При монтировании компонента — загружаем оба кода
  useEffect(() => {
    fetchAuthQRCode();
    fetchAppQRCode();
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        backgroundColor: "background.default",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="headlineSmall"
            sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
          >
            QR-коды
          </Typography>
          <Typography
            variant="bodyMedium"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Сканируйте нужный QR-код:
          </Typography>

          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {/* QR код для авторизации */}
            <Box>
              <Typography variant="bodyMedium" sx={{ mb: 1 }}>
                Для авторизации
              </Typography>
              {isLoading ? (
                <CircularProgress />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code для авторизации"
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                />
              )}
            </Box>

            {/* QR код для загрузки приложения */}
            <Box>
              <Typography variant="bodyMedium" sx={{ mb: 1 }}>
                Для загрузки приложения
              </Typography>
              {appQrError ? (
                <Typography color="error">{appQrError}</Typography>
              ) : appQrCodeUrl ? (
                <Box
                  component="img"
                  src={appQrCodeUrl}
                  alt="QR Code для загрузки приложения"
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                />
              ) : (
                <CircularProgress />
              )}
            </Box>
          </Stack>

          <Button
            variant="contained"
            onClick={fetchAuthQRCode}
            sx={{ textTransform: "none" }}
          >
            Обновить QR код для авторизации
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

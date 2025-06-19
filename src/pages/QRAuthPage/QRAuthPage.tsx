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
        { responseType: "blob" },
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
        { responseType: "blob" },
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
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📲 Выгрузка с мобильного устройства
        </Typography>
      </Container>
      <Container
        maxWidth="md"
        sx={{
          minHeight: "67vh",
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
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Отсканируйте <strong>левый</strong> QR-код в мобильном приложении
              для выгрузки данных с него. Если у вас ещё нет приложения,
              используйте <strong>правый</strong> QR-код для установки.
            </Typography>

            <Stack
              direction="row"
              spacing={4}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography variant="bodyMedium" sx={{ mb: 1 }}>
                  Для выгрузки данных
                </Typography>
                {isLoading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code для выгрузки данных"
                    sx={{
                      width: 250,
                      height: 250,
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  />
                )}
              </Box>

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
              sx={{
                textTransform: "none",
                backgroundColor: "#16a180",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#13876e", // чуть более тёмный для эффекта наведения
                },
              }}
            >
              Обновить QR код для выгрузки данных
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Container>
  );
};

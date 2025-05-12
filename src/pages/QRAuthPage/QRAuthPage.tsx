import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.REACT_APP_AUTH_API_URL || "";

// Если сервер возвращает именно Blob с изображением, можно задать generic тип Blob
type QrResponse = Blob;

export const QRAuthPage: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция получения QR кода с сервера через axios
  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Запрос аналогичен приведённому примеру:
      const response = await axios.get<QrResponse>(
        `${API_URL}/api/v1/qr_auth/get_auth_qr_code`,
        {
          // responseType необходимо задать для получения бинарного ответа
          responseType: "blob",
        }
      );
      // Преобразуем Blob в URL для использования в атрибуте src
      const blobUrl = URL.createObjectURL(response.data);
      setQrCodeUrl(blobUrl);
    } catch (err: any) {
      setError(err.message || "Ошибка при получении QR кода");
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем QR код сразу при монтировании компонента
  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <Container
      maxWidth="sm"
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
          <Typography variant="headlineSmall" sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}>
            Авторизация по QR коду
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary" sx={{ mb: 4 }}>
            Сканируйте данный QR код на вашем мобильном устройстве для входа на сайт.
          </Typography>
          <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Typography variant="bodyMedium" color="error">
                {error}
              </Typography>
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
          <Button variant="contained" onClick={fetchQRCode} sx={{ textTransform: "none" }}>
            Обновить QR код
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

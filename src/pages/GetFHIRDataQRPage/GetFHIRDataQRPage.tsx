import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.REACT_APP_DATA_COLLECTION_API_URL || "";

// Тип для получения Blob из ответа
type QrResponse = Blob;

type Props = {
  onLoaded?: () => void;
};

export const GetFHIRDataQRPage: React.FC<Props> = ({ onLoaded }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Флаг, чтобы вызвать onLoaded только один раз
  const hasCalledOnLoaded = useRef(false);

  const fetchFhirQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<QrResponse>(
        `${API_URL}/api/v1/get_data/fhir/get_all_data_qr`,
        { responseType: "blob" },
      );
      const blobUrl = URL.createObjectURL(response.data);
      setQrCodeUrl(blobUrl);

      // Вызываем onLoaded только при первой успешной загрузке
      // if (!hasCalledOnLoaded.current && onLoaded) {
      //   hasCalledOnLoaded.current = true;
      onLoaded && onLoaded();
      // }
    } catch (err: any) {
      setError(err.message || "Ошибка при получении QR-кода FHIR");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFhirQRCode();
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, []);

  return (
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📡 Доступ к данным в формате FHIR
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
              Отсканируйте QR-код, чтобы получить ссылку на скачивание ваших
              данных в формате FHIR.
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              {isLoading ? (
                <CircularProgress />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code для получения данных в формате FHIR"
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                />
              )}
            </Box>

            <Typography variant="bodyMedium" sx={{ mb: 1 }}>
              QR-код для получения данных в формате FHIR
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Container>
  );
};

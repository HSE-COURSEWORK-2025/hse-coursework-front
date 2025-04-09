import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import DirectionsRun from "@mui/icons-material/DirectionsRun";

// Расширение глобального объекта window для google
declare global {
  interface Window {
    google: any;
  }
}

const scopes = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.body_temperature.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.location.read",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
].join(" ");

const API_URL = process.env.REACT_APP_AUTH_API_URL || "";

export const GoogleFitnessAuthPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // Состояния для хранения authorization code и полученных токенов от вашего сервера
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);
  const [codeClient, setCodeClient] = useState<any>(null);

  useEffect(() => {
    // Проверяем, загружен ли google-объект
    if (window.google) {
      // Инициализируем codeClient для Authorization Code Flow
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI, // Должен совпадать с настройками в Google API Console
        access_type: "offline", // Запрос refresh token
        prompt: "consent",     // Обязательное согласие пользователя для выдачи refresh token
        callback: (response: any) => {
          if (response.error) {
            enqueueSnackbar("Ошибка авторизации", { variant: "error" });
            return;
          }
          if (response.code) {
            console.log('got code', response.code)
            setAuthCode(response.code);
            enqueueSnackbar("Успешная авторизация, код получен.", { variant: "success" });
            // Отправляем authorization code на сервер для обмена на токены
            exchangeCode(response.code);
          }
        },
      });
      setCodeClient(client);
    }
  }, [enqueueSnackbar]);

  // Функция обмена authorization code на токены через ваш серверный эндпоинт
  const exchangeCode = async (code: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/google-code-fitness`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error("Ошибка обмена кода на токены");
      }
      const data = await response.json();
      setTokens(data);
      enqueueSnackbar("Токены успешно получены.", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleSignIn = () => {
    if (codeClient) {
      codeClient.requestCode();
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
            textAlign: "center",
            width: "100%",
            minWidth: "300px",
          }}
        >
          {/* Заголовок */}
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
          >
            Авторизация Google Fit
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Для доступа к данным Google Fit выполните авторизацию с помощью вашего Google аккаунта.
          </Typography>

          {/* Блок с авторизацией */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSignIn}
              startIcon={<DirectionsRun />}
              sx={{
                backgroundColor: "#4285F4",
                borderRadius: "20px",
                padding: "16px 32px",
                fontSize: "18px",
                width: "100%",
                textTransform: "none",
              }}
            >
              Войти через Google Fit
            </Button>

            <Divider sx={{ width: "100%", my: 2 }} />

            {authCode && (
              <Typography variant="body2" color="text.primary">
                Authorization Code: {authCode}
              </Typography>
            )}

            {tokens && (
              <Box>
                <Typography variant="body2" color="text.primary">
                  Access Token: {tokens.access_token}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Refresh Token: {tokens.refresh_token}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

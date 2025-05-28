// src/pages/GoogleFitnessAuthPage.tsx
import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { useAuth } from "../../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import DirectionsRun from "@mui/icons-material/DirectionsRun";
import PersonIcon from "@mui/icons-material/Person";

// Расширение глобального объекта window для Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initCodeClient: (opts: any) => any;
        };
      };
    };
  }
}

const scopes = [
  "openid",
  "email",
  "profile",
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
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [codeClient, setCodeClient] = useState<any>(null);
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2?.initCodeClient) {
        clearInterval(interval);
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID!,
          scope: scopes,
          redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI!,
          access_type: "offline",
          prompt: "consent",
          callback: (response: any) => {
            if (response.error) {
              enqueueSnackbar("Не удалось авторизоваться. Попробуйте снова.", { variant: "error" });
              return;
            }
            if (response.code) {
              setAuthCode(response.code);
              enqueueSnackbar("Код авторизации получен! Обмен токенов...", { variant: "success" });
              exchangeCode(response.code);
            }
          },
        });
        setCodeClient(client);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enqueueSnackbar]);

  const exchangeCode = async (code: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/google-code-fitness`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );
      if (!response.ok) throw new Error("Ошибка обмена кода на токены");
      const data = await response.json();

      setTokens(data.access_token, data.refresh_token);
      enqueueSnackbar("Вход через Google Fit выполнен успешно!", { variant: "success" });
      navigate("/");
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleSignIn = () => {
    if (codeClient) {
      codeClient.requestCode();
    } else {
      enqueueSnackbar("SDK загружается, чуть позже всё будет готово!", { variant: "warning" });
    }
  };

  const handleTestLogin = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/get-test-account`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      setTokens(data.access_token, data.refresh_token);
      enqueueSnackbar("Тестовый аккаунт загружен! Добро пожаловать.", { variant: "success" });
      navigate("/");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Не удалось войти в тестовый аккаунт.", { variant: "error" });
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
            textAlign: "center",
            width: "100%",
            minWidth: 300,
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}>
            Вход
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Авторизуйтесь через Google, чтобы приложение могло читать ваши данные о здоровье из Google Fitness API. 
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Или воспользуйтесь тестовым аккаунтом для ознакомления с возможностями без регистрации.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {/* Кнопка Google Fit с градиентом */}
            <Button
              variant="contained"
              onClick={handleSignIn}
              startIcon={<DirectionsRun />}
              sx={{
                background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                borderRadius: '20px',
                py: 1.5,
                px: 3,
                fontSize: 16,
                width: '100%',
                textTransform: 'none',
                color: '#fff',
                boxShadow: '0 3px 5px 2px rgba(255,105,135, .3)',
                ':hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                },
              }}
            >
              Войти через Google Fit
            </Button>

            {/* Кнопка тестового аккаунта (стиль сохранён) */}

            <Button
              variant="contained"
              onClick={handleTestLogin}
              startIcon={<PersonIcon />}
              sx={{
                background: 'linear-gradient(45deg, #6c63ff 30%, #3f3d56 90%)',
                borderRadius: '20px',
                py: 1.5,
                px: 3,
                fontSize: 16,
                width: '100%',
                textTransform: 'none',
                color: '#fff',
                boxShadow: '0 3px 5px 2px rgba(108,99,255, .3)',
                ':hover': {
                  background: 'linear-gradient(45deg, #5a52e0 30%, #2e2c3d 90%)',
                },
              }}
            >
              Войти в тестовый аккаунт
            </Button>

          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

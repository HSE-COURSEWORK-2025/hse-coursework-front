// src/pages/GoogleFitnessAuthPage.tsx
import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { useAuth } from "../../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import DirectionsRun from "@mui/icons-material/DirectionsRun";

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
    // Ждём, пока GSI SDK загрузится и появится window.google.accounts.oauth2.initCodeClient
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
              enqueueSnackbar("Ошибка авторизации", { variant: "error" });
              return;
            }
            if (response.code) {
              setAuthCode(response.code);
              enqueueSnackbar("Успешная авторизация, код получен.", {
                variant: "success",
              });
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

      enqueueSnackbar("Успешный вход через Google.", { variant: "success" });
      navigate("/");
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleSignIn = () => {
    if (codeClient) {
      codeClient.requestCode();
    } else {
      enqueueSnackbar("SDK ещё не загружен, попробуйте чуть позже", {
        variant: "warning",
      });
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
            minWidth: 300,
          }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
          >
            Авторизация Google Fit
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Для доступа к данным Google Fit выполните авторизацию с помощью
            вашего Google аккаунта.
          </Typography>
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
              onClick={handleSignIn}
              startIcon={<DirectionsRun />}
              sx={{
                backgroundColor: "#4285F4",
                borderRadius: "20px",
                p: "16px 32px",
                fontSize: 18,
                width: "100%",
                textTransform: "none",
              }}
            >
              Войти через Google Fit
            </Button>
            <Divider sx={{ width: "100%", my: 2 }} />
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

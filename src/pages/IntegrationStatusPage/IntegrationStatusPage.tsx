// src/pages/IntegrationStatusPage.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material";
import { FitnessCenter, HealthAndSafety, Sync } from "@mui/icons-material";
import axios from "axios";

const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL || "";
const DATA_COLLECTION_WS_URL =
  process.env.REACT_APP_DATA_COLLECTION_WS_URL || "";
const INTEGRATIONS_URL = `${AUTH_API_URL}/api/v1/integrations/integrations`;

interface IntegrationOut {
  id: number;
  source: "google_fitness_api" | "google_health_api";
  connected_at: string;
}

// Функция декодирования JWT из вашего примера
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const IntegrationStatusPage: React.FC = () => {
  const theme = useTheme();
  const errorContainer = alpha(theme.palette.error.main, 0.1);
  const primaryContainer = alpha(theme.palette.primary.main, 0.1);

  const [fitnessConnected, setFitnessConnected] = useState<boolean | null>(
    null,
  );
  const [healthConnected, setHealthConnected] = useState<boolean | null>(null);
  const [fitnessProgress, setFitnessProgress] = useState<number>(0);
  const [healthProgress, setHealthProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Новое состояние для флага тестового пользователя
  const [isTestUser, setIsTestUser] = useState<boolean>(false);

  const token = localStorage.getItem("accessToken") || "";

  // Декодируем токен и выставляем флаг тестового пользователя один раз при монтировании
  useEffect(() => {
    if (token) {
      const data = parseJwt(token);
      setIsTestUser(Boolean(data?.test_user));
    }
  }, [token]);

  // Получаем, какие интеграции есть у пользователя
  const fetchStatus = async () => {
    if (!token) {
      setError("Нет токена авторизации");
      return;
    }
    setLoading(true);
    setError(null);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const res = await axios.get<IntegrationOut[]>(INTEGRATIONS_URL);
      const sources = res.data.map((i) => i.source);
      setFitnessConnected(sources.includes("google_fitness_api"));
      setHealthConnected(sources.includes("google_health_api"));
    } catch (err: any) {
      setError(err.message || "Ошибка при загрузке списка интеграций");
    } finally {
      setLoading(false);
    }
  };

  // Отключаем toggle для тестового пользователя
  const toggleFitness = async () => {
    if (loading || fitnessConnected === null || isTestUser) return;
    setLoading(true);
    try {
      const endpoint = fitnessConnected ? "disconnect" : "connect";
      await axios.post(`${AUTH_API_URL}/google-fitness/${endpoint}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHealth = async () => {
    if (loading || healthConnected === null) return;
    setLoading(true);
    try {
      const endpoint = healthConnected ? "disconnect" : "connect";
      await axios.post(`${AUTH_API_URL}/google-health/${endpoint}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket для прогресса
  useEffect(() => {
    if (!token) return;
    const fitnessWs = new WebSocket(
      `${DATA_COLLECTION_WS_URL}/api/v1/processing_status/google_fitness_api_progress?token=${token}`,
    );
    const healthWs = new WebSocket(
      `${DATA_COLLECTION_WS_URL}/api/v1/processing_status/google_health_api_progress?token=${token}`,
    );

    fitnessWs.onmessage = (e) => {
      try {
        setFitnessProgress(JSON.parse(e.data).progress);
      } catch {}
    };
    healthWs.onmessage = (e) => {
      try {
        setHealthProgress(JSON.parse(e.data).progress);
      } catch {}
    };

    return () => {
      fitnessWs.close();
      healthWs.close();
    };
  }, [token]);

  // При монтировании читаем интеграции
  useEffect(() => {
    fetchStatus();
  }, []);

  const StatusBadge = ({
    isError,
    toggle,
    disabled = false,
  }: {
    isError: boolean;
    toggle: () => void;
    disabled?: boolean;
  }) => (
    <Box
      sx={{
        bgcolor: isError ? errorContainer : primaryContainer,
        color: disabled
          ? theme.palette.text.disabled
          : isError
            ? theme.palette.error.main
            : theme.palette.success.main,
        px: 2,
        py: 0.5,
        borderRadius: 28,
        typography: "body2",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
      onClick={() => {
        if (!loading && !disabled) toggle();
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: disabled
            ? theme.palette.text.disabled
            : isError
              ? theme.palette.error.main
              : theme.palette.success.main,
        }}
      />
      {disabled ? "Недоступно" : isError ? "Не подключено" : "Подключено"}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Typography variant="h4">⏳ Статус выгрузки данных</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Stack spacing={3}>
        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  variant="square"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "transparent",
                    mr: 2,
                  }}
                >
                  <Box
                    component="img"
                    src="https://gstatic.com/images/branding/product/1x/gfit_512dp.png"
                    alt="Google Fitness Logo"
                    sx={{ width: "100%", height: "100%" }}
                  />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Google Fitness API{" "}
                    {isTestUser
                      ? "(недоступно для тестовых пользователей)"
                      : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс выгрузки данных из Google Fitness API
                  </Typography>
                </Box>
              </Box>
              <StatusBadge
                isError={!fitnessConnected}
                toggle={toggleFitness}
                disabled={isTestUser}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Прогресс: {fitnessProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={fitnessProgress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  variant="square"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "transparent",
                    mr: 2,
                  }}
                >
                  <Box
                    component="img"
                    src="https://play-lh.googleusercontent.com/EbzDx68RZddtIMvs8H8MLcO-KOiBqEYJbi_kRjEdXved0p3KXr0nwUnLUgitZ5kQVWVZ"
                    alt="Google Health Connect Logo"
                    sx={{ width: "100%", height: "100%" }}
                  />
                </Avatar>
                <Box>
                  <Typography variant="h6">Google Health Connect</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс выгрузки данных из Google Health Connect
                  </Typography>
                </Box>
              </Box>
              <StatusBadge isError={!healthConnected} toggle={toggleHealth} />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Прогресс: {healthProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={healthProgress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

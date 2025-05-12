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

const API_URL = process.env.REACT_APP_INTEGRATION_API_URL || "";
const INTEGRATIONS_URL =
  "http://localhost:8081/auth-api/api/v1/integrations/integrations";

interface IntegrationOut {
  id: number;
  source: "google_fitness_api" | "google_health_api";
  connected_at: string;
}

export const IntegrationStatusPage: React.FC = () => {
  const theme = useTheme();
  const errorContainer = alpha(theme.palette.error.main, 0.1);
  const primaryContainer = alpha(theme.palette.primary.main, 0.1);

  const [fitnessConnected, setFitnessConnected] = useState<boolean | null>(null);
  const [healthConnected, setHealthConnected] = useState<boolean | null>(null);
  const [fitnessProgress, setFitnessProgress] = useState<number>(0);
  const [healthProgress, setHealthProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("accessToken");

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

  const toggleFitness = async () => {
    if (loading || fitnessConnected === null) return;
    setLoading(true);
    try {
      const endpoint = fitnessConnected ? "disconnect" : "connect";
      await axios.post(`${API_URL}/google-fitness/${endpoint}`, null, {
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
      await axios.post(`${API_URL}/google-health/${endpoint}`, null, {
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
      `ws://localhost:8082/data-collection-api/api/v1/processing_status/google_fitness_api_progress?token=${token}`
    );
    const healthWs = new WebSocket(
      `ws://localhost:8082/data-collection-api/api/v1/processing_status/google_health_api_progress?token=${token}`
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
  }: {
    isError: boolean;
    toggle: () => void;
  }) => (
    <Box
      sx={{
        bgcolor: isError ? errorContainer : primaryContainer,
        color: isError ? theme.palette.error.main : theme.palette.success.main,
        px: 2,
        py: 0.5,
        borderRadius: 28,
        typography: "body2",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        cursor: loading ? "default" : "pointer",
      }}
      onClick={() => {
        if (!loading) toggle();
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: isError ? theme.palette.error.main : theme.palette.success.main,
        }}
      />
      {isError ? "Не подключено" : "Подключено"}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar
          sx={{
            mr: 2,
            bgcolor: "primaryContainer.main",
            color: "onPrimaryContainer.main",
          }}
        >
          <Sync />
        </Avatar>
        <Typography variant="h4">Статус интеграций</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Stack spacing={3}>
        {/* Google Fitness */}
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
                  sx={{
                    bgcolor: "secondaryContainer.main",
                    color: "onSecondaryContainer.main",
                    mr: 2,
                  }}
                >
                  <FitnessCenter />
                </Avatar>
                <Box>
                  <Typography variant="h6">Google Fitness API</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс выгрузки фитнес-данных.
                  </Typography>
                </Box>
              </Box>
              <StatusBadge
                isError={!fitnessConnected}
                toggle={toggleFitness}
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

        {/* Google Health */}
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
                  sx={{
                    bgcolor: "tertiaryContainer.main",
                    color: "onTertiaryContainer.main",
                    mr: 2,
                  }}
                >
                  <HealthAndSafety />
                </Avatar>
                <Box>
                  <Typography variant="h6">Google Health API</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс выгрузки данных о здоровье.
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

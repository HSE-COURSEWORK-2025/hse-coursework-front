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
  Button,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material";
import { FitnessCenter, HealthAndSafety, Sync } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_INTEGRATION_API_URL || "";
const WS_PROGRESS_URL =
  process.env.REACT_APP_WS_PROGRESS_URL ||
  "ws://localhost:8082/data-collection-api/api/v1/processing_status/progress";

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

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fitRes, healthRes] = await Promise.all([
        axios.get<{ connected: boolean; progress: number }>(
          `${API_URL}/google-fitness/status`
        ),
        axios.get<{ connected: boolean; progress: number }>(
          `${API_URL}/google-health/status`
        ),
      ]);
      setFitnessConnected(fitRes.data.connected);
      setFitnessProgress(fitRes.data.progress);
      setHealthConnected(healthRes.data.connected);
      setHealthProgress(healthRes.data.progress);
    } catch (err: any) {
      setError(err.message || "Ошибка при загрузке статуса интеграций");
    } finally {
      setLoading(false);
    }
  };

  const toggleFitness = async () => {
    if (loading || fitnessConnected === null) return;
    try {
      setLoading(true);
      const endpoint = fitnessConnected ? "disconnect" : "connect";
      await axios.post(`${API_URL}/google-fitness/${endpoint}`);
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleHealth = async () => {
    if (loading || healthConnected === null) return;
    try {
      setLoading(true);
      const endpoint = healthConnected ? "disconnect" : "connect";
      await axios.post(`${API_URL}/google-health/${endpoint}`);
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`${WS_PROGRESS_URL}?token=${token}`);

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const { type, progress } = JSON.parse(event.data);

        if (type === "google_fitness_api") {
          setFitnessProgress(progress);
        } else if (type === "google_health_api") {
          setHealthProgress(progress);
        }
      } catch (e) {
        console.error("Ошибка парсинга сообщения WebSocket", e);
      }
    };

    ws.onerror = (err) => console.error("WebSocket ошибка", err);
    ws.onclose = () => console.log("WebSocket отключён");

    return () => ws.close();
  }, []);

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
        <Avatar sx={{ mr: 2, bgcolor: "primaryContainer.main", color: "onPrimaryContainer.main" }}>
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "secondaryContainer.main", color: "onSecondaryContainer.main", mr: 2 }}>
                  <FitnessCenter />
                </Avatar>
                <Box>
                  <Typography variant="h6">Google Fitness API</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс выгрузки фитнес-данных.
                  </Typography>
                </Box>
              </Box>
              <StatusBadge isError={!fitnessConnected} toggle={toggleFitness} />
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Прогресс: {fitnessProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={fitnessProgress} sx={{ height: 10, borderRadius: 5 }} />
          </CardContent>
        </Card>

        {/* Google Health */}
        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "tertiaryContainer.main", color: "onTertiaryContainer.main", mr: 2 }}>
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
            <LinearProgress variant="determinate" value={healthProgress} sx={{ height: 10, borderRadius: 5 }} />
          </CardContent>
        </Card>
      </Stack>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Sync />}
          onClick={fetchStatus}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Обновить статус
        </Button>
      </Box>
    </Container>
  );
};

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
  CircularProgress,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

const iconMap: Record<string, React.ElementType> = {
  "Риск бессонницы": NightsStayIcon,
  "Нарушения ритма сердца": MonitorHeartIcon,
};

interface PredictionItem {
  diagnosisName: string;
  result: string;
}

interface MLPredictionsPageProps {
  onLoaded?: () => void;
}

export const MLPredictionsPage: React.FC<MLPredictionsPageProps> = ({
  onLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Цвет по вероятности
  const getColor = (p: number): "error" | "yellow" | "success" => {
    if (p > 0.7) return "error";
    if (p > 0.4) return "yellow";
    return "success";
  };

  // Круговой прогресс с цифрой
  const CircularProgressWithLabel: React.FC<{
    value: number;
    color: "error" | "yellow" | "success";
  }> = ({ value, color }) => {
    const getStrokeColor = () => {
      switch (color) {
        case "error":
          return theme.palette.error.main;
        case "success":
          return theme.palette.success.main;
        case "yellow":
          return theme.palette.warning.dark;
        default:
          return theme.palette.text.primary;
      }
    };
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={value}
          size={80}
          thickness={4}
          sx={{ color: getStrokeColor() }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" color="text.primary">
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Бейдж статуса
  const StatusBadge: React.FC<{ isError: boolean }> = ({ isError }) => {
    const bg = isError
      ? theme.palette.error.main + "1A"
      : theme.palette.primary.main + "1A";
    const dotColor = isError ? theme.palette.error.main : theme.palette.success.main;
    const text = isError ? "Требуется внимание" : "Все хорошо";
    return (
      <Box
        sx={{
          mt: 1,
          px: 1.5,
          py: 0.5,
          bgcolor: bg,
          color: isError ? theme.palette.error.main : theme.palette.success.main,
          borderRadius: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          typography: "body2",
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dotColor }} />
        {text}
      </Box>
    );
  };

  useEffect(() => {
    axios
      .get<PredictionItem[]>(
        `${process.env.REACT_APP_DATA_COLLECTION_API_URL}/api/v1/get_data/predictions`
      )
      .then((res) => setPredictions(res.data))
      .catch((err) => {
        enqueueSnackbar("Ошибка загрузки ML-прогнозов", { variant: "error" });
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
        onLoaded?.();
      });
  }, [enqueueSnackbar, onLoaded]);

  if (loading) {
    return (
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container ref={containerRef} maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        🤖 ML-прогнозы
      </Typography>

      <Stack spacing={3}>
        {predictions.map((item, idx) => {
          const pct = parseFloat(item.result) * 100;
          const colorKey = getColor(parseFloat(item.result));
          const isError = colorKey === "error";
          const Icon = iconMap[item.diagnosisName] || React.Fragment;

          return (
            <Card key={idx} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ position: "relative" }}>
                <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                  <StatusBadge isError={isError} />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Box textAlign="center">
                    <CircularProgressWithLabel value={pct} color={colorKey} />
                  </Box>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon />
                      <Typography variant="h6">{item.diagnosisName}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Вероятность: <strong>{pct.toFixed(1)}%</strong>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};

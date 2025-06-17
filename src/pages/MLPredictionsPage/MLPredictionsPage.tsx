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
  Divider,
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
  const getColor = (p: number): "error" | "warning" | "success" => {
    if (p > 0.7) return "error";
    if (p > 0.4) return "warning";
    return "success";
  };

  // Круговой прогресс с цифрой
  const CircularProgressWithLabel: React.FC<{
    value: number;
    color: "error" | "warning" | "success";
  }> = ({ value, color }) => {
    const strokeColor =
      color === "error"
        ? theme.palette.error.main
        : color === "warning"
        ? theme.palette.warning.dark
        : theme.palette.success.main;
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={value}
          size={60}
          thickness={4}
          sx={{ color: strokeColor }}
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
        🤖 ML‑прогнозы
      </Typography>

      <Stack spacing={3}>
        {predictions.map((item, idx) => {
          if (item.diagnosisName === "insomnia_apnea") {
            let parsed: Record<string, number> = {};
            try {
              parsed = JSON.parse(item.result);
            } catch {
              parsed = {};
            }
            const labels: Record<string, string> = {
              Insomnia: "Вероятность наличия бессонницы",
              Sleep_Apnea: "Вероятность наличия апноэ",
              nan: "Вероятность отсутствия обоих",
            };

            return (
              <Card
                key={idx}
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Insomnia & Sleep Apnea
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(parsed).map(([key, val]) => {
                      const pct = val * 100;
                      const colorKey = getColor(val);
                      return (
                        <Box
                          key={key}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <CircularProgressWithLabel
                            value={pct}
                            color={colorKey}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {labels[key]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            );
          }

          // Все остальные диагнозы как прежде
          const pct = parseFloat(item.result) * 100;
          const colorKey = getColor(parseFloat(item.result));
          const Icon = iconMap[item.diagnosisName] || React.Fragment;

          return (
            <Card key={idx} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <CircularProgressWithLabel value={pct} color={colorKey} />
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

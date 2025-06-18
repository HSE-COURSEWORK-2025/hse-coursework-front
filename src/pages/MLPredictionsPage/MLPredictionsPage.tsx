import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
  CircularProgress,
  Stack
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import SpeedIcon from '@mui/icons-material/Speed';
import MoodIcon from '@mui/icons-material/Mood';

const iconMap: Record<string, React.ElementType> = {
  insomnia_apnea: NightsStayIcon,
  hypertension: SpeedIcon,
  depression: MoodIcon
};

interface PredictionItem {
  diagnosisName: string;
  result: string;
}

interface MLPredictionsPageProps {
  onLoaded?: () => void;
}

export const MLPredictionsPage: React.FC<MLPredictionsPageProps> = ({ onLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getColor = (p: number): "error" | "warning" | "success" => {
    if (p > 0.7) return "error";
    if (p > 0.4) return "warning";
    return "success";
  };

  const CircularProgressWithLabel: React.FC<{ value: number; color: "error" | "warning" | "success"; }> = ({ value, color }) => {
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
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}
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
          let parsed: Record<string, number> = {};
          try {
            parsed = JSON.parse(item.result);
          } catch {
            parsed = {};
          }

          const labelsMap: Record<string, Record<string, string>> = {
            insomnia_apnea: {
              Insomnia: "Вероятность наличия бессонницы",
              Sleep_Apnea: "Вероятность наличия апноэ"
            },
            hypertension: {
              High: "Риск наличия гипертонии"
            },
            depression: {
              '1': "Вероятность наличия депрессии"
            }
          };

          const labels = labelsMap[item.diagnosisName] || {};
          const Icon = iconMap[item.diagnosisName] || React.Fragment;

          return (
            <Card key={idx} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon /> {item.diagnosisName.replace('_', ' ')}
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(parsed)
                    .filter(([key]) =>
                      !(item.diagnosisName === 'hypertension' && key === 'Low') &&
                      !(item.diagnosisName === 'depression' && key === '0') &&
                      !(item.diagnosisName === 'insomnia_apnea' && key === 'nan')
                    )
                    .map(([key, val]) => {
                      const pct = val * 100;
                      const colorKey = getColor(val);
                      return (
                        <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <CircularProgressWithLabel value={pct} color={colorKey} />
                          <Typography variant="body2" color="text.secondary">
                            {labels[key] || key}
                          </Typography>
                        </Box>
                      );
                    })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};

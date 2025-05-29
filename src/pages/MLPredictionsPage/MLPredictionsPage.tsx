import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  useTheme,
  CircularProgress,
} from "@mui/material";
import BedtimeIcon from '@mui/icons-material/Bedtime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

// Пример предсказанных диагнозов
const mockPredictions = [
  { name: "Риск бессонницы", probability: 0.44 },
  { name: "Нарушения ритма сердца", probability: 0.29 },
  ];

// Соответствие диагноза и иконки
const iconMap: Record<string, React.ElementType> = {
  "Риск бессонницы": NightsStayIcon,
  "Нарушения ритма сердца": MonitorHeartIcon,
};

// Круговой прогресс с цифрой и цветом по Material Design
interface CircularProgressWithLabelProps {
  value: number;
  color: "error" | "yellow" | "success";
}
const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
  value,
  color,
}) => {
  const theme = useTheme();
  
  // Определяем реальный цвет для индикатора
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
        <Typography variant="caption" component="div" color="text.primary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

// Статус-бейдж
const StatusBadge: React.FC<{ isError: boolean }> = ({ isError }) => {
  const theme = useTheme();
  const bg = isError
    ? theme.palette.error.main + "1A"
    : theme.palette.primary.main + "1A";
  const dotColor = isError
    ? theme.palette.error.main
    : theme.palette.success.main;
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
        typography: "body2",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: dotColor,
        }}
      />
      {text}
    </Box>
  );
};

export const MLPredictionsPage: React.FC = () => {
  // Определяем цвет по вероятности
  const getColor = (p: number): "error" | "yellow" | "success" => {
    if (p > 0.7) return "error";
    if (p > 0.4) return "yellow";
    return "success";
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Typography variant="h4">🤖 ML-прогнозы</Typography>
      </Box>

      {/* Список прогнозов */}
      <Stack spacing={3}>
        {mockPredictions.map((item, idx) => {
          const pct = item.probability * 100;
          const colorKey = getColor(item.probability);
          const isError = colorKey === "error";
          const IconComponent = iconMap[item.name] || React.Fragment;

          return (
            <Card key={idx} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ position: 'relative' }}>
                {/* Статус-бейдж в правом верхнем углу */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <StatusBadge isError={isError} />
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems="center"
                  spacing={3}
                >
                  {/* Круговой прогресс */}
                  <Box textAlign="center">
                    <CircularProgressWithLabel value={pct} color={colorKey} />
                  </Box>

                  {/* Описание */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconComponent />
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Вероятность события: <strong>{pct.toFixed(1)}%</strong>
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
          );
        })}
      </Stack>
    </Container>
  );
};

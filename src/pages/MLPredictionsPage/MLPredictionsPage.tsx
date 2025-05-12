import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
} from "@mui/material";
import { Insights } from "@mui/icons-material";

// Пример предсказанных диагнозов
const mockPredictions = [
  { name: "Риск бессонницы", probability: 0.44 },
  { name: "Нарушения ритма сердца", probability: 0.29 },
];

export const MLPredictionsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Заголовок страницы */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          p: 3,
          borderRadius: 4,
          bgcolor: "surfaceContainerHigh.main",
          boxShadow: 1,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mr: 3,
            bgcolor: "primaryContainer.main",
            color: "onPrimaryContainer.main",
          }}
        >
          <Insights fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="headlineSmall" component="h1">
            Результаты анализа здоровья
          </Typography>
          <Typography variant="bodyLarge" sx={{ color: "onSurfaceVariant.main" }}>
            Предсказания модели на основе ваших показателей
          </Typography>
        </Box>
      </Box>

      {/* Список предсказаний */}
      <Stack spacing={3}>
        {mockPredictions.map((item, index) => (
          <Card key={index} sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="titleMedium" gutterBottom>
                {item.name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={item.probability * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "surfaceVariant.main",
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      item.probability > 0.7
                        ? "error.main"
                        : item.probability > 0.4
                        ? "warning.main"
                        : "success.main",
                  },
                }}
              />
              <Typography
                variant="bodyMedium"
                sx={{ mt: 1, color: "onSurfaceVariant.main" }}
              >
                Вероятность: {(item.probability * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

import React from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

interface GenerateReportPageProps {
  /** Функция, вызываемая при клике на кнопку для формирования отчёта */
  onGenerate: () => void;
  /** Прогресс генерации в процентах (0–100). Если не задан, прогрессбар скрыт */
  progress?: number;
}

/**
 * Простая страница с кнопкой, подсказкой и прогрессбаром по генерации PDF отчёта.
 * Показывает, что будет включено в отчёт.
 */
export const GenerateReportPage: React.FC<GenerateReportPageProps> = ({
  onGenerate,
  progress,
}) => {
  const showProgress = typeof progress === "number";

  return (
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📄 Сгенерировать отчёт
        </Typography>
      </Container>
      <Container maxWidth="sm" sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Нажмите кнопку ниже, чтобы сформировать PDF отчёт. В отчёт войдут
          страницы с графиками и ML прогнозы.
        </Typography>

        {showProgress && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Генерация отчёта может занимать до 5 минут.
            </Typography>
            <LinearProgress variant="determinate" value={progress!} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {`Генерация отчёта: ${Math.round(progress!)}%`}
            </Typography>
          </Box>
        )}

        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={onGenerate}
            disabled={showProgress && progress! < 100}
          >
            {showProgress && progress! < 100
              ? "Генерация..."
              : "Сгенерировать отчёт (PDF)"}
          </Button>
        </Box>
      </Container>
    </Container>
  );
};

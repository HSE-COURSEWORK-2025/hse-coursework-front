import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  Link,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  QrCodeScanner,
  Sync,
  ShowChart,
  ReportProblem,
  NotificationsActive,
} from "@mui/icons-material";

export const MainPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Заголовок страницы */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Как работать с сервисом
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Шаг за шагом от подключения до отображения результатов анализа
        </Typography>
      </Box>

      {/* Инструкция в виде временной шкалы */}
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Timeline position="alternate">
          {/* Шаг 1 */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ flex: 0.2, m: "auto 0" }}
              variant="body2"
              color="text.secondary"
            >
              Шаг 1
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <QrCodeScanner />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Подключите мобильное приложение
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Откройте раздел «Выгрузка с мобильного устройства», отсканируйте QR-код в Android-приложении и подтвердите разрешения.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          {/* Шаг 2 */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ flex: 0.2, m: "auto 0" }}
              variant="body2"
              color="text.secondary"
            >
              Шаг 2
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="secondary">
                <Sync />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Автоматическая выгрузка
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Данные из Google Fitness API подтягиваются каждый час. Статус выгрузки доступен на странице «Статус задач».
              </Typography>
            </TimelineContent>
          </TimelineItem>

          {/* Шаг 3 */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ flex: 0.2, m: "auto 0" }}
              variant="body2"
              color="text.secondary"
            >
              Шаг 3
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: theme.palette.error.main }}>
                <ShowChart />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Просмотр графиков
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В разделе «Графики исходных данных» — интерактивные визуализации пульса, кислорода, активности и сна.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          {/* Шаг 4 */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ flex: 0.2, m: "auto 0" }}
              variant="body2"
              color="text.secondary"
            >
              Шаг 4
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="warning">
                <ReportProblem />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Анализ выбросов и прогнозы
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Откройте «Графики с выбросами» для аномалий и «Результаты анализа» для вероятностей рисков.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          {/* Шаг 5 */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ flex: 0.2, m: "auto 0" }}
              variant="body2"
              color="text.secondary"
            >
              Шаг 5
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success">
                <NotificationsActive />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Получите уведомления
              </Typography>
              <Typography variant="body2" color="text.secondary">
                О завершении выгрузки, обнаружении выбросов и результатах ML вы получите уведомления в веб-приложении и на почту (не для тестовых аккаунтов).
              </Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* Контакты */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Вопросы? Пишите в Telegram:{" "}
          <Link href="https://t.me/igmalysh" target="_blank" underline="hover">
            @igmalysh
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

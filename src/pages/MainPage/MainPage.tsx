import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  Link,
  Avatar,
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
  const avatarUrl =
    "https://avatars.githubusercontent.com/u/209133373?s=200&v=4";

  return (
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          🏠 Как работать с сервисом
        </Typography>
      </Container>

      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 5,
            gap: 2, // отступ между аватаркой и текстом
          }}
        >
          <Box textAlign="left"></Box>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Timeline position="alternate">
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
                  Откройте мобильное приложение, нажмите на кнопку «Открыть
                  камеру», отсканируйте QR-код. Начнется выгрузка данных из
                  Google Health Connect
                </Typography>
              </TimelineContent>
            </TimelineItem>

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
                  Данные автоматически выгружаются из Google Fitness API
                  подтягиваются каждый час (недоступно для тестовых аккаунтов).
                  Данные из Google Health Connect подтягиваются каждый раз,
                  когда вы сканируете QR с мобильного устройства. Статус
                  выгрузки доступен на странице «Статус выгрузки данных».
                </Typography>
              </TimelineContent>
            </TimelineItem>

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
                  В разделе «Графики исходных данных» представлены графики с
                  визуализациями ваших данных, собранных из Google Fitness API и
                  Google Health Connect.
                </Typography>
              </TimelineContent>
            </TimelineItem>

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
                  В разделе «Графики с выбросами» представлены графики исходных
                  данных с отметками о найденных аномалиях. В разделе
                  «ML-прогнозы» представлены результаты работы ML-моделей,
                  представленные в виде вероятностей наличия различных
                  диагнозов. Могут отображаться не самые актуальные данные о
                  выбросах и прогнозах, так как они обновляются раз в час.
                </Typography>
              </TimelineContent>
            </TimelineItem>

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
                  Получение уведомлений
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Вы получите уведомления о завершении выгрузки, обнаружении
                  выбросов и результатах ML обработки в веб-приложении и на
                  почту (недоступно для тестовых аккаунтов).
                </Typography>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Paper>

        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Есть вопросы? Пишите в Telegram:{" "}
            <Link
              href="https://t.me/igmalysh"
              target="_blank"
              underline="hover"
            >
              @igmalysh
            </Link>
          </Typography>
        </Box>
      </Container>
    </Container>
  );
};

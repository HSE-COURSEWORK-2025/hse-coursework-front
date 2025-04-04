import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  FitnessCenter,
  Favorite,
  AccessTime,
  Today,
  Insights,
} from "@mui/icons-material";

export const MainPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Шапка */}
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
          <FitnessCenter fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="headlineSmall" component="h1">
            Здоровье — это просто
          </Typography>
          <Typography
            variant="bodyLarge"
            sx={{ color: "onSurfaceVariant.main" }}
          >
            Все ваши показатели в одном месте
          </Typography>
        </Box>
      </Box>

      {/* Быстрые действия */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          startIcon={<Favorite sx={{ color: "secondary.main" }} />}
          sx={{
            py: 3,
            borderRadius: 5,
            bgcolor: "secondaryContainer.main",
            color: "onSecondaryContainer.main",
            textTransform: "none",
            fontWeight: "medium",
            "&:hover": {
              bgcolor: "secondaryContainer.dark",
            },
            "&:active": {
              bgcolor: "secondaryContainer.dark",
              transform: "scale(0.98)",
            },
          }}
        >
          Показатели
        </Button>
        <Button
          variant="contained"
          startIcon={<AccessTime sx={{ color: "tertiary.main" }} />}
          sx={{
            py: 3,
            borderRadius: 5,
            bgcolor: "tertiaryContainer.main",
            color: "onTertiaryContainer.main",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "tertiaryContainer.dark",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          Активность
        </Button>
        <Button
          variant="contained"
          startIcon={<Today sx={{ color: "onErrorContainer.main" }} />}
          sx={{
            py: 3,
            borderRadius: 5,
            bgcolor: "errorContainer.main",
            color: "onErrorContainer.main",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "errorContainer.dark",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          Календарь
        </Button>
        <Button
          variant="contained"
          startIcon={<Insights sx={{ color: "onPrimaryContainer.main" }} />}
          sx={{
            py: 3,
            borderRadius: 5,
            bgcolor: "primaryContainer.main",
            color: "onPrimaryContainer.main",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "primaryContainer.dark",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          Аналитика
        </Button>
      </Box>

      {/* Основной контент */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Левая колонка */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Сегодняшние метрики
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerLow.main",
                  }}
                >
                  <Typography
                    variant="headlineSmall"
                    sx={{ color: "primary.main" }}
                  >
                    72
                  </Typography>
                  <Typography
                    variant="bodyMedium"
                    sx={{ color: "onSurfaceVariant.main" }}
                  >
                    Пульс
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerLow.main",
                  }}
                >
                  <Typography
                    variant="headlineSmall"
                    sx={{ color: "secondary.main" }}
                  >
                    98%
                  </Typography>
                  <Typography
                    variant="bodyMedium"
                    sx={{ color: "onSurfaceVariant.main" }}
                  >
                    Кислород
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Последние события
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerHighest.main",
                  }}
                >
                  <Typography variant="bodyLarge">
                    Утренняя пробежка 2.5 км
                  </Typography>
                  <Chip
                    label="08:30 утра"
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "surfaceVariant.main",
                      color: "onSurfaceVariant.main",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerHighest.main",
                  }}
                >
                  <Typography variant="bodyLarge">
                    Норма воды выполнена
                  </Typography>
                  <Chip
                    label="1.5 л из 2 л"
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "surfaceVariant.main",
                      color: "onSurfaceVariant.main",
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Правая колонка */}
        <Box
          sx={{
            width: { xs: "100%", md: 360 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Советы дня
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerHigh.main",
                  }}
                >
                  <Favorite sx={{ color: "tertiary.main" }} />
                  <Typography variant="bodyLarge">
                    Сделайте 5-минутную разминку
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "surfaceContainerHigh.main",
                  }}
                >
                  <AccessTime sx={{ color: "primary.main" }} />
                  <Typography variant="bodyLarge">
                    Запланируйте время для отдыха
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="titleLarge" gutterBottom>
                Быстрые действия
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 5,
                    borderColor: "outline",
                    color: "onSurface.main",
                  }}
                >
                  Добавить вес
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 5,
                    borderColor: "outline",
                    color: "onSurface.main",
                  }}
                >
                  Записать сон
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 5,
                    borderColor: "outline",
                    color: "onSurface.main",
                  }}
                >
                  Добавить активность
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

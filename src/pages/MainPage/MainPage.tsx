import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Typography,
  Avatar,
  Paper,
  Stack
} from '@mui/material';
import { 
  FitnessCenter, 
  Favorite, 
  AccessTime, 
  Today, 
  Insights 
} from '@mui/icons-material';

export const MainPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Шапка */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        borderRadius: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Avatar sx={{ 
          width: 64, 
          height: 64, 
          mr: 3,
          bgcolor: 'secondary.main'
        }}>
          <FitnessCenter fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1">
            Здоровье — это просто
          </Typography>
          <Typography variant="subtitle1">
            Все ваши показатели в одном месте
          </Typography>
        </Box>
      </Box>

      {/* Быстрые действия */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 4,
        '& > *': { flex: '1 1 calc(50% - 16px)' },
        '@media (min-width: 600px)': { '& > *': { flex: '1 1 calc(25% - 16px)' } }
      }}>
        <Button 
          variant="contained" 
          startIcon={<Favorite />}
          sx={{ py: 3 }}
        >
          Показатели
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AccessTime />}
          sx={{ py: 3 }}
        >
          Активность
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Today />}
          sx={{ py: 3 }}
        >
          Календарь
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Insights />}
          sx={{ py: 3 }}
        >
          Аналитика
        </Button>
      </Box>

      {/* Основной контент */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3 
      }}>
        {/* Левая колонка */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сегодняшние метрики
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexWrap: 'wrap',
                '& > *': { flex: '1 1 200px' }
              }}>
                <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                  <Typography variant="h5">72</Typography>
                  <Typography variant="caption">Пульс</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                  <Typography variant="h5">98%</Typography>
                  <Typography variant="caption">Кислород</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Последние события
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                  <Typography>Утренняя пробежка 2.5 км</Typography>
                  <Typography variant="caption" color="text.secondary">
                    08:30 утра
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography>Норма воды выполнена</Typography>
                  <Typography variant="caption" color="text.secondary">
                    1.5 л из 2 л
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Правая колонка */}
        <Box sx={{ 
          width: { xs: '100%', md: '320px' }, 
          flexShrink: 0 
        }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Советы дня
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Favorite color="primary" />
                  <Typography>Сделайте 5-минутную разминку</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="primary" />
                  <Typography>Запланируйте время для отдыха</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" fullWidth>Добавить вес</Button>
                <Button variant="outlined" fullWidth>Записать сон</Button>
                <Button variant="outlined" fullWidth>Добавить активность</Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};
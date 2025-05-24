import { Container, Box, Typography, Divider, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { GoogleLoginButton } from '../../components';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Обработчик входа в тестовый аккаунт
  const handleTestLogin = async () => {
    try {
      const response = await fetch(
        'http://hse-coursework-health.ru/auth-api/api/v1/auth/get-test-account',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      // Сохраняем токены в localStorage или контекст
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      enqueueSnackbar('Успешный вход в тестовый аккаунт!', { variant: 'success' });
      // Перенаправление на главную страницу или дашборд
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Не удалось войти в тестовый аккаунт', { variant: 'error' });
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: 'background.paper',
            textAlign: 'center',
            width: '100%',
            minWidth: '300px',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}
          >
            Добро пожаловать
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Войдите с помощью Google-аккаунта
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <GoogleLoginButton />

            {/* Кнопка входа в тестовый аккаунт */}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleTestLogin}
            >
              Войти в тестовый аккаунт
            </Button>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Продолжая, вы соглашаетесь с нашими
              <br />
              <a href="/terms" style={{ color: 'inherit' }}>
                Условиями использования
              </a>{' '}
              и{' '}
              <a href="/privacy" style={{ color: 'inherit' }}>
                Политикой конфиденциальности
              </a>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

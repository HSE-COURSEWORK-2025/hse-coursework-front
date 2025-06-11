import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Divider, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { GoogleLoginButton } from '../../components';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

interface TestUser {
  id: string;
  login: string;
  name: string;
}

export const LoginPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Fetch test users list
  useEffect(() => {
    const fetchTestUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(
          'http://hse-coursework-health.ru/auth-api/api/v1/internal/users/get_all_users?test_users=true&real_users=false',
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
        if (!res.ok) throw new Error(`Error fetching users: ${res.status}`);
        const data = await res.json();
        setTestUsers(data.users || []);
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Не удалось загрузить список тестовых пользователей', { variant: 'error' });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchTestUsers();
  }, [enqueueSnackbar]);

  // Handler for test login list
  const handleTestUserLogin = async () => {
    if (!selectedUser) {
      enqueueSnackbar('Пожалуйста, выберите тестового пользователя', { variant: 'warning' });
      return;
    }

    setLoggingIn(true);
    try {
      const res = await fetch(
        `http://hse-coursework-health.ru/auth-api/api/v1/auth/auth-test-account?test_account_login=${encodeURIComponent(selectedUser)}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      enqueueSnackbar(`Успешный вход как ${selectedUser}!`, { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Не удалось войти под данным пользователем', { variant: 'error' });
    } finally {
      setLoggingIn(false);
    }
  };

  // Existing quick test login
  const handleQuickTestLogin = async () => {
    try {
      const response = await fetch(
        'http://hse-coursework-health.ru/auth-api/api/v1/auth/get-test-account',
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      enqueueSnackbar('Успешный вход в тестовый аккаунт!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Не удалось войти в тестовый аккаунт', { variant: 'error' });
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', textAlign: 'center', width: '100%', minWidth: '300px', overflow: 'visible', position: 'relative' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
            Добро пожаловать
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Войдите с помощью Google-аккаунта или выберите тестового пользователя
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <GoogleLoginButton />

            {/* Dropdown for test users */}
            <FormControl fullWidth>
              <InputLabel id="test-user-select-label">Тестовый пользователь</InputLabel>
              <Select
                labelId="test-user-select-label"
                value={selectedUser}
                label="Тестовый пользователь"
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={loadingUsers}
              >
                {loadingUsers ? (
                  <MenuItem value="">
                    <CircularProgress size={24} /> Загрузка...
                  </MenuItem>
                ) : (
                  testUsers.map((user) => (
                    <MenuItem key={user.id} value={user.login}>
                      {user.name || user.login}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Button to login as selected test user */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleTestUserLogin}
              disabled={loggingIn || loadingUsers}
            >
              {loggingIn ? <CircularProgress size={24} /> : 'Войти как тестовый пользователь'}
            </Button>

            {/* Quick random test login */}
            <Button variant="outlined" fullWidth onClick={handleQuickTestLogin}>
              Войти в тестовый аккаунт
            </Button>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Продолжая, вы соглашаетесь с нашими
              <br />
              <a href="/terms" style={{ color: 'inherit' }}>Условиями использования</a> и{' '}
              <a href="/privacy" style={{ color: 'inherit' }}>Политикой конфиденциальности</a>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

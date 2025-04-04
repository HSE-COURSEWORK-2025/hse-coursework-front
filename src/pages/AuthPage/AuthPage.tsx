import { Container, Box, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { GoogleLoginButton } from '../../components';
import { useSnackbar } from 'notistack';

export const LoginPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Container maxWidth="xs" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
          width: '100%'
        }}>
          {/* Заголовок */}
          <Typography variant="h4" sx={{ 
            mb: 2,
            fontWeight: 700,
            color: 'primary.main'
          }}>
            Добро пожаловать
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Войдите с помощью Google-аккаунта
          </Typography>

          {/* Блок с Google-авторизацией */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <GoogleLoginButton />
            
            <Divider sx={{ width: '100%', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                или
              </Typography>
            </Divider>

            <Typography variant="body2" color="text.secondary">
              Продолжая, вы соглашаетесь с нашими<br/>
              <a href="/terms" style={{ color: 'inherit' }}>Условиями использования</a> и 
              <a href="/privacy" style={{ color: 'inherit' }}> Политикой конфиденциальности</a>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};
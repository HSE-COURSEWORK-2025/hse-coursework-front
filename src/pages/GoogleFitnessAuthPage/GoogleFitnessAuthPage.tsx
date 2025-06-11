import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { useAuth } from "../../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import DirectionsRun from "@mui/icons-material/DirectionsRun";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Расширение глобального объекта window для Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initCodeClient: (opts: any) => any;
        };
      };
    };
  }
}

const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.body_temperature.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.location.read",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
].join(" ");

const API_URL = process.env.REACT_APP_AUTH_API_URL || "";

interface TestUser {
  google_sub: string;
  email: string;
  name: string;
  picture: string;
}

export const GoogleFitnessAuthPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [codeClient, setCodeClient] = useState<any>(null);
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Google OAuth init
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2?.initCodeClient) {
        clearInterval(interval);
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID!,
          scope: scopes,
          redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI!,
          access_type: "offline",
          prompt: "consent",
          callback: (response: any) => {
            if (response.error) {
              enqueueSnackbar("Не удалось авторизоваться. Попробуйте снова.", {
                variant: "error",
              });
              return;
            }
            if (response.code) {
              setAuthCode(response.code);
              enqueueSnackbar("Код авторизации получен! Обмен токенов...", {
                variant: "success",
              });
              exchangeCode(response.code);
            }
          },
        });
        setCodeClient(client);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enqueueSnackbar]);

  // Fetch test users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(
          `${API_URL}/api/v1/internal/users/get_all_users?test_users=true&real_users=false`,
          {
            headers: { Accept: "application/json" },
          }
        );
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        const data: TestUser[] = await res.json();
        data.sort((a, b) => extractNumber(a.name) - extractNumber(b.name));

        setTestUsers(data);
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Не удалось загрузить список тестовых пользователей", {
          variant: "error",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [enqueueSnackbar]);

  const exchangeCode = async (code: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/google-code-fitness`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );
      if (!response.ok) throw new Error("Ошибка обмена кода на токены");
      const data = await response.json();

      setTokens(data.access_token, data.refresh_token);
      enqueueSnackbar("Вход через Google Fit выполнен успешно!", {
        variant: "success",
      });
      navigate("/");
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleSignIn = () => {
    if (codeClient) {
      codeClient.requestCode();
    } else {
      enqueueSnackbar("SDK загружается, чуть позже всё будет готово!", {
        variant: "warning",
      });
    }
  };

  const handleCreateTestUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/get-test-account`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      setTokens(data.access_token, data.refresh_token);
      enqueueSnackbar("Тестовый аккаунт создан и загружен! Добро пожаловать.", {
        variant: "success",
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Не удалось создать тестовый аккаунт.", {
        variant: "error",
      });
    }
  };

  const handleTestUserLogin = async () => {
    if (!selectedUserEmail) {
      enqueueSnackbar("Пожалуйста, выберите тестового пользователя", {
        variant: "warning",
      });
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/auth/auth-test-account?test_account_login=${encodeURIComponent(
          selectedUserEmail
        )}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();

      setTokens(data.access_token, data.refresh_token);
      enqueueSnackbar(`Успешный вход как ${selectedUserEmail}!`, {
        variant: "success",
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Не удалось войти под данным пользователем", {
        variant: "error",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const extractNumber = (str: string): number => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            bgcolor: "background.paper",
            textAlign: "center",
            width: "100%",
            minWidth: 300,
          }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
          >
            Вход
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Авторизуйтесь через Google, чтобы приложение могло читать ваши
            данные о здоровье из Google Fitness API.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Или воспользуйтесь тестовым аккаунтом для ознакомления с
            возможностями без регистрации.
          </Typography>

          {/* Основные кнопки */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={handleSignIn}
              startIcon={<DirectionsRun />}
              sx={{
                background: "linear-gradient(45deg, #FF6FD8 30%, #3813C2 90%)",
                borderRadius: "20px",
                py: 1.5,
                px: 3,
                fontSize: 16,
                width: "100%",
                textTransform: "none",
                color: "#fff",
                boxShadow: "0 3px 5px 2px rgba(58,24,143, .3)",
                // hover-анимация убрана
              }}
            >
              Войти через Google
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateTestUser}
              fullWidth
              startIcon={<PersonAddIcon />}
              sx={{
                background: "linear-gradient(45deg, #FF5F6D 30%, #FFC371 90%)",
                borderRadius: "20px",
                py: 1.5,
                px: 3,
                fontSize: 16,
                textTransform: "none",
                color: "#fff",
                boxShadow: "0 3px 5px 2px rgba(255,95,109, .3)",
                // hover-анимация убрана
              }}
            >
              Создать нового тестового пользователя и войти
            </Button>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Создать нового тестового пользователя и вход */}
            <FormControl fullWidth disabled={loadingUsers} sx={{ mb: 2 }}>
              <InputLabel id="gf-test-user-select-label">
                Выберите тестового пользователя
              </InputLabel>
              <Select
                labelId="gf-test-user-select-label"
                value={selectedUserEmail}
                label="Выберите тестового пользователя"
                onChange={(e) => setSelectedUserEmail(e.target.value)}
              >
                {loadingUsers ? (
                  <MenuItem value="">
                    <CircularProgress size={24} /> Загрузка...
                  </MenuItem>
                ) : (
                  testUsers.map((user) => (
                    <MenuItem key={user.google_sub} value={user.google_sub}>
                      <ListItem disableGutters>
                        <ListItemAvatar>
                          <Avatar />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                      </ListItem>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleTestUserLogin}
              startIcon={<PersonIcon />}
              disabled={loggingIn}
              sx={{
                background: "linear-gradient(45deg, #6EE7B7 30%, #3B82F6 90%)",
                borderRadius: "20px",
                py: 1.5,
                px: 3,
                fontSize: 16,
                width: "100%",
                textTransform: "none",
                color: "#fff",
                boxShadow: "0 3px 5px 2px rgba(58,142,255, .3)",
                // hover-анимация убрана
              }}
            >
              Войти как существующий тестовый пользователь
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

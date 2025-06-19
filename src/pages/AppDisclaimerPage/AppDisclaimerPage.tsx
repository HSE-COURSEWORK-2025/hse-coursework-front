import React from "react";
import { Container, Box, Typography, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const AppDisclaimerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Переход к основному приложению
    navigate("/");
  };

  return (
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          ⚠️ Важно!
        </Typography>
      </Container>

      <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
        <Box
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          sx={{
            backgroundColor: "background.paper",
            p: 5,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <Typography variant="body1" paragraph>
            Это приложение разработано как минимальный жизнеспособный продукт
            (MVP) в рамках учебного проекта. Все функции и интерфейсы носят
            демонстрационный характер.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" paragraph>
            <strong>• </strong> Автор не предоставляет никаких гарантий
            безопасности, надёжности или конфиденциальности обработки
            медицинских данных.
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>• </strong> Все данные вводятся и хранятся без защиты.
            Используйте приложение на свой страх и риск.
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>• </strong>Автор не несёт ответственности за любые убытки,
            ущерб или негативные последствия, связанные с использованием данного
            ПО.
          </Typography>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleContinue}
              size="large"
              sx={{
                textTransform: "none",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                backgroundColor: "error.main",
                "&:hover": { backgroundColor: "error.dark" },
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              Я понимаю риски и хочу продолжить
            </Button>
          </Box>
        </Box>
      </Container>
    </Container>
  );
};

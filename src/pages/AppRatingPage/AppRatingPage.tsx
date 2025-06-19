import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Rating,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.REACT_APP_RATINGS_API_URL || "";

export const AppRatingPage: React.FC = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Загрузить текущую оценку пользователя (если есть)
  const fetchUserRating = async () => {
    try {
      setError(null);
      const response = await axios.get<{ rating: number }>(
        `${API_URL}/api/v1/ratings/my`,
      );
      setRating(response.data.rating);
      setInitialRating(response.data.rating);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Нет оценки — оставляем rating = null
        setRating(null);
        setInitialRating(null);
      } else {
        setError("Ошибка при загрузке вашей оценки");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Отправить новую либо обновлённую оценку
  const submitRating = async () => {
    if (rating == null) return;
    try {
      setError(null);
      setIsSubmitting(true);
      await axios.post(`${API_URL}/api/v1/ratings/submit`, { rating });
      // После сохранения заново подгружаем, чтобы обновить информационное сообщение
      await fetchUserRating();
    } catch (err: any) {
      setError("Ошибка при отправке оценки");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUserRating();
  }, []);

  // Кнопка активна, если:
  // - Во время загрузки данных/отправки она не активируется,
  // - И если ещё не было оценки (initialRating == null) и поставлен рейтинг (rating != null),
  // - Либо если уже была оценка, но пользователь выбрал другое значение: rating !== initialRating.
  const isButtonDisabled = () => {
    if (isLoading || isSubmitting) return true;
    if (initialRating === null) {
      // Раньше не было оценки
      return rating === null;
    } else {
      // Раньше была оценка, активировать только если она изменилась
      return rating === null || rating === initialRating;
    }
  };

  return (
    <Container>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          ⭐ Оцените приложение
        </Typography>
      </Container>

      <Container
        maxWidth="md"
        sx={{
          minHeight: "67vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
          backgroundColor: "background.default",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Box
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
              p: 4,
              textAlign: "center",
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {initialRating != null
                    ? `Вы уже оценили приложение на ${initialRating} ${
                        initialRating === 1 ? "звезду" : "звёзд"
                      }. Чтобы обновить оценку, выберите новое число и нажмите «${
                        initialRating != null
                          ? "Обновить оценку"
                          : "Проставить оценку"
                      }».`
                    : "Поставьте оценку от 1 до 5, чтобы мы могли стать лучше."}
                </Typography>

                <Rating
                  name="app-rating"
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                  size="large"
                />

                <Typography sx={{ mt: 2 }}>
                  {rating != null
                    ? `Текущая оценка: ${rating} ${
                        rating === 1 ? "звезда" : "звёзд"
                      }`
                    : "Вы ещё не оценили приложение"}
                </Typography>

                <Button
                  variant="contained"
                  onClick={submitRating}
                  disabled={isButtonDisabled()}
                  sx={{
                    mt: 3,
                    textTransform: "none",
                    backgroundColor: "#16a180",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "#13876e" },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : initialRating != null ? (
                    "Обновить оценку"
                  ) : (
                    "Проставить оценку"
                  )}
                </Button>
              </>
            )}

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </motion.div>
      </Container>
    </Container>
  );
};

import React from "react";
import { Container, Typography, List, ListItem, ListItemIcon, ListItemText, Paper } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const notifications = [
  {
    id: 1,
    title: "Обновление данных",
    message: "Новые данные успешно загружены.",
    time: "10:30 AM"
  },
  {
    id: 2,
    title: "Ошибка соединения",
    message: "Проблема с сетью, попробуйте снова.",
    time: "9:15 AM"
  },
  {
    id: 3,
    title: "Напоминание",
    message: "Не забудьте проверить настройки уведомлений.",
    time: "Вчера"
  }
];

export const NotificationsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Уведомления
      </Typography>
      <Paper elevation={3} sx={{ mt: 2 }}>
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id} divider>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={`${notification.message} • ${notification.time}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

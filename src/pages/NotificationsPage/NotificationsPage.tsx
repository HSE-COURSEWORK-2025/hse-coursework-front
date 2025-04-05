import React from "react";
import { 
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  styled,
  useTheme
} from "@mui/material";
import { Notifications as NotificationsIcon, Close } from "@mui/icons-material";

const notifications = [
  {
    id: 1,
    title: "Обновление данных",
    message: "Новые данные успешно загружены",
    time: "2 часа назад",
    unread: true
  },
  {
    id: 2,
    title: "Ошибка соединения",
    message: "Проблема с сетью, попробуйте снова",
    time: "5 часов назад",
    unread: false
  },
  {
    id: 3,
    title: "Напоминание",
    message: "Проверьте настройки уведомлений",
    time: "Вчера",
    unread: false
  }
];

const NotificationSurface = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden'
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .MuiIconButton-root': {
      visibility: 'visible'
    }
  }
}));

export const NotificationsPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      maxWidth: 600, 
      mx: 'auto', 
      py: 3,
      px: 2,
      minHeight: '100vh'
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3,
          color: 'text.primary',
          fontWeight: 700,
          letterSpacing: '-0.03em'
        }}
      >
        Уведомления
      </Typography>
      
      <NotificationSurface>
        <List disablePadding>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <StyledListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small"
                    sx={{ 
                      visibility: 'hidden',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                }
                sx={{
                  py: 2,
                  px: 3,
                  backgroundColor: 'transparent',
                  position: 'relative'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  alignSelf: 'flex-start',
                  mt: '2px'
                }}>
                  <NotificationsIcon 
                    fontSize="medium" 
                    sx={{ 
                      color: 'text.secondary',
                      opacity: 0.7
                    }} 
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                        lineHeight: 1.3,
                        mb: 0.5
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ 
                          display: 'block',
                          color: 'text.secondary',
                          lineHeight: 1.4,
                          opacity: 0.9
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ 
                          display: 'block',
                          color: 'text.secondary',
                          mt: 1,
                          opacity: 0.7,
                          fontSize: '0.75rem'
                        }}
                      >
                        {notification.time}
                      </Typography>
                    </>
                  }
                />
              </StyledListItem>
              {index < notifications.length - 1 && (
                <Divider 
                  variant="middle" 
                  sx={{ 
                    mx: 3,
                    backgroundColor: 'divider',
                    opacity: 0.5
                  }} 
                />
              )}
            </React.Fragment>
          ))}
        </List>
      </NotificationSurface>
    </Box>
  );
};
import React, { useEffect, useState, useRef } from "react";
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
  useTheme,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Notifications as NotificationsIcon, Close } from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";

interface Notification {
  for_email: string;
  time: string;
  notification_text: string;
  checked: boolean;
}

const NotificationSurface = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: "hidden",
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiIconButton-root": {
      visibility: "visible",
    },
  },
}));

export const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [unchecked, setUnchecked] = useState<Notification[]>([]);
  const [all, setAll] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Флаг, чтобы избежать двойного вызова в StrictMode
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return; // если уже фетчили — выходим
    didFetchRef.current = true;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const [uncheckedRes, allRes] = await Promise.all([
          axios.get<Notification[]>(
            "http://hse-coursework-health.ru/notifications-api/api/v1/notifications/get_unchecked_notifications",
          ),
          axios.get<Notification[]>(
            "http://hse-coursework-health.ru/notifications-api/api/v1/notifications/get_all_notifications",
          ),
        ]);

        const sortByTimeDesc = (a: Notification, b: Notification) =>
          new Date(b.time).getTime() - new Date(a.time).getTime();

        setUnchecked([...uncheckedRes.data].sort(sortByTimeDesc));
        setAll([...allRes.data].sort(sortByTimeDesc));
      } catch (err) {
        enqueueSnackbar("Ошибка загрузки уведомлений", { variant: "error" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // пустой массив зависимостей

  const renderNotificationList = (items: Notification[]) => (
    <NotificationSurface>
      <List disablePadding>
        {items.map((notification, index) => (
          <React.Fragment key={index}>
            <StyledListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  sx={{
                    visibility: "hidden",
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
              sx={{
                py: 2,
                px: 3,
                backgroundColor: notification.checked
                  ? "transparent"
                  : theme.palette.action.selected,
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 40, alignSelf: "flex-start", mt: "2px" }}
              >
                <NotificationsIcon
                  fontSize="medium"
                  sx={{ color: "text.secondary", opacity: 0.7 }}
                />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: notification.notification_text,
                    }}
                  />
                }
                secondary={
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      mt: 1,
                      opacity: 0.7,
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(notification.time).toLocaleString("ru-RU")}
                  </Typography>
                }
              />
            </StyledListItem>

            {index < items.length - 1 && (
              <Divider
                variant="middle"
                sx={{ mx: 3, backgroundColor: "divider", opacity: 0.5 }}
              />
            )}
          </React.Fragment>
        ))}
      </List>
    </NotificationSurface>
  );

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 3, px: 2, minHeight: "100vh" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: "text.primary",
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        Уведомления
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={`Новые (${unchecked.length})`} />
        <Tab label={`Все (${all.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && renderNotificationList(unchecked)}
          {tab === 1 && renderNotificationList(all)}
        </>
      )}
    </Box>
  );
};

export default NotificationsPage;

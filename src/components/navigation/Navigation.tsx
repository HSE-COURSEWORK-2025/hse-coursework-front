import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  styled,
  Tooltip,
  Avatar,
  Divider,
  Typography,
  IconButton,
  Badge,
} from "@mui/material";
import { Link, useLocation, LinkProps } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { INavigationItem } from "../type";

// Декодер JWT, как у вас
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

interface NavigationProps {
  items: INavigationItem[];
  open?: boolean;
  onClose?: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 280,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

const StyledListItemButton = styled(ListItemButton)<
  { component?: React.ElementType } & LinkProps
>(({ theme }) => ({
  borderRadius: "28px",
  margin: theme.spacing(0, 1.5),
  padding: theme.spacing(1.5, 2),
  minHeight: "56px",
  transition: theme.transitions.create(["background-color", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:active": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export const Navigation: React.FC<NavigationProps> = ({
  items,
  open = true,
  onClose,
}) => {
  const theme = useTheme();
  const location = useLocation();

  // JWT + пользовательские данные
  const token = localStorage.getItem("accessToken") || "";
  const userData = parseJwt(token);
  const userName = userData?.name || "My App";
  const userLogo = userData?.picture || "";

  // --- Вот тут ключ: статус уведомлений из WS ---
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Пример: ws://localhost:8000
    const WS_BASE = process.env.REACT_APP_WS_BASE_URL || window.location.origin.replace(/^http/, "ws");
    const ws = new WebSocket(
      `${WS_BASE}/notifications-api/api/v1/notifications/has_unchecked?token=${token}`
    );

    ws.onopen = () => {
      // сразу «пингнем», чтобы таска подтвердила наличие
      ws.send("ping");
    };
    ws.onmessage = (evt) => {
      try {
        const { has_unchecked } = JSON.parse(evt.data);
        setHasUnread(has_unchecked);
      } catch {
        // игнорируем кривые данные
      }
    };
    ws.onerror = () => {
      // на ошибку можно переподключаться или логировать
      console.error("WS error on notifications_status");
    };
    ws.onclose = () => {
      // при падении соединения можно переподключать,
      // но для простоты просто чистим статус
      setHasUnread(false);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  return (
    <StyledDrawer variant="permanent" open={open} onClose={onClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: theme.spacing(3),
          height: "64px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={userLogo}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              width: 40,
              height: 40,
            }}
          >
            {!userLogo && userName[0]}
          </Avatar>
          {open && (
            <Typography variant="h6" color="text.primary">
              {userName}
            </Typography>
          )}
        </Box>
        <IconButton
          component={Link}
          to="/notificationsPage"
          sx={{
            color: "inherit",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <Badge
            variant="dot"
            color="error"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            invisible={!hasUnread}
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: theme.spacing(0, 1.5), flex: 1 }}>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? item.text : ""} placement="right">
              <StyledListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: "inherit",
                    mr: open ? 2 : "auto",
                    ...(location.pathname === item.path && {
                      color: theme.palette.primary.main,
                    }),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: "body1",
                      fontWeight: 500,
                      color: "inherit",
                    }}
                  />
                )}
              </StyledListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: theme.spacing(2) }}>
        <Divider sx={{ mb: 2 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Version 1.0.0
        </Typography>
      </Box>
    </StyledDrawer>
  );
};

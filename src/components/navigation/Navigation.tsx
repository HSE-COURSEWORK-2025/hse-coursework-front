import {
  Box, // Добавьте этот импорт
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
} from "@mui/material";
import { INavigationItem } from "../type";
import { Link, useLocation, LinkProps } from "react-router-dom";

interface NavigationProps {
  items: INavigationItem[];
  open?: boolean;
  onClose?: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 240,
    backgroundColor: theme.palette.background.default,
    borderRight: "none",
    boxShadow: theme.shadows[4],
  },
}));

const StyledListItemButton = styled(ListItemButton)<
  { component?: React.ElementType } & LinkProps
>(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0, 1.5),
  padding: theme.spacing(1, 2),
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const Navigation = ({
  items,
  open = true,
  onClose,
}: NavigationProps) => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <StyledDrawer variant="permanent" open={open} onClose={onClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: theme.spacing(3, 2),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            mr: 2,
            width: 40,
            height: 40,
          }}
        >
          A
        </Avatar>
        <Typography variant="h6" color="text.primary">
          My App
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: theme.spacing(2) }}>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <Tooltip title={!open ? item.text : ""} placement="right">
              <StyledListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color:
                      location.pathname === item.path
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    mr: open ? 2 : "auto",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {open && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 500,
                      color:
                        location.pathname === item.path
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                    }}
                  />
                )}
              </StyledListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Divider sx={{ my: 1 }} />
      <Box sx={{ p: theme.spacing(2) }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          Version 1.0.0
        </Typography>
      </Box>
    </StyledDrawer>
  );
};

import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Divider,
  Container,
} from "@mui/material";
import { AccountCircle, Logout, Person, Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNotification } from "../contexts/NotificationContext";
import { useUserData } from "../contexts/UserDataContext";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const { user } = useUserData();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleGoToHome = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleProfile = () => {
    handleMenuClose();
    showSuccess("Funcionalidad de perfil próximamente");
  };

  const handleSettings = () => {
    handleMenuClose();
    showSuccess("Funcionalidad de configuraciones próximamente");
  };

  // Si no hay usuario, no mostrar el navbar
  if (!user) {
    return null;
  }

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            color="inherit"
            onClick={handleGoToHome}
            sx={{
              fontSize: 24,
              fontWeight: "bold",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            VacApp
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, opacity: 0.9 }}>
              {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
            </Typography>

            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.2)" }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 250,
                mt: 1,
                borderRadius: 2,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                },
              },
            }}
          >
            {/* Header del usuario */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {user.propietario || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.rancho_nombre}
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                {user.rol}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleProfile}>
              <Person sx={{ mr: 2, fontSize: 20 }} />
              Mi Perfil
            </MenuItem>

            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 2, fontSize: 20 }} />
              Configuraciones
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <Logout sx={{ mr: 2, fontSize: 20 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

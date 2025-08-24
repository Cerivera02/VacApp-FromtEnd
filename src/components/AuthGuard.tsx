import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../contexts/UserDataContext";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireGanadero?: boolean;
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireGanadero = false,
}: AuthGuardProps) => {
  const { user, isAdmin, isGanadero, isLoading } = useUserData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si está cargando, no hacer nada
    if (isLoading) return;

    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) return;

    // Si requiere autenticación pero no hay usuario, redirigir al login
    if (!user || !isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Si requiere admin pero el usuario no es admin, redirigir al dashboard
    if (requireAdmin && !isAdmin) {
      navigate("/dashboard");
      return;
    }

    // Si requiere ganadero pero el usuario no es ganadero, redirigir al dashboard
    if (requireGanadero && !isGanadero) {
      navigate("/dashboard");
      return;
    }
  }, [
    user,
    isAdmin,
    isGanadero,
    isLoading,
    requireAuth,
    requireAdmin,
    requireGanadero,
    navigate,
    isAuthenticated,
  ]);

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no requiere autenticación, mostrar children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Si requiere autenticación pero no hay usuario, no mostrar nada (se redirigirá)
  if (!user || !isAuthenticated()) {
    return null;
  }

  // Si requiere admin pero el usuario no es admin, no mostrar nada (se redirigirá)
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // Si requiere ganadero pero el usuario no es ganadero, no mostrar nada (se redirigirá)
  if (requireGanadero && !isGanadero) {
    return null;
  }

  // Si pasa todas las validaciones, mostrar children
  return <>{children}</>;
};

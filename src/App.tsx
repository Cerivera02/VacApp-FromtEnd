import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { NotificationProvider } from "./contexts/NotificationContext";
import { VacaDataProvider } from "./contexts/VacaDataContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { ModalProvider } from "./contexts/ModalContext";
import { AuthGuard } from "./components/AuthGuard";
import { VacaDetallesPage } from "./pages/VacaDetallesPage";
import { VacaEditarPage } from "./pages/VacaEditarPage";

export default function App() {
  return (
    <NotificationProvider>
      <UserDataProvider>
        <VacaDataProvider>
          <ModalProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard>
                      <Dashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/vaca/:id/detalles"
                  element={
                    <AuthGuard>
                      <VacaDetallesPage />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/vaca/:id/editar"
                  element={
                    <AuthGuard requireAdmin>
                      <VacaEditarPage />
                    </AuthGuard>
                  }
                />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </BrowserRouter>
          </ModalProvider>
        </VacaDataProvider>
      </UserDataProvider>
    </NotificationProvider>
  );
}

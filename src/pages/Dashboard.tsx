import {
  Container,
  Box,
  Button,
  Typography,
  Fab,
  Tooltip,
} from "@mui/material";
import { Navbar } from "../components/navbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { VacaService } from "../services/vacaService";
import { MarcaService } from "../services/marcaService";
import type { Vaca } from "../types/interfaces";
import { useNotification } from "../contexts/NotificationContext";
import { VacaCard } from "../components/vacaCard";
import { Refresh as RefreshIcon, Add as AddIcon } from "@mui/icons-material";
import { useVacaData } from "../contexts/VacaDataContext";
import { useModal } from "../contexts/ModalContext";
import { GestionVacasModal } from "../components/GestionVacasModal";
import { ModalRenderer } from "../components/ModalRenderer";

export default function Dashboard() {
  const { showNotification } = useNotification();
  const {
    clearVacaData,
    setMarcaData,
    clearAllMarcaData,
    setVacaData: setVacaDataContext,
  } = useVacaData();
  const { openModal } = useModal();
  const [vacaData, setVacaData] = useState<Vaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [lastApiFetch, setLastApiFetch] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Ref para controlar si ya se hizo la carga inicial
  const hasInitialized = useRef(false);

  // Actualizar el tiempo cada segundo para que el "última actualización" sea dinámico
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getVaca = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar vacas y marcas en paralelo
      const [vacas, marcas] = await Promise.all([
        VacaService.getVaca(),
        MarcaService.getTodasLasMarcas(),
      ]);

      // Almacenar todas las marcas en el contexto para evitar llamadas individuales
      marcas.forEach((marca) => {
        setMarcaData(marca);
      });

      setVacaData(vacas);
      setLastFetch(Date.now());
      setLastApiFetch(Date.now());
    } catch (error: any) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification, setMarcaData]);

  // Carga inicial de datos - solo se ejecuta una vez
  useEffect(() => {
    // Solo ejecutar si no se ha inicializado
    if (hasInitialized.current) {
      return;
    }

    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Cargar todo desde la API directamente (más simple y confiable)
        const [vacas, marcas] = await Promise.all([
          VacaService.getVaca(),
          MarcaService.getTodasLasMarcas(),
        ]);

        // Almacenar marcas en el contexto
        marcas.forEach((marca) => {
          setMarcaData(marca);
        });

        // Actualizar estado
        setVacaData(vacas);
        setLastFetch(Date.now());
        setLastApiFetch(Date.now());
      } catch (error: any) {
        showNotification("Error al cargar datos iniciales", "error");
      } finally {
        setLoading(false);
        hasInitialized.current = true;
      }
    };

    loadInitialData();
  }, []); // Sin dependencias - solo se ejecuta una vez

  const handleRefresh = () => {
    // Solo permitir refresh si no está cargando
    if (loading) return;

    // Limpiar el contexto para forzar recarga completa
    vacaData.forEach((vaca) => {
      clearVacaData(vaca.id);
    });

    clearAllMarcaData();

    // Resetear estados
    setVacaData([]);
    setLastFetch(null);
    setLastApiFetch(null);
    setLoading(true);

    // Marcar como no inicializado para permitir recarga
    hasInitialized.current = false;

    // Cargar datos frescos
    getVaca();
  };

  const handleAddVaca = () => {
    openModal({
      id: "add-vaca",
      title: "Gestión de Vacas",
      component: (
        <GestionVacasModal
          onVacaCreated={async (vacaCreada) => {
            try {
              // Agregar la nueva vaca al estado local
              setVacaData((prev) => [...prev, vacaCreada]);

              // Guardar la vaca en el contexto para que esté disponible en otras páginas
              setVacaDataContext(
                vacaCreada,
                [],
                "Propietario no disponible",
                [],
                Date.now()
              );

              // Actualizar el timestamp
              setLastFetch(Date.now());
              setLastApiFetch(Date.now());

              showNotification("Vaca creada exitosamente", "success");
            } catch (error) {
              showNotification("Error al procesar la vaca creada", "error");
            }
          }}
        />
      ),
      maxWidth: "md",
      fullWidth: true,
      onClose: () => {
        // No necesitamos hacer nada aquí ya que onVacaCreated maneja todo
      },
    });
  };

  const handleVacaUpdated = async (vacaActualizada: Vaca) => {
    try {
      // Actualizar la vaca en el estado local
      setVacaData((prev) =>
        prev.map((vaca) =>
          vaca.id === vacaActualizada.id ? vacaActualizada : vaca
        )
      );

      // Limpiar los datos de esta vaca del contexto para forzar recarga
      clearVacaData(vacaActualizada.id);

      // Actualizar el timestamp
      setLastFetch(Date.now());
      setLastApiFetch(Date.now());

      showNotification("Vaca actualizada correctamente", "success");
    } catch (error: any) {
      showNotification("Error al actualizar la vaca", "error");
    }
  };

  const formatLastUpdate = () => {
    // Usar el timestamp de la API, no del contexto
    const timestampToUse = lastApiFetch || lastFetch;

    if (!timestampToUse) return "Nunca";
    const diff = currentTime - timestampToUse;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Hace menos de 1 minuto";
    if (minutes === 1) return "Hace 1 minuto";
    if (minutes < 60) return `Hace ${minutes} minutos`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "Hace 1 hora";
    return `Hace ${hours} horas`;
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        {/* Header con información de última actualización */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Dashboard de Vacas
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: { xs: "none", md: "block" }, // Oculto en móviles/tablets, visible en desktop
              }}
            >
              Última actualización: {formatLastUpdate()}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                display: { xs: "none", sm: "flex", md: "flex" }, // Oculto en móviles/tablets, visible en desktop
              }}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <div>Cargando vacas...</div>
          </Box>
        ) : vacaData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay vacas registradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comienza agregando tu primera vaca usando el botón de abajo
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVaca}
              size="large"
            >
              Agregar Primera Vaca
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-start",
            }}
          >
            {vacaData.map((vaca) => (
              <VacaCard
                key={vaca.id}
                vaca={vaca}
                onVacaUpdated={handleVacaUpdated}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* Botón flotante para añadir vacas */}
      <Tooltip title="Añadir nueva vaca" placement="left">
        <Fab
          color="primary"
          aria-label="añadir vaca"
          onClick={handleAddVaca}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <ModalRenderer />
    </>
  );
}

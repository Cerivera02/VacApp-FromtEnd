import {
  Container,
  Box,
  Button,
  Typography,
  Fab,
  Tooltip,
} from "@mui/material";
import { Navbar } from "../components/navbar";
import { useEffect, useState, useCallback } from "react";
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
    getVacaData,
    clearVacaData,
    setMarcaData,
    clearAllMarcaData,
    setVacaData: setVacaDataContext,
    getAllMarcaData,
  } = useVacaData();
  const { openModal } = useModal();
  const [vacaData, setVacaData] = useState<Vaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [lastApiFetch, setLastApiFetch] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Actualizar el tiempo cada segundo para que el "última actualización" sea dinámico
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
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

  useEffect(() => {
    // Primero intentar recuperar datos del contexto
    if (vacaData.length === 0 && lastFetch === null) {
      const contextData = Array.from({ length: 100 }, (_, i) => {
        const data = getVacaData(i + 1);
        return data;
      }).filter(Boolean);

      // También recuperar las marcas del contexto
      const contextMarcas = getAllMarcaData();

      if (contextData.length > 0) {
        // Si hay datos en el contexto, usarlos
        const vacas = contextData.map((data) => data!.vaca);
        setVacaData(vacas as Vaca[]);

        // Usar el timestamp de la API del contexto si está disponible
        const apiTimestamp = contextData.find(
          (data) => data?.apiTimestamp
        )?.apiTimestamp;

        if (apiTimestamp) {
          setLastApiFetch(apiTimestamp);
          setLastFetch(apiTimestamp); // Usar el timestamp original, no el actual
        } else {
          setLastFetch(Date.now()); // Solo si no hay apiTimestamp
        }

        setLoading(false);
      } else if (contextMarcas.length > 0) {
        // Si solo hay marcas en el contexto, cargar solo las vacas desde la API
        // pero mantener las marcas del contexto
        VacaService.getVaca()
          .then((vacas) => {
            setVacaData(vacas);
            setLastFetch(Date.now());
            setLastApiFetch(Date.now());
            setLoading(false);
          })
          .catch((error: any) => {
            showNotification(error.message, "error");
            setLoading(false);
          });
      } else {
        // Si no hay datos en el contexto, cargar desde la API
        getVaca();
      }
    } else {
      setLoading(false);
    }
  }, [
    getVaca,
    vacaData.length,
    lastFetch,
    getVacaData,
    getAllMarcaData,
    showNotification,
  ]);

  const handleRefresh = () => {
    // Limpiar el contexto para forzar recarga completa

    // Limpiar todas las vacas del contexto
    vacaData.forEach((vaca) => {
      clearVacaData(vaca.id);
    });

    // Limpiar todas las marcas del contexto
    clearAllMarcaData();

    setVacaData([]);
    setLastFetch(null);
    setLastApiFetch(null);

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
              // Nota: setVacaData del contexto requiere enfermedades, propietario y vacunas
              // Por ahora solo guardamos la vaca básica
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

              // Refrescar los datos del backend para asegurar sincronización completa
              await getVaca();
            } catch (error) {
              console.error("Error al procesar la vaca creada:", error);
              // Si falla el procesamiento, refrescar para mostrar estado real
              await getVaca();
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
    console.log("🔄 Vaca actualizada en Dashboard:", vacaActualizada);

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

      // Refrescar los datos del backend para asegurar sincronización completa
      await getVaca();

      showNotification("Vaca actualizada correctamente", "success");
    } catch (error: any) {
      console.error("Error al procesar la vaca actualizada:", error);
      showNotification("Error al actualizar la vaca", "error");
      // Si falla el procesamiento, refrescar para mostrar estado real
      await getVaca();
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

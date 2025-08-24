import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import type { Vaca, Enfermedad, Vacuna } from "../types/interfaces";
import { EnfermedadesService } from "../services/enfermedadesService";
import { VacunasService } from "../services/vacunasService";
import { useNotification } from "../contexts/NotificationContext";
import { useVacaData } from "../contexts/VacaDataContext";
import { useModal } from "../contexts/ModalContext";
import { useMarcas } from "../hooks/useMarcas";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditVacaModal } from "./EditVacaModal";
import { useUserData } from "../contexts/UserDataContext";

export const VacaCard = ({
  vaca,
  onVacaUpdated,
}: {
  vaca: Vaca;
  onVacaUpdated?: (vaca: Vaca) => void;
}) => {
  const { showError } = useNotification();
  const { setVacaData, getVacaData } = useVacaData();
  const { getMarcaPropietario } = useMarcas();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { hasPermission } = useUserData();
  const [enfermedades, setEnfermedades] = useState<Enfermedad[]>([]);
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [estadoSalud, setEstadoSalud] = useState<{
    estado: string;
    color: string;
  }>({
    estado: "Cargando...",
    color: "default",
  });
  const [propietario, setPropietario] = useState<string>("Cargando...");

  useEffect(() => {
    const loadData = async () => {
      // PRIMERO: Verificar si ya tenemos datos en el contexto
      const contextData = getVacaData(vaca.id);

      if (contextData) {
        // ✅ DATOS ENCONTRADOS EN CONTEXTO - Usar inmediatamente
        setEnfermedades(contextData.enfermedades);
        setVacunas(contextData.vacunas || []);
        setPropietario(contextData.propietario);
        setEstadoSalud(getEstadoSaludVaca(contextData.enfermedades));
      } else {
        // ❌ NO HAY DATOS EN CONTEXTO - Cargar desde API
        try {
          const [enfermedadesData, vacunasData, marcaPropietario] =
            await Promise.all([
              EnfermedadesService.getEnfermedades(vaca.id),
              VacunasService.getVacunas(vaca.id),
              getMarcaPropietario(vaca.marca_herrar_id),
            ]);

          setEnfermedades(enfermedadesData);
          setVacunas(vacunasData);
          setPropietario(marcaPropietario);

          const estado = getEstadoSaludVaca(enfermedadesData);
          setEstadoSalud(estado);

          // Guardar en el contexto para futuras visitas
          setVacaData(
            vaca,
            enfermedadesData,
            marcaPropietario,
            vacunasData,
            Date.now()
          );
        } catch (error: any) {
          showError(error.message || "Error al obtener datos");
          setEstadoSalud({ estado: "Error", color: "default" });
        }
      }
    };

    loadData();
  }, [
    vaca.id,
    vaca.marca_herrar_id,
    getVacaData,
    setVacaData,
    getMarcaPropietario,
    showError,
  ]);

  const getEstadoSaludVaca = (
    enfermedades: Enfermedad[]
  ): { estado: string; color: string } => {
    if (!enfermedades || enfermedades.length === 0) {
      return { estado: "Saludable", color: "success" };
    }

    const enfermedadesOrdenadas = enfermedades.sort((a, b) => {
      const fechaA = new Date(a.fecha_diagnostico || 0).getTime();
      const fechaB = new Date(b.fecha_diagnostico || 0).getTime();
      return fechaB - fechaA; // Descendente (más reciente primero)
    });

    const enfermedadReciente = enfermedadesOrdenadas[0];

    switch (enfermedadReciente.estado) {
      case "activa":
        return { estado: "Enferma", color: "error" };
      case "curada":
        return { estado: "Saludable", color: "success" };
      case "cronica":
        return { estado: "Saludable", color: "success" }; // Crónica = saludable (estable)
      case "en_tratamiento":
        return { estado: "En Observación", color: "warning" };
      default:
        return { estado: "Estado Desconocido", color: "default" };
    }
  };

  const calcularEdad = (fechaNacimiento: string): string => {
    try {
      const fechaNac = new Date(fechaNacimiento);
      const fechaActual = new Date();
      if (isNaN(fechaNac.getTime())) {
        return "Fecha inválida";
      }

      if (fechaNac > fechaActual) {
        return "Fecha futura";
      }

      const diferenciaMs = fechaActual.getTime() - fechaNac.getTime();

      const años = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24 * 365.25));
      const mesesRestantes = Math.floor(
        (diferenciaMs % (1000 * 60 * 60 * 24 * 365.25)) /
          (1000 * 60 * 60 * 24 * 30.44)
      );

      if (años === 0) {
        return `${mesesRestantes} mes${mesesRestantes !== 1 ? "es" : ""}`;
      } else if (mesesRestantes === 0) {
        return `${años} año${años !== 1 ? "s" : ""}`;
      } else {
        return `${años} año${años !== 1 ? "s" : ""} y ${mesesRestantes} mes${
          mesesRestantes !== 1 ? "es" : ""
        }`;
      }
    } catch (error) {
      return "Error al calcular edad";
    }
  };

  const handleViewDetails = () => {
    // Guardar datos actuales antes de navegar
    setVacaData(vaca, enfermedades, propietario, vacunas, Date.now());
    navigate(`/vaca/${vaca.id}/detalles`);
  };

  const handleEditVaca = () => {
    // Abrir modal de edición directamente
    openModal({
      id: "edit-vaca",
      title: "Editar Información General",
      component: (
        <EditVacaModal
          vaca={vaca}
          onVacaUpdated={(vacaActualizada) => {
            // Llamar a la función del componente padre si existe
            if (onVacaUpdated) {
              onVacaUpdated(vacaActualizada);
            }
          }}
        />
      ),
      maxWidth: "md",
      fullWidth: true,
    });
  };

  return (
    <Card
      key={vaca.id}
      sx={{
        boxShadow: 2,
        width: {
          xs: "100%", // 0-600px: 1 columna
          sm: "calc(50% - 16px)", // 600-900px: 2 columnas
          md: "calc(50% - 16px)", // 900-1200px: 2 columnas (evita espacio vacío)
          lg: "calc(35% - 32px)", // 1200px+: 3 columnas
        },
        flex: "0 0 auto", // Evita que las cards se estiren
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h5" color="primary" fontWeight="bold">
            Vaca #{vaca.no_arete}
          </Typography>
          <Chip
            label={estadoSalud.estado}
            color={estadoSalud.color as any}
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información Básica
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Nombre:</strong> {vaca.nombre || "No especificado"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Propietario:</strong> {propietario || "No especificado"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Color:</strong> {vaca.color || "No especificado"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Pariciones:</strong> {vaca.pariciones || "0"}
              </Typography>
              {vaca.pariciones && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ultima Paricion:</strong>{" "}
                  {vaca.ultima_paricion
                    ? new Date(vaca.ultima_paricion).toLocaleDateString("es-ES")
                    : "No registrado"}
                </Typography>
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información Adicional
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {vaca.fecha_nacimiento
                  ? new Date(vaca.fecha_nacimiento).toLocaleDateString("es-ES")
                  : "No registrado"}
              </Typography>

              {vaca.fecha_nacimiento && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Edad:</strong>{" "}
                  {calcularEdad(vaca.fecha_nacimiento.toString())}
                </Typography>
              )}

              {enfermedades.length > 0 && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Enfermedades:</strong>{" "}
                  {enfermedades
                    .filter((enfermedad) => enfermedad.estado === "activa")
                    .map((enfermedad) => enfermedad.nombre_enfermedad)
                    .join(", ") || "Ninguna"}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Descripción:</strong>{" "}
                {vaca.descripcion || "Sin descripción"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
            pt: 2,
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
          }}
        >
          {hasPermission("edit_vaca") && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => handleEditVaca()}
            >
              Editar
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={handleViewDetails}
          >
            Ver Detalles
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

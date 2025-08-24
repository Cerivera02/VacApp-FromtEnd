import {
  Button,
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Fab,
  Tooltip,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Navbar } from "../components/navbar";
import { useParams, useNavigate } from "react-router-dom";
import { useVacaData } from "../contexts/VacaDataContext";
import { VacaService } from "../services/vacaService";
import { EnfermedadesService } from "../services/enfermedadesService";
import { useMarcas } from "../hooks/useMarcas";
import { useNotification } from "../contexts/NotificationContext";
import { useState, useEffect } from "react";
import type { Vaca, Enfermedad, Vacuna } from "../types/interfaces";
import { VacunasService } from "../services/vacunasService";
import { Edit as EditIcon } from "@mui/icons-material";
import { useUserData } from "../contexts/UserDataContext";
import { useModal } from "../contexts/ModalContext";
import { GestionDetallesModal } from "../components/GestionVacasModal";
import { EditVacaModal } from "../components/EditVacaModal";
import { EditEnfermedadModal } from "../components/EditEnfermedadModal";
import { EditVacunaModal } from "../components/EditVacunaModal";
import { Add as AddIcon } from "@mui/icons-material";
import { ModalRenderer } from "../components/ModalRenderer";

export const VacaDetallesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVacaData, removeEnfermedades, removeVacunas, setVacaData } =
    useVacaData();
  const { getMarcaPropietario } = useMarcas();
  const { showNotification } = useNotification();
  const { hasPermission } = useUserData();
  const { openModal } = useModal();

  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [enfermedades, setEnfermedades] = useState<Enfermedad[]>([]);
  const [propietario, setPropietario] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [selectedEnfermedades, setSelectedEnfermedades] = useState<number[]>(
    []
  );
  const [selectedVacunas, setSelectedVacunas] = useState<number[]>([]);
  const [deletingEnfermedades, setDeletingEnfermedades] = useState(false);
  const [deletingVacunas, setDeletingVacunas] = useState(false);

  const loadVacaData = async (forceRefresh: boolean = false) => {
    if (!id) return;

    const vacaId = parseInt(id);

    if (!forceRefresh) {
      const contextData = getVacaData(vacaId);
      if (contextData) {
        setVaca(contextData.vaca);
        setEnfermedades(contextData.enfermedades);
        setPropietario(contextData.propietario);
        setVacunas(contextData.vacunas || []);
        setLoading(false);
        return;
      }
    }
    try {
      const [vacaData, enfermedadesData, vacunasData] = await Promise.all([
        VacaService.getVacaById(vacaId),
        EnfermedadesService.getEnfermedades(vacaId),
        VacunasService.getVacunas(vacaId),
      ]);

      const marcaPropietario = await getMarcaPropietario(
        vacaData.marca_herrar_id
      );

      setVaca(vacaData);
      setEnfermedades(enfermedadesData);
      setPropietario(marcaPropietario);
      setVacunas(vacunasData);

      // Guardar en el contexto para futuras visitas (sin recargar)
      setVacaData(
        vacaData,
        enfermedadesData,
        marcaPropietario,
        vacunasData,
        Date.now()
      );
    } catch (error: any) {
      showNotification(
        error.message || "Error al cargar datos de la vaca",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacaData();
  }, [id]);

  // Detectar F5 (refresh de página) y forzar recarga
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Cuando se hace F5, forzar refresh en la próxima carga
      sessionStorage.setItem("forceRefresh", "true");
    };

    const handleLoad = () => {
      const shouldForceRefresh =
        sessionStorage.getItem("forceRefresh") === "true";
      if (shouldForceRefresh) {
        sessionStorage.removeItem("forceRefresh");
        loadVacaData(true); // Force refresh
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography>Cargando datos de la vaca...</Typography>
        </Container>
      </>
    );
  }

  if (!vaca) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Typography variant="h6" color="error">
            No se encontró la vaca
          </Typography>
          <Button onClick={() => navigate(-1)}>← Volver</Button>
        </Container>
      </>
    );
  }

  const handleEditEnfermedad = (enfermedad: Enfermedad) => {
    openModal({
      id: "edit-enfermedad",
      title: "Editar Enfermedad",
      component: (
        <EditEnfermedadModal
          enfermedad={enfermedad}
          onEnfermedadUpdated={(enfermedadActualizada: Enfermedad) => {
            // Actualizar la enfermedad en el estado local
            setEnfermedades((prev) =>
              prev.map((e) =>
                e.id === enfermedadActualizada.id ? enfermedadActualizada : e
              )
            );
            // También actualizar en el contexto
            if (id && vaca) {
              const vacaId = parseInt(id);
              const contextData = getVacaData(vacaId);
              if (contextData) {
                const enfermedadesActualizadas = contextData.enfermedades.map(
                  (e) =>
                    e.id === enfermedadActualizada.id
                      ? enfermedadActualizada
                      : e
                );
                setVacaData(
                  contextData.vaca,
                  enfermedadesActualizadas,
                  contextData.propietario,
                  contextData.vacunas,
                  Date.now()
                );
              }
            }
            showNotification("Enfermedad actualizada exitosamente", "success");
          }}
        />
      ),
      maxWidth: "sm",
      fullWidth: true,
    });
  };

  const handleEditVacuna = (vacuna: Vacuna) => {
    openModal({
      id: "edit-vacuna",
      title: "Editar Vacuna",
      component: (
        <EditVacunaModal
          vacuna={vacuna}
          onVacunaUpdated={(vacunaActualizada: Vacuna) => {
            // Actualizar la vacuna en el estado local
            setVacunas((prev) =>
              prev.map((v) =>
                v.id === vacunaActualizada.id ? vacunaActualizada : v
              )
            );
            // También actualizar en el contexto
            if (id && vaca) {
              const vacaId = parseInt(id);
              const contextData = getVacaData(vacaId);
              if (contextData) {
                const vacunasActualizadas = contextData.vacunas.map((v) =>
                  v.id === vacunaActualizada.id ? vacunaActualizada : v
                );
                setVacaData(
                  contextData.vaca,
                  contextData.enfermedades,
                  contextData.propietario,
                  vacunasActualizadas,
                  Date.now()
                );
              }
            }
            showNotification("Vacuna actualizada exitosamente", "success");
          }}
        />
      ),
      maxWidth: "sm",
      fullWidth: true,
    });
  };

  const handleRefreshVacaData = () => {
    loadVacaData(true); // Forzar recarga desde API
  };

  const handleOpenGestionModal = () => {
    if (id) {
      openModal({
        id: "gestion-detalles",
        title: "Gestión de Enfermedades y Vacunas",
        component: (
          <GestionDetallesModal
            vacaId={parseInt(id)}
            onHistorialUpdated={handleRefreshVacaData}
          />
        ),
        maxWidth: "md",
        fullWidth: true,
      });
    }
  };

  const handleVacaUpdated = (vacaActualizada: Vaca) => {
    setVaca(vacaActualizada);

    loadVacaData(true);
  };

  const handleOpenEditModal = () => {
    if (vaca) {
      openModal({
        id: "edit-vaca",
        title: "Editar Información General",
        component: (
          <EditVacaModal vaca={vaca} onVacaUpdated={handleVacaUpdated} />
        ),
        maxWidth: "md",
        fullWidth: true,
      });
    }
  };

  const handleSelectEnfermedad = (enfermedadId: number) => {
    setSelectedEnfermedades((prev) =>
      prev.includes(enfermedadId)
        ? prev.filter((id) => id !== enfermedadId)
        : [...prev, enfermedadId]
    );
  };

  const handleSelectVacuna = (vacunaId: number) => {
    setSelectedVacunas((prev) =>
      prev.includes(vacunaId)
        ? prev.filter((id) => id !== vacunaId)
        : [...prev, vacunaId]
    );
  };

  const handleDeleteSelectedEnfermedades = async () => {
    if (selectedEnfermedades.length === 0) return;

    try {
      setDeletingEnfermedades(true);

      // ✅ Llamar al servicio del backend para eliminar
      await EnfermedadesService.deleteEnfermedades(selectedEnfermedades);

      // Actualizar el contexto localmente
      if (id) {
        const vacaId = parseInt(id);
        removeEnfermedades(vacaId, selectedEnfermedades);

        // Actualizar el estado local
        setEnfermedades((prev) =>
          prev.filter(
            (enfermedad) => !selectedEnfermedades.includes(enfermedad.id || 0)
          )
        );
      }

      showNotification(
        `${selectedEnfermedades.length} enfermedad(es) eliminada(s) exitosamente`,
        "success"
      );
      setSelectedEnfermedades([]);
    } catch (error: any) {
      showNotification(
        error.message || "Error al eliminar enfermedades",
        "error"
      );
    } finally {
      setDeletingEnfermedades(false);
    }
  };

  const handleDeleteSelectedVacunas = async () => {
    if (selectedVacunas.length === 0) return;

    try {
      setDeletingVacunas(true);

      // ✅ Llamar al servicio del backend para eliminar
      await VacunasService.deleteVacunas(selectedVacunas);

      // Actualizar el contexto localmente
      if (id) {
        const vacaId = parseInt(id);
        removeVacunas(vacaId, selectedVacunas);

        // Actualizar el estado local
        setVacunas((prev) =>
          prev.filter((vacuna) => !selectedVacunas.includes(vacuna.id || 0))
        );
      }

      showNotification(
        `${selectedVacunas.length} vacuna(s) eliminada(s) exitosamente`,
        "success"
      );
      setSelectedVacunas([]);
    } catch (error: any) {
      showNotification(error.message || "Error al eliminar vacunas", "error");
    } finally {
      setDeletingVacunas(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          ← Volver
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h4">No. Arete: {vaca.no_arete}</Typography>
        </Box>

        {/* Aquí puedes mostrar toda la información detallada */}
        <Box>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" color="primary">
                Información General
              </Typography>
              {hasPermission("edit_vaca") && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditModal}
                  sx={{ minWidth: "auto" }}
                >
                  Editar
                </Button>
              )}
            </Box>
            <Typography>
              <strong>Nombre:</strong> {vaca.nombre || "No especificado"}
            </Typography>
            <Typography>
              <strong>Propietario:</strong> {propietario}
            </Typography>
            <Typography>
              <strong>Color:</strong> {vaca.color || "No especificado"}
            </Typography>
            <Typography>
              <strong>Pariciones:</strong> {vaca.pariciones || "0"}
            </Typography>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="enfermedades-content"
              id="enfermedades-header"
            >
              <Typography component="span" variant="h6" color="primary">
                Enfermedades
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {enfermedades.length > 0 ? (
                <>
                  {/* Botón de borrado para enfermedades seleccionadas */}
                  {selectedEnfermedades.length > 0 &&
                    hasPermission("delete_enfermedades") && (
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={handleDeleteSelectedEnfermedades}
                          disabled={deletingEnfermedades}
                          sx={{ minWidth: 120 }}
                        >
                          {deletingEnfermedades ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            `Eliminar ${selectedEnfermedades.length} seleccionada(s)`
                          )}
                        </Button>
                      </Box>
                    )}

                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            {hasPermission("delete_enfermedades") && (
                              <Checkbox
                                indeterminate={
                                  selectedEnfermedades.length > 0 &&
                                  selectedEnfermedades.length <
                                    enfermedades.length
                                }
                                checked={
                                  enfermedades.length > 0 &&
                                  selectedEnfermedades.length ===
                                    enfermedades.length
                                }
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setSelectedEnfermedades(
                                      enfermedades
                                        .map((e) => e.id)
                                        .filter(
                                          (id): id is number => id !== undefined
                                        )
                                    );
                                  } else {
                                    setSelectedEnfermedades([]);
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Enfermedad
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Estado
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Fecha Diagnóstico
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Observaciones
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enfermedades.map((enfermedad, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell padding="checkbox">
                              {hasPermission("delete_enfermedades") && (
                                <Checkbox
                                  checked={
                                    enfermedad.id
                                      ? selectedEnfermedades.includes(
                                          enfermedad.id
                                        )
                                      : false
                                  }
                                  onChange={() =>
                                    enfermedad.id &&
                                    handleSelectEnfermedad(enfermedad.id)
                                  }
                                />
                              )}
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {enfermedad.nombre_enfermedad}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  enfermedad.estado
                                    .toString()
                                    .replace("_", " ")
                                    .charAt(0)
                                    .toUpperCase() +
                                  enfermedad.estado
                                    .toString()
                                    .replace("_", " ")
                                    .slice(1)
                                }
                                color={
                                  enfermedad.estado === "activa"
                                    ? "error"
                                    : enfermedad.estado === "curada"
                                    ? "success"
                                    : enfermedad.estado === "en_tratamiento"
                                    ? "warning"
                                    : "default"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {enfermedad.fecha_diagnostico
                                ? new Date(
                                    enfermedad.fecha_diagnostico
                                  ).toLocaleDateString("es-ES")
                                : "No especificada"}
                            </TableCell>

                            <TableCell align="center">
                              {enfermedad.observaciones || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {hasPermission("edit_enfermedades") && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<EditIcon />}
                                  onClick={() =>
                                    handleEditEnfermedad(enfermedad)
                                  }
                                >
                                  Editar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography color="success.main">
                  No tiene enfermedades registradas
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Sección de Vacunas */}
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="vacunas-content"
              id="vacunas-header"
            >
              <Typography component="span" variant="h6" color="primary">
                Vacunas
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {vacunas.length > 0 ? (
                <>
                  {/* Botón de borrado para vacunas seleccionadas */}
                  {selectedVacunas.length > 0 &&
                    hasPermission("delete_vacunas") && (
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={handleDeleteSelectedVacunas}
                          disabled={deletingVacunas}
                          sx={{ minWidth: 120 }}
                        >
                          {deletingVacunas ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            `Eliminar ${selectedVacunas.length} seleccionada(s)`
                          )}
                        </Button>
                      </Box>
                    )}

                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="vacunas table">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            {hasPermission("delete_vacunas") && (
                              <Checkbox
                                indeterminate={
                                  selectedVacunas.length > 0 &&
                                  selectedVacunas.length < vacunas.length
                                }
                                checked={
                                  vacunas.length > 0 &&
                                  selectedVacunas.length === vacunas.length
                                }
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setSelectedVacunas(
                                      vacunas
                                        .map((v) => v.id)
                                        .filter(
                                          (id): id is number => id !== undefined
                                        )
                                    );
                                  } else {
                                    setSelectedVacunas([]);
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Vacuna
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Fecha Aplicación
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Fecha Vencimiento
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Observaciones
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vacunas.map((vacuna, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell padding="checkbox">
                              {hasPermission("delete_vacunas") && (
                                <Checkbox
                                  checked={
                                    vacuna.id
                                      ? selectedVacunas.includes(vacuna.id)
                                      : false
                                  }
                                  onChange={() =>
                                    vacuna.id && handleSelectVacuna(vacuna.id)
                                  }
                                />
                              )}
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {vacuna.nombre_vacuna || "Vacuna"}
                            </TableCell>
                            <TableCell align="center">
                              {vacuna.fecha_aplicacion
                                ? new Date(
                                    vacuna.fecha_aplicacion
                                  ).toLocaleDateString("es-ES")
                                : "No especificada"}
                            </TableCell>
                            <TableCell align="center">
                              {vacuna.fecha_vencimiento
                                ? new Date(
                                    vacuna.fecha_vencimiento
                                  ).toLocaleDateString("es-ES")
                                : "No especificada"}
                            </TableCell>
                            <TableCell align="center">
                              {vacuna.observaciones || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {hasPermission("edit_vacunas") && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditVacuna(vacuna)}
                                >
                                  Editar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography color="info.main">
                  No tiene vacunas registradas
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      {/* FAB flotante para gestión */}
      <Tooltip title="Gestión de Enfermedades y Vacunas">
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenGestionModal}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <ModalRenderer />
    </>
  );
};

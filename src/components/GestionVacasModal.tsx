import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useState, useEffect } from "react";
import { VacaService } from "../services/vacaService";
import { EnfermedadesService } from "../services/enfermedadesService";
import { VacunasService } from "../services/vacunasService";
import { useNotification } from "../contexts/NotificationContext";
import { useModal } from "../contexts/ModalContext";
import { useVacaData } from "../contexts/VacaDataContext";
import type {
  Vaca,
  Marca,
  EnfermedadMaestra,
  VacunaMaestra,
} from "../types/interfaces";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface GestionVacasModalProps {
  onVacaCreated: (vaca: Vaca) => void;
  vacaId?: number; // ID de la vaca para registrar en historial
}

interface GestionDetallesModalProps {
  vacaId: number; // ID de la vaca para registrar en historial (requerido)
  onHistorialUpdated?: () => void; // Callback para notificar actualizaciones del historial
}

export const GestionVacasModal = ({
  onVacaCreated,
  vacaId,
}: GestionVacasModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();
  const { getAllMarcaData, getVacaData } = useVacaData();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  // Form data para vaca
  const [vacaFormData, setVacaFormData] = useState({
    no_arete: "",
    nombre: "",
    fecha_nacimiento: "",
    color: "",
    pariciones: "",
    ultima_paricion: "",
    descripcion: "",
    marca_herrar_id: "",
  });

  // Form data para enfermedad/vacuna
  const [registroFormData, setRegistroFormData] = useState({
    tipo: "",
    nombre: "",
  });

  // Form data para historial
  const [historialFormData, setHistorialFormData] = useState({
    tipo: "",
    enfermedad_id: "",
    estado: "",
    observaciones: "",
    vacuna_id: "",
    fecha_aplicacion: "",
    fecha_vencimiento: "",
    observaciones_vacuna: "",
    vacaId: vacaId,
  });

  // Estados para las listas de enfermedades y vacunas
  const [enfermedades, setEnfermedades] = useState<EnfermedadMaestra[]>([]);
  const [vacunas, setVacunas] = useState<VacunaMaestra[]>([]);

  // Estado para las vacas disponibles
  const [vacas, setVacas] = useState<Vaca[]>([]);

  // Cargar las marcas disponibles desde el contexto
  useEffect(() => {
    const loadMarcasFromContext = async () => {
      try {
        const marcasDelContexto = getAllMarcaData();
        setMarcas(marcasDelContexto);
      } catch (error) {
        console.error("Error cargando marcas:", error);
        setMarcas([]);
      }
    };

    loadMarcasFromContext();
  }, [getAllMarcaData]);

  // Cargar enfermedades y vacunas disponibles
  useEffect(() => {
    const loadEnfermedadesYVacunas = async () => {
      try {
        const [enfermedadesData, vacunasData] = await Promise.all([
          EnfermedadesService.getAllEnfermedades(),
          VacunasService.getAllVacunas(),
        ]);
        setEnfermedades(enfermedadesData);
        setVacunas(vacunasData);
      } catch (error) {
        console.error("Error cargando enfermedades y vacunas:", error);
        setEnfermedades([]);
        setVacunas([]);
      }
    };

    loadEnfermedadesYVacunas();
  }, []);

  // Cargar vacas disponibles desde el contexto
  useEffect(() => {
    const loadVacasFromContext = () => {
      try {
        // Obtener todas las vacas del contexto (IDs del 1 al 100)
        const vacasDelContexto: Vaca[] = [];
        for (let i = 1; i <= 100; i++) {
          const data = getVacaData(i);
          if (data) {
            vacasDelContexto.push(data.vaca);
          }
        }
        setVacas(vacasDelContexto);
      } catch (error) {
        console.error("Error cargando vacas:", error);
        setVacas([]);
      }
    };

    loadVacasFromContext();
  }, [getVacaData]);

  // Actualizar el vacaId del estado local cuando cambien las props
  useEffect(() => {
    if (vacaId) {
      setHistorialFormData((prev) => ({ ...prev, vacaId }));
    }
  }, [vacaId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVacaChange = (field: string, value: string) => {
    setVacaFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegistroChange = (field: string, value: string) => {
    setRegistroFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHistorialChange = (field: string, value: string) => {
    setHistorialFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVacaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacaFormData.no_arete || !vacaFormData.marca_herrar_id) {
      showNotification(
        "El número de arete y el propietario son obligatorios",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const nuevaVaca: Omit<Vaca, "id"> = {
        marca_herrar_id: parseInt(vacaFormData.marca_herrar_id),
        rancho_id: 1,
        no_arete: parseInt(vacaFormData.no_arete),
        nombre: vacaFormData.nombre || undefined,
        fecha_nacimiento: vacaFormData.fecha_nacimiento
          ? new Date(vacaFormData.fecha_nacimiento)
          : undefined,
        color: vacaFormData.color || undefined,
        pariciones: vacaFormData.pariciones
          ? parseInt(vacaFormData.pariciones)
          : undefined,
        ultima_paricion: vacaFormData.ultima_paricion
          ? new Date(vacaFormData.ultima_paricion)
          : undefined,
        descripcion: vacaFormData.descripcion || undefined,
      };

      const vacaCreada = await VacaService.createVaca(nuevaVaca as Vaca);

      showNotification("Vaca creada exitosamente", "success");
      onVacaCreated(vacaCreada);
      closeModal("add-vaca");
    } catch (error: any) {
      showNotification(error.message || "Error al crear la vaca", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroFormData.tipo || !registroFormData.nombre) {
      showNotification("El tipo y nombre son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);

      if (registroFormData.tipo === "enfermedad") {
        await EnfermedadesService.createEnfermedad({
          nombre: registroFormData.nombre,
        });
        showNotification("Enfermedad creada exitosamente", "success");

        // Recargar la lista de enfermedades
        const enfermedadesData = await EnfermedadesService.getAllEnfermedades();
        setEnfermedades(enfermedadesData);

        closeModal("add-vaca");
      } else if (registroFormData.tipo === "vacuna") {
        await VacunasService.createVacuna({
          nombre: registroFormData.nombre,
        });
        showNotification("Vacuna creada exitosamente", "success");

        // Recargar la lista de vacunas
        const vacunasData = await VacunasService.getAllVacunas();
        setVacunas(vacunasData);

        closeModal("add-vaca");
      }

      // Limpiar el formulario
      setRegistroFormData({ tipo: "", nombre: "" });
    } catch (error: any) {
      showNotification(error.message || "Error al crear el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHistorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!historialFormData.tipo) {
      showNotification("Debes seleccionar un tipo", "error");
      return;
    }

    if (
      historialFormData.tipo === "enfermedad" &&
      !historialFormData.enfermedad_id
    ) {
      showNotification("Debes seleccionar una enfermedad", "error");
      return;
    }

    if (historialFormData.tipo === "vacuna") {
      if (!historialFormData.vacuna_id || !historialFormData.fecha_aplicacion) {
        showNotification(
          "Para vacunas debes completar la vacuna y fecha de aplicación",
          "error"
        );
        return;
      }
    }

    try {
      setLoading(true);

      // Usar el ID de la vaca del estado local o de las props
      const selectedVacaId = historialFormData.vacaId || vacaId;
      if (!selectedVacaId) {
        showNotification(
          "Debes seleccionar una vaca para registrar en el historial",
          "error"
        );
        return;
      }

      if (historialFormData.tipo === "enfermedad") {
        // Preparar el payload para enfermedad
        const enfermedadPayload: any = {
          enfermedad_id: parseInt(historialFormData.enfermedad_id),
        };

        // Solo agregar estado si no está vacío
        if (
          historialFormData.estado &&
          historialFormData.estado.trim() !== ""
        ) {
          enfermedadPayload.estado = historialFormData.estado;
        }

        // Solo agregar observaciones si no está vacío
        if (
          historialFormData.observaciones &&
          historialFormData.observaciones.trim() !== ""
        ) {
          enfermedadPayload.observaciones = historialFormData.observaciones;
        }

        await EnfermedadesService.addEnfermedadToVaca(
          selectedVacaId,
          enfermedadPayload
        );
        showNotification(
          "Enfermedad registrada en el historial exitosamente",
          "success"
        );
      } else if (historialFormData.tipo === "vacuna") {
        // Preparar el payload, solo incluir fecha_vencimiento si tiene valor
        const vacunaPayload: any = {
          vacuna_id: parseInt(historialFormData.vacuna_id),
          fecha_aplicacion: historialFormData.fecha_aplicacion,
        };

        // Solo agregar fecha_vencimiento si no está vacía
        if (
          historialFormData.fecha_vencimiento &&
          historialFormData.fecha_vencimiento.trim() !== ""
        ) {
          vacunaPayload.fecha_vencimiento = historialFormData.fecha_vencimiento;
        }

        // Solo agregar observaciones si no está vacía
        if (
          historialFormData.observaciones_vacuna &&
          historialFormData.observaciones_vacuna.trim() !== ""
        ) {
          vacunaPayload.observaciones = historialFormData.observaciones_vacuna;
        }

        await VacunasService.addVacunaToVaca(selectedVacaId, vacunaPayload);
        showNotification(
          "Vacuna registrada en el historial exitosamente",
          "success"
        );
      }

      // Limpiar el formulario
      setHistorialFormData({
        tipo: "",
        enfermedad_id: "",
        estado: "",
        observaciones: "",
        vacuna_id: "",
        fecha_aplicacion: "",
        fecha_vencimiento: "",
        observaciones_vacuna: "",
        vacaId: undefined,
      });

      // Cerrar el modal
      closeModal("add-vaca");
    } catch (error: any) {
      showNotification(
        error.message || "Error al registrar en el historial",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="gestión de vacas"
          sx={{
            "& .MuiTab-root": {
              minHeight: 48,
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "primary.main",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Crear Vaca" />
          <Tab label="Registro en Historial" />
          <Tab label="Registro de Enfermedad/Vacuna" />
        </Tabs>
      </Box>

      {/* Tab: Crear Vaca */}
      <TabPanel value={tabValue} index={0}>
        <Box component="form" onSubmit={handleVacaSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Completa la información de la nueva vaca
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Número de Arete *"
              value={vacaFormData.no_arete}
              onChange={(e) => handleVacaChange("no_arete", e.target.value)}
              required
              variant="outlined"
              type="number"
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Nombre"
              value={vacaFormData.nombre}
              onChange={(e) => handleVacaChange("nombre", e.target.value)}
              variant="outlined"
              placeholder="Nombre opcional de la vaca"
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Color"
                value={vacaFormData.color}
                onChange={(e) => handleVacaChange("color", e.target.value)}
                variant="outlined"
                placeholder="Color del pelaje"
              />

              <TextField
                fullWidth
                label="Pariciones"
                type="number"
                value={vacaFormData.pariciones}
                onChange={(e) => handleVacaChange("pariciones", e.target.value)}
                variant="outlined"
                placeholder="0"
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                value={vacaFormData.fecha_nacimiento}
                onChange={(e) =>
                  handleVacaChange("fecha_nacimiento", e.target.value)
                }
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Última Parición"
                type="date"
                value={vacaFormData.ultima_paricion}
                onChange={(e) =>
                  handleVacaChange("ultima_paricion", e.target.value)
                }
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControl fullWidth required error={marcas.length === 0}>
              <InputLabel>Propietario</InputLabel>
              {marcas.length > 0 ? (
                <Select
                  value={vacaFormData.marca_herrar_id}
                  label="Propietario"
                  onChange={(e) =>
                    handleVacaChange("marca_herrar_id", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Seleccionar propietario</em>
                  </MenuItem>
                  {marcas.map((marca) => (
                    <MenuItem key={marca.id} value={marca.id}>
                      {marca.propietario}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <TextField
                  fullWidth
                  label="Propietario"
                  value=""
                  disabled
                  error
                  helperText="No hay marcas disponibles. Debes cargar las marcas desde el Dashboard primero."
                  variant="outlined"
                />
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Descripción"
              value={vacaFormData.descripcion}
              onChange={(e) => handleVacaChange("descripcion", e.target.value)}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Observaciones adicionales"
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => closeModal("add-vaca")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || marcas.length === 0}
                title={
                  marcas.length === 0
                    ? "No se puede crear vaca sin marcas disponibles"
                    : ""
                }
              >
                {loading ? "Creando..." : "Crear Vaca"}
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab: Registro en Historial */}
      <TabPanel value={tabValue} index={1}>
        <Box component="form" onSubmit={handleHistorialSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registra una enfermedad o vacuna en el historial de una vaca
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Vaca</InputLabel>
              <Select
                value={historialFormData.vacaId?.toString() || ""}
                label="Vaca"
                onChange={(e) => {
                  // Actualizar el vacaId localmente para el formulario
                  const selectedVacaId = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  // Como no podemos modificar las props, usaremos un estado local
                  setHistorialFormData((prev) => ({
                    ...prev,
                    vacaId: selectedVacaId,
                  }));
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar vaca</em>
                </MenuItem>
                {vacas.map((vaca) => (
                  <MenuItem key={vaca.id} value={vaca.id}>
                    {vaca.no_arete} - {vaca.nombre || "Sin nombre"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={historialFormData.tipo}
                label="Tipo"
                onChange={(e) => handleHistorialChange("tipo", e.target.value)}
                disabled={!historialFormData.vacaId}
              >
                <MenuItem value="">
                  <em>Seleccionar tipo</em>
                </MenuItem>
                <MenuItem value="enfermedad">Enfermedad</MenuItem>
                <MenuItem value="vacuna">Vacuna</MenuItem>
              </Select>
            </FormControl>

            {/* Campo de enfermedad (solo visible si tipo = enfermedad) */}
            {historialFormData.tipo === "enfermedad" && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Enfermedad</InputLabel>
                  <Select
                    value={historialFormData.enfermedad_id}
                    label="Enfermedad"
                    onChange={(e) =>
                      handleHistorialChange("enfermedad_id", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar enfermedad</em>
                    </MenuItem>
                    {enfermedades.map((enfermedad) => (
                      <MenuItem key={enfermedad.id} value={enfermedad.id}>
                        {enfermedad.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={historialFormData.estado}
                    label="Estado"
                    onChange={(e) =>
                      handleHistorialChange("estado", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar estado (opcional)</em>
                    </MenuItem>
                    <MenuItem value="activa">Activa</MenuItem>
                    <MenuItem value="curada">Curada</MenuItem>
                    <MenuItem value="cronica">Crónica</MenuItem>
                    <MenuItem value="en_tratamiento">En tratamiento</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Observaciones"
                  value={historialFormData.observaciones}
                  onChange={(e) =>
                    handleHistorialChange("observaciones", e.target.value)
                  }
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre la enfermedad (opcional)"
                />
              </>
            )}

            {/* Campo de vacuna (solo visible si tipo = vacuna) */}
            {historialFormData.tipo === "vacuna" && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Vacuna</InputLabel>
                  <Select
                    value={historialFormData.vacuna_id}
                    label="Vacuna"
                    onChange={(e) =>
                      handleHistorialChange("vacuna_id", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar vacuna</em>
                    </MenuItem>
                    {vacunas.map((vacuna) => (
                      <MenuItem key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Fecha de Aplicación *"
                    type="date"
                    value={historialFormData.fecha_aplicacion}
                    onChange={(e) =>
                      handleHistorialChange("fecha_aplicacion", e.target.value)
                    }
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    label="Fecha de Vencimiento"
                    type="date"
                    value={historialFormData.fecha_vencimiento}
                    onChange={(e) =>
                      handleHistorialChange("fecha_vencimiento", e.target.value)
                    }
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Observaciones"
                  value={historialFormData.observaciones_vacuna}
                  onChange={(e) =>
                    handleHistorialChange(
                      "observaciones_vacuna",
                      e.target.value
                    )
                  }
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre la vacuna (opcional)"
                />
              </>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => closeModal("add-vaca")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !historialFormData.vacaId ||
                  !historialFormData.tipo ||
                  (historialFormData.tipo === "enfermedad" &&
                    !historialFormData.enfermedad_id) ||
                  (historialFormData.tipo === "vacuna" &&
                    (!historialFormData.vacuna_id ||
                      !historialFormData.fecha_aplicacion))
                }
              >
                {loading ? "Registrando..." : "Registrar en Historial"}
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab: Registro de Enfermedad/Vacuna */}
      <TabPanel value={tabValue} index={2}>
        <Box component="form" onSubmit={handleRegistroSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registra una nueva enfermedad o vacuna
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={registroFormData.tipo}
                label="Tipo"
                onChange={(e) => handleRegistroChange("tipo", e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccionar tipo</em>
                </MenuItem>
                <MenuItem value="enfermedad">Enfermedad</MenuItem>
                <MenuItem value="vacuna">Vacuna</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nombre *"
              value={registroFormData.nombre}
              onChange={(e) => handleRegistroChange("nombre", e.target.value)}
              required
              variant="outlined"
              placeholder="Nombre de la enfermedad o vacuna"
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => closeModal("add-vaca")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading || !registroFormData.tipo || !registroFormData.nombre
                }
              >
                {loading ? "Creando..." : "Crear Registro"}
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

// Modal específico para la pantalla de detalles (solo 2 tabs)
export const GestionDetallesModal = ({
  vacaId,
  onHistorialUpdated,
}: GestionDetallesModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();

  const [tabValue, setTabValue] = useState(0); // 0 = Registro en Historial, 1 = Registro de Enfermedad/Vacuna
  const [loading, setLoading] = useState(false);

  // Form data para enfermedad/vacuna
  const [registroFormData, setRegistroFormData] = useState({
    tipo: "",
    nombre: "",
  });

  // Form data para historial
  const [historialFormData, setHistorialFormData] = useState({
    tipo: "",
    enfermedad_id: "",
    estado: "",
    observaciones: "",
    vacuna_id: "",
    fecha_aplicacion: "",
    fecha_vencimiento: "",
    observaciones_vacuna: "",
  });

  // Estados para las listas de enfermedades y vacunas
  const [enfermedades, setEnfermedades] = useState<EnfermedadMaestra[]>([]);
  const [vacunas, setVacunas] = useState<VacunaMaestra[]>([]);

  // Cargar enfermedades y vacunas disponibles
  useEffect(() => {
    const loadEnfermedadesYVacunas = async () => {
      try {
        const [enfermedadesData, vacunasData] = await Promise.all([
          EnfermedadesService.getAllEnfermedades(),
          VacunasService.getAllVacunas(),
        ]);
        setEnfermedades(enfermedadesData);
        setVacunas(vacunasData);
      } catch (error) {
        console.error("Error cargando enfermedades y vacunas:", error);
        setEnfermedades([]);
        setVacunas([]);
      }
    };

    loadEnfermedadesYVacunas();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRegistroChange = (field: string, value: string) => {
    setRegistroFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHistorialChange = (field: string, value: string) => {
    setHistorialFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroFormData.tipo || !registroFormData.nombre) {
      showNotification("El tipo y nombre son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);

      if (registroFormData.tipo === "enfermedad") {
        await EnfermedadesService.createEnfermedad({
          nombre: registroFormData.nombre,
        });
        showNotification("Enfermedad creada exitosamente", "success");

        // Recargar la lista de enfermedades
        const enfermedadesData = await EnfermedadesService.getAllEnfermedades();
        setEnfermedades(enfermedadesData);

        closeModal("gestion-detalles");
      } else if (registroFormData.tipo === "vacuna") {
        await VacunasService.createVacuna({
          nombre: registroFormData.nombre,
        });
        showNotification("Vacuna creada exitosamente", "success");

        // Recargar la lista de vacunas
        const vacunasData = await VacunasService.getAllVacunas();
        setVacunas(vacunasData);

        closeModal("gestion-detalles");
      }

      // Limpiar el formulario
      setRegistroFormData({ tipo: "", nombre: "" });
    } catch (error: any) {
      showNotification(error.message || "Error al crear el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHistorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!historialFormData.tipo) {
      showNotification("Debes seleccionar un tipo", "error");
      return;
    }

    if (
      historialFormData.tipo === "enfermedad" &&
      !historialFormData.enfermedad_id
    ) {
      showNotification("Debes seleccionar una enfermedad", "error");
      return;
    }

    if (historialFormData.tipo === "vacuna") {
      if (!historialFormData.vacuna_id || !historialFormData.fecha_aplicacion) {
        showNotification(
          "Para vacunas debes completar la vacuna y fecha de aplicación",
          "error"
        );
        return;
      }
    }

    try {
      setLoading(true);

      if (historialFormData.tipo === "enfermedad") {
        // Preparar el payload para enfermedad
        const enfermedadPayload: any = {
          enfermedad_id: parseInt(historialFormData.enfermedad_id),
        };

        // Solo agregar estado si no está vacío
        if (
          historialFormData.estado &&
          historialFormData.estado.trim() !== ""
        ) {
          enfermedadPayload.estado = historialFormData.estado;
        }

        // Solo agregar observaciones si no está vacío
        if (
          historialFormData.observaciones &&
          historialFormData.observaciones.trim() !== ""
        ) {
          enfermedadPayload.observaciones = historialFormData.observaciones;
        }

        await EnfermedadesService.addEnfermedadToVaca(
          vacaId,
          enfermedadPayload
        );
        showNotification(
          "Enfermedad registrada en el historial exitosamente",
          "success"
        );
      } else if (historialFormData.tipo === "vacuna") {
        // Preparar el payload, solo incluir fecha_vencimiento si tiene valor
        const vacunaPayload: any = {
          vacuna_id: parseInt(historialFormData.vacuna_id),
          fecha_aplicacion: historialFormData.fecha_aplicacion,
        };

        // Solo agregar fecha_vencimiento si no está vacía
        if (
          historialFormData.fecha_vencimiento &&
          historialFormData.fecha_vencimiento.trim() !== ""
        ) {
          vacunaPayload.fecha_vencimiento = historialFormData.fecha_vencimiento;
        }

        // Solo agregar observaciones si no está vacía
        if (
          historialFormData.observaciones_vacuna &&
          historialFormData.observaciones_vacuna.trim() !== ""
        ) {
          vacunaPayload.observaciones = historialFormData.observaciones_vacuna;
        }

        await VacunasService.addVacunaToVaca(vacaId, vacunaPayload);
        showNotification(
          "Vacuna registrada en el historial exitosamente",
          "success"
        );
      }

      // Limpiar el formulario
      setHistorialFormData({
        tipo: "",
        enfermedad_id: "",
        estado: "",
        observaciones: "",
        vacuna_id: "",
        fecha_aplicacion: "",
        fecha_vencimiento: "",
        observaciones_vacuna: "",
      });

      // Notificar a la página padre para que actualice los datos
      if (onHistorialUpdated) {
        onHistorialUpdated();
      }

      // Cerrar el modal
      closeModal("gestion-detalles");
    } catch (error: any) {
      showNotification(
        error.message || "Error al registrar en el historial",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="gestión de detalles"
          sx={{
            "& .MuiTab-root": {
              minHeight: 48,
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "primary.main",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Registro en Historial" />
          <Tab label="Registro de Enfermedad/Vacuna" />
        </Tabs>
      </Box>

      {/* Tab: Registro en Historial */}
      <TabPanel value={tabValue} index={0}>
        <Box component="form" onSubmit={handleHistorialSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registra una enfermedad o vacuna en el historial de esta vaca
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={historialFormData.tipo}
                label="Tipo"
                onChange={(e) => handleHistorialChange("tipo", e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccionar tipo</em>
                </MenuItem>
                <MenuItem value="enfermedad">Enfermedad</MenuItem>
                <MenuItem value="vacuna">Vacuna</MenuItem>
              </Select>
            </FormControl>

            {/* Campo de enfermedad (solo visible si tipo = enfermedad) */}
            {historialFormData.tipo === "enfermedad" && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Enfermedad</InputLabel>
                  <Select
                    value={historialFormData.enfermedad_id}
                    label="Enfermedad"
                    onChange={(e) =>
                      handleHistorialChange("enfermedad_id", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar enfermedad</em>
                    </MenuItem>
                    {enfermedades.map((enfermedad) => (
                      <MenuItem key={enfermedad.id} value={enfermedad.id}>
                        {enfermedad.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={historialFormData.estado}
                    label="Estado"
                    onChange={(e) =>
                      handleHistorialChange("estado", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar estado (opcional)</em>
                    </MenuItem>
                    <MenuItem value="activa">Activa</MenuItem>
                    <MenuItem value="curada">Curada</MenuItem>
                    <MenuItem value="cronica">Crónica</MenuItem>
                    <MenuItem value="en_tratamiento">En tratamiento</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Observaciones"
                  value={historialFormData.observaciones}
                  onChange={(e) =>
                    handleHistorialChange("observaciones", e.target.value)
                  }
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre la enfermedad (opcional)"
                />
              </>
            )}

            {/* Campo de vacuna (solo visible si tipo = vacuna) */}
            {historialFormData.tipo === "vacuna" && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Vacuna</InputLabel>
                  <Select
                    value={historialFormData.vacuna_id}
                    label="Vacuna"
                    onChange={(e) =>
                      handleHistorialChange("vacuna_id", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Seleccionar vacuna</em>
                    </MenuItem>
                    {vacunas.map((vacuna) => (
                      <MenuItem key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Fecha de Aplicación *"
                    type="date"
                    value={historialFormData.fecha_aplicacion}
                    onChange={(e) =>
                      handleHistorialChange("fecha_aplicacion", e.target.value)
                    }
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    label="Fecha de Vencimiento"
                    type="date"
                    value={historialFormData.fecha_vencimiento}
                    onChange={(e) =>
                      handleHistorialChange("fecha_vencimiento", e.target.value)
                    }
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Observaciones"
                  value={historialFormData.observaciones_vacuna}
                  onChange={(e) =>
                    handleHistorialChange(
                      "observaciones_vacuna",
                      e.target.value
                    )
                  }
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Observaciones adicionales sobre la vacuna (opcional)"
                />
              </>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => closeModal("gestion-detalles")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !historialFormData.tipo ||
                  (historialFormData.tipo === "enfermedad" &&
                    !historialFormData.enfermedad_id) ||
                  (historialFormData.tipo === "vacuna" &&
                    (!historialFormData.vacuna_id ||
                      !historialFormData.fecha_aplicacion))
                }
              >
                {loading ? "Registrando..." : "Registrar en Historial"}
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab: Registro de Enfermedad/Vacuna */}
      <TabPanel value={tabValue} index={1}>
        <Box component="form" onSubmit={handleRegistroSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registra una nueva enfermedad o vacuna
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={registroFormData.tipo}
                label="Tipo"
                onChange={(e) => handleRegistroChange("tipo", e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccionar tipo</em>
                </MenuItem>
                <MenuItem value="enfermedad">Enfermedad</MenuItem>
                <MenuItem value="vacuna">Vacuna</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nombre *"
              value={registroFormData.nombre}
              onChange={(e) => handleRegistroChange("nombre", e.target.value)}
              required
              variant="outlined"
              placeholder="Nombre de la enfermedad o vacuna"
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => closeModal("gestion-detalles")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading || !registroFormData.tipo || !registroFormData.nombre
                }
              >
                {loading ? "Creando..." : "Crear Registro"}
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

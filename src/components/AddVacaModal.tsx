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
import type { Vaca, Marca } from "../types/interfaces";

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
}

export const GestionVacasModal = ({
  onVacaCreated,
}: GestionVacasModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();
  const { getAllMarcaData } = useVacaData();

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
      } else if (registroFormData.tipo === "vacuna") {
        await VacunasService.createVacuna({
          nombre: registroFormData.nombre,
        });
        showNotification("Vacuna creada exitosamente", "success");
      }

      // Limpiar el formulario
      setRegistroFormData({ tipo: "", nombre: "" });
    } catch (error: any) {
      showNotification(error.message || "Error al crear el registro", "error");
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
        >
          <Tab label="Crear Vaca" />
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

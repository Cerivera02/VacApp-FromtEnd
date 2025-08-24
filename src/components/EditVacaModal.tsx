import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { VacaService } from "../services/vacaService";
import { useNotification } from "../contexts/NotificationContext";
import { useModal } from "../contexts/ModalContext";
import { useVacaData } from "../contexts/VacaDataContext";
import type { Vaca, Marca } from "../types/interfaces";

interface EditVacaModalProps {
  vaca: Vaca;
  onVacaUpdated: (vaca: Vaca) => void; // Callback para notificar actualización de la vaca
}

// Modal específico para editar información general de la vaca
export const EditVacaModal = ({ vaca, onVacaUpdated }: EditVacaModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();
  const { getAllMarcaData } = useVacaData();

  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  // Form data para editar vaca
  const [editFormData, setEditFormData] = useState({
    marca_herrar_id: vaca.marca_herrar_id?.toString() || "",
    no_arete: vaca.no_arete?.toString() || "",
    nombre: vaca.nombre || "",
    fecha_nacimiento: vaca.fecha_nacimiento
      ? new Date(vaca.fecha_nacimiento).toISOString().split("T")[0]
      : "",
    color: vaca.color || "",
    pariciones: vaca.pariciones?.toString() || "",
    ultima_paricion: vaca.ultima_paricion
      ? new Date(vaca.ultima_paricion).toISOString().split("T")[0]
      : "",
    descripcion: vaca.descripcion || "",
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

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.no_arete || !editFormData.marca_herrar_id) {
      showNotification(
        "El número de arete y el propietario son obligatorios",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      // Función auxiliar para convertir cadenas vacías a undefined
      const emptyToUndefined = (value: string): string | undefined => {
        return value.trim() === "" ? undefined : value;
      };

      const updatedVacaData: Partial<Vaca> = {
        marca_herrar_id: parseInt(editFormData.marca_herrar_id),
        no_arete: parseInt(editFormData.no_arete),
        nombre: emptyToUndefined(editFormData.nombre),
        fecha_nacimiento: editFormData.fecha_nacimiento
          ? new Date(editFormData.fecha_nacimiento)
          : undefined,
        color: emptyToUndefined(editFormData.color),
        pariciones:
          editFormData.pariciones.trim() === ""
            ? undefined
            : parseInt(editFormData.pariciones),
        ultima_paricion: editFormData.ultima_paricion
          ? new Date(editFormData.ultima_paricion)
          : undefined,
        descripcion: emptyToUndefined(editFormData.descripcion),
      };

      console.log("Datos a enviar:", updatedVacaData);

      const vacaActualizada = await VacaService.updateVaca(
        vaca.id,
        updatedVacaData
      );

      showNotification("Vaca actualizada exitosamente", "success");
      onVacaUpdated(vacaActualizada);
      closeModal("edit-vaca");
    } catch (error: any) {
      showNotification(error.message || "Error al actualizar la vaca", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box component="form" onSubmit={handleEditSubmit}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Edita la información general de la vaca
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Número de Arete *"
            value={editFormData.no_arete}
            onChange={(e) => handleEditChange("no_arete", e.target.value)}
            required
            variant="outlined"
            type="number"
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            label="Nombre"
            value={editFormData.nombre}
            onChange={(e) => handleEditChange("nombre", e.target.value)}
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
              value={editFormData.color}
              onChange={(e) => handleEditChange("color", e.target.value)}
              variant="outlined"
              placeholder="Color del pelaje"
            />

            <TextField
              fullWidth
              label="Pariciones"
              type="number"
              value={editFormData.pariciones}
              onChange={(e) => handleEditChange("pariciones", e.target.value)}
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
              value={editFormData.fecha_nacimiento}
              onChange={(e) =>
                handleEditChange("fecha_nacimiento", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Última Parición"
              type="date"
              value={editFormData.ultima_paricion}
              onChange={(e) =>
                handleEditChange("ultima_paricion", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth required error={marcas.length === 0}>
            <InputLabel>Propietario</InputLabel>
            {marcas.length > 0 ? (
              <Select
                value={editFormData.marca_herrar_id}
                label="Propietario"
                onChange={(e) =>
                  handleEditChange("marca_herrar_id", e.target.value)
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
            value={editFormData.descripcion}
            onChange={(e) => handleEditChange("descripcion", e.target.value)}
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
              onClick={() => closeModal("edit-vaca")}
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
                  ? "No se puede editar vaca sin marcas disponibles"
                  : ""
              }
            >
              {loading ? "Actualizando..." : "Actualizar Vaca"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

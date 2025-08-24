import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useNotification } from "../contexts/NotificationContext";
import { useModal } from "../contexts/ModalContext";
import { EnfermedadesService } from "../services/enfermedadesService";
import type { Enfermedad, EnfermedadMaestra } from "../types/interfaces";
import { useUserData } from "../contexts/UserDataContext";

interface EditEnfermedadModalProps {
  enfermedad: Enfermedad;
  onEnfermedadUpdated: (enfermedad: Enfermedad) => void;
}

export const EditEnfermedadModal = ({
  enfermedad,
  onEnfermedadUpdated,
}: EditEnfermedadModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useUserData();
  const [enfermedades, setEnfermedades] = useState<EnfermedadMaestra[]>([]);

  console.log(
    "🚀 EditEnfermedadModal - Estado inicial de enfermedad:",
    enfermedad.estado
  );

  const [editFormData, setEditFormData] = useState({
    enfermedad_id: enfermedad.enfermedad_id.toString(),
    estado:
      enfermedad.estado && enfermedad.estado.toString().trim() !== ""
        ? enfermedad.estado.toString()
        : "Activa",
    fecha_diagnostico: enfermedad.fecha_diagnostico
      ? new Date(enfermedad.fecha_diagnostico).toISOString().split("T")[0]
      : "",
    observaciones: enfermedad.observaciones || "",
  });

  console.log("📝 Estado inicial de editFormData:", editFormData);

  // Cargar enfermedades disponibles
  useEffect(() => {
    const loadEnfermedades = async () => {
      try {
        const enfermedadesData = await EnfermedadesService.getAllEnfermedades();
        setEnfermedades(enfermedadesData);
      } catch (error: any) {
        showNotification(
          error.message || "Error al cargar enfermedades",
          "error"
        );
      }
    };

    loadEnfermedades();
  }, [showNotification]);

  // Validar y corregir el estado si es inválido
  useEffect(() => {
    console.log("🔍 Estado actual:", editFormData.estado);
    if (!editFormData.estado || editFormData.estado.trim() === "") {
      console.log("⚠️ Estado inválido detectado, estableciendo como 'Activa'");
      setEditFormData((prev) => ({
        ...prev,
        estado: "Activa",
      }));
    }
  }, [editFormData.estado]);

  const handleEditChange = (field: string, value: string) => {
    console.log(`🔄 Cambiando campo '${field}' a valor: '${value}'`);

    const newValue =
      field === "estado" && (!value || value.trim() === "") ? "Activa" : value;

    console.log(`✅ Nuevo valor para '${field}': '${newValue}'`);

    setEditFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.enfermedad_id || !editFormData.estado) {
      showNotification("La enfermedad y el estado son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);

      const enfermedadActualizada: Enfermedad = {
        ...enfermedad,
        enfermedad_id: parseInt(editFormData.enfermedad_id),
        nombre_enfermedad:
          enfermedades.find(
            (e) => e.id === parseInt(editFormData.enfermedad_id)
          )?.nombre || "",
        estado: editFormData.estado,
        fecha_diagnostico: editFormData.fecha_diagnostico
          ? new Date(editFormData.fecha_diagnostico)
          : undefined,
        observaciones: editFormData.observaciones || undefined,
      };

      console.log(enfermedadActualizada);

      if (!enfermedadActualizada.id) {
        showNotification("La enfermedad no tiene un ID válido", "error");
        return;
      } else {
        const response = await EnfermedadesService.updateEnfermedad(
          enfermedadActualizada.id,
          enfermedadActualizada
        );
      }

      showNotification("Enfermedad actualizada exitosamente", "success");
      onEnfermedadUpdated(enfermedadActualizada);
      closeModal("edit-enfermedad");
    } catch (error: any) {
      showNotification(
        error.message || "Error al actualizar la enfermedad",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => closeModal("edit-enfermedad")}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Editar Enfermedad
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Enfermedad</InputLabel>
              <Select
                value={editFormData.enfermedad_id}
                label="Enfermedad"
                onChange={(e) =>
                  handleEditChange("enfermedad_id", e.target.value)
                }
                disabled
              >
                {enfermedades.map((enfermedad) => (
                  <MenuItem key={enfermedad.id} value={enfermedad.id}>
                    {enfermedad.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Estado</InputLabel>
              <Select
                value={editFormData.estado}
                label="Estado"
                onChange={(e) => handleEditChange("estado", e.target.value)}
                disabled={!hasPermission("edit_enfermedades_status")}
              >
                <MenuItem value="activa">Activa</MenuItem>
                <MenuItem value="curada">Curada</MenuItem>
                <MenuItem value="en_tratamiento">En Tratamiento</MenuItem>
                <MenuItem value="cronica">Crónica</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha de Diagnóstico"
              type="date"
              value={editFormData.fecha_diagnostico}
              onChange={(e) =>
                handleEditChange("fecha_diagnostico", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              disabled={!hasPermission("edit_enfermedades_status")}
            />

            <TextField
              fullWidth
              label="Observaciones"
              value={editFormData.observaciones}
              onChange={(e) =>
                handleEditChange("observaciones", e.target.value)
              }
              variant="outlined"
              multiline
              rows={3}
              placeholder="Observaciones adicionales sobre la enfermedad"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => closeModal("edit-enfermedad")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

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
import { VacunasService } from "../services/vacunasService";
import type { Vacuna, VacunaMaestra } from "../types/interfaces";
import { useUserData } from "../contexts/UserDataContext";

interface EditVacunaModalProps {
  vacuna: Vacuna;
  onVacunaUpdated: (vacuna: Vacuna) => void;
}

export const EditVacunaModal = ({
  vacuna,
  onVacunaUpdated,
}: EditVacunaModalProps) => {
  const { showNotification } = useNotification();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [vacunas, setVacunas] = useState<VacunaMaestra[]>([]);
  const { hasPermission } = useUserData();

  const [editFormData, setEditFormData] = useState({
    vacuna_id: vacuna.vacuna_id.toString(),
    fecha_aplicacion: vacuna.fecha_aplicacion,
    fecha_vencimiento: vacuna.fecha_vencimiento
      ? new Date(vacuna.fecha_vencimiento).toISOString().split("T")[0]
      : "",
    observaciones: vacuna.observaciones || "",
  });

  // Cargar vacunas disponibles
  useEffect(() => {
    const loadVacunas = async () => {
      try {
        const vacunasData = await VacunasService.getAllVacunas();
        setVacunas(vacunasData);
      } catch (error: any) {
        showNotification(error.message || "Error al cargar vacunas", "error");
      }
    };

    loadVacunas();
  }, [showNotification]);

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.vacuna_id) {
      showNotification("La vacuna es obligatoria", "error");
      return;
    }

    try {
      setLoading(true);

      const vacunaActualizada: Vacuna = {
        ...vacuna,
        vacuna_id: parseInt(editFormData.vacuna_id),
        nombre_vacuna:
          vacunas.find((v) => v.id === parseInt(editFormData.vacuna_id))
            ?.nombre || "",
        fecha_aplicacion: editFormData.fecha_aplicacion,
        fecha_vencimiento: editFormData.fecha_vencimiento
          ? new Date(editFormData.fecha_vencimiento)
          : undefined,
        observaciones: editFormData.observaciones || undefined,
      };

      // Aquí deberías llamar al servicio para actualizar la vacuna
      await VacunasService.updateVacuna(vacuna.id, vacunaActualizada);

      showNotification("Vacuna actualizada exitosamente", "success");
      onVacunaUpdated(vacunaActualizada);
      closeModal("edit-vacuna");
    } catch (error: any) {
      showNotification(
        error.message || "Error al actualizar la vacuna",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => closeModal("edit-vacuna")}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Editar Vacuna
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Vacuna</InputLabel>
              <Select
                value={editFormData.vacuna_id}
                label="Vacuna"
                onChange={(e) => handleEditChange("vacuna_id", e.target.value)}
                disabled
              >
                {vacunas.map((vacuna) => (
                  <MenuItem key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha de Aplicación"
              type="date"
              value={editFormData.fecha_aplicacion}
              onChange={(e) =>
                handleEditChange("fecha_aplicacion", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              disabled={!hasPermission("edit_vacunas_status")}
            />

            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              type="date"
              value={editFormData.fecha_vencimiento}
              onChange={(e) =>
                handleEditChange("fecha_vencimiento", e.target.value)
              }
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              disabled={!hasPermission("edit_vacunas_status")}
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
              placeholder="Observaciones adicionales sobre la vacuna"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => closeModal("edit-vacuna")} disabled={loading}>
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

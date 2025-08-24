import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useModal } from "../contexts/ModalContext";

export const ModalRenderer: React.FC = () => {
  const { modals, closeModal } = useModal();

  return (
    <>
      {modals.map((modal) => (
        <Dialog
          key={modal.id}
          open={modal.isOpen}
          onClose={() => closeModal(modal.id)}
          maxWidth={modal.maxWidth || "sm"}
          fullWidth={modal.fullWidth || false}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          {/* Header del modal */}
          {modal.title && (
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {modal.title}
              <IconButton
                onClick={() => closeModal(modal.id)}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}

          {/* Contenido del modal */}
          <DialogContent sx={{ pt: modal.title ? 2 : 3 }}>
            {modal.component}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

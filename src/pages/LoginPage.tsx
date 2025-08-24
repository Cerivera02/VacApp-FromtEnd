import { useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Verificar si ya hay un usuario autenticado
    if (isAuthenticated()) {
      // Redirigir al dashboard si ya está autenticado
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!username || !password) {
      return;
    }

    await login(username, password);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 400,
          maxWidth: "90%",
          padding: 4,
          borderRadius: 3,
          backgroundColor: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <h1
            style={{
              margin: 0,
              color: "#333",
              fontSize: "2rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Bienvenido
          </h1>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "1rem",
            }}
          >
            Inicia sesión en tu cuenta
          </p>
        </Box>

        <TextField
          label="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "#667eea",
              },
            },
          }}
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "#667eea",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleLogin}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            textTransform: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
            },
          }}
        >
          Iniciar sesión
        </Button>
      </Box>
    </Box>
  );
}

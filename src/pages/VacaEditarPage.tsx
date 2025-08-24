import { Button, Container, Typography } from "@mui/material";
import { Navbar } from "../components/navbar";
import { useParams, useNavigate } from "react-router-dom";

export const VacaEditarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Container>
        <Button onClick={() => navigate(-1)}>← Volver</Button>
        <Typography variant="h4">Editar la Vaca #{id}</Typography>
      </Container>
    </>
  );
};

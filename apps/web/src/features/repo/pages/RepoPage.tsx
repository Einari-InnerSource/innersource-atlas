import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function RepoPage() {
  const { fullName } = useParams();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Repo</Typography>
      <Typography variant="body2" color="text.secondary">
        {fullName}
      </Typography>
    </Box>
  );
}

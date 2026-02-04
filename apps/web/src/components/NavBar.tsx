import {
  AppBar,
  Box,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTreeOutlinedIcon fontSize="small" />
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            InnerSource Atlas
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            color={isActive("/") ? "secondary" : "inherit"}
            startIcon={<HomeOutlinedIcon />}
          >
            Atlas
          </Button>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Global search (stub for now) */}
        <TextField
          size="small"
          placeholder="Search repos, systems, docs…"
          sx={{
            width: 380,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0,0,0,0.25)",
            },
          }}
          inputProps={{ "aria-label": "Search" }}
        />

        <Box sx={{ width: 8 }} />

        <IconButton
          color="inherit"
          aria-label="Home"
          component={RouterLink}
          to="/"
        >
          <HomeOutlinedIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

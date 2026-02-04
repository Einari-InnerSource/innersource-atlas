import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Navbar } from "../components/NavBar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

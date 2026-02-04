import { useState } from "react";
import { Box } from "@mui/material";
import { AtlasGraph } from "./AtlasGraph";
import { AtlasSidePanel } from "./AtlasSidePanel";
import type { AtlasNode } from "../atlasTypes";
import { SEED_NODES } from "../seed";

const RIGHT_PANEL_WIDTH = 380;

export function AtlasShell() {
  const [selected, setSelected] = useState<AtlasNode | null>(null);

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* Graph area */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AtlasGraph
          nodes={SEED_NODES}
          selected={selected}
          onSelect={setSelected}
        />
      </Box>

      {/* Side panel (no overlay, no fixed positioning) */}
      <Box
        sx={{
          width: RIGHT_PANEL_WIDTH,
          flexShrink: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          height: "100%",
          overflow: "auto",
        }}
      >
        <AtlasSidePanel node={selected} />
      </Box>
    </Box>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { AtlasGraph } from "./AtlasGraph";
import { AtlasSidePanel } from "./AtlasSidePanel";

import repoProfiles from "../mock/repo-profiles.json";
import type { RepoProfile } from "@innersource-atlas/types";
import { buildOwnershipGraph } from "../adapters/build-ownership-graph";
import { createOwnerMap } from "../adapters/create-owner-map";

const RIGHT_PANEL_WIDTH = 380;

export function AtlasShell() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const profiles = repoProfiles as RepoProfile[];

  const graph = buildOwnershipGraph(profiles);
  const ownerMap = createOwnerMap(profiles);

  const selectedNode = selectedId
    ? (graph.nodes.find((n) => n.id === selectedId) ?? null)
    : null;

  const repoById = useMemo(() => {
    const m: Record<string, RepoProfile> = {};
    for (const p of profiles) m[`repo:${p.owner}/${p.name}`] = p;
    return m;
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AtlasGraph
          graph={graph}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Box>

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
        <AtlasSidePanel
          node={selectedNode}
          graph={graph}
          ownerMap={ownerMap}
          repoById={repoById}
        />
      </Box>
    </Box>
  );
}

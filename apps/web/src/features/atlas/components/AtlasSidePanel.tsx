import { Box, Divider, Typography } from "@mui/material";
import type { AtlasNode } from "../atlasTypes";

export function AtlasSidePanel({ node }: { node: AtlasNode | null }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Selection
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Select a domain/system/repo in the atlas.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2">Ownership</Typography>
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2">Status</Typography>
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    </Box>
  );
}

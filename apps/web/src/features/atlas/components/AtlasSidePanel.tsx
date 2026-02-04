import { Box, Divider, Typography } from "@mui/material";
import type { AtlasGraph, AtlasNode } from "@innersource-atlas/types";

export function AtlasSidePanel({
  node,
  graph,
}: {
  node: AtlasNode | null;
  graph: AtlasGraph;
}) {
  const title =
    node?.type === "team"
      ? "Team"
      : node?.type === "repo"
        ? "Repository"
        : "Selection";

  const subtitle =
    node?.type === "team"
      ? node.label
      : node?.type === "repo"
        ? node.label
        : "Select a team or repo in the atlas.";

  // For teams: count outgoing edges from this team node
  const ownsCount =
    node?.type === "team"
      ? graph.edges.filter((e) => e.source === node.id).length
      : null;

  // For repos: parse owner/name from id convention repo:owner/name
  const repoRef =
    node?.type === "repo"
      ? (() => {
          const raw = node.id.startsWith("repo:") ? node.id.slice("repo:".length) : node.id;
          const [owner, name] = raw.split("/");
          return owner && name ? { owner, name } : null;
        })()
      : null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2">Ownership</Typography>

      {node?.type === "team" ? (
        <Typography variant="body2" color="text.secondary">
          Owns {ownsCount} repos
        </Typography>
      ) : node?.type === "repo" ? (
        <Typography variant="body2" color="text.secondary">
          {repoRef ? `Owner: ${repoRef.owner}` : "—"}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2">Status</Typography>
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    </Box>
  );
}

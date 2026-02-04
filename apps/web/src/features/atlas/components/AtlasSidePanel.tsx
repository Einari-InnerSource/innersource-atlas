import { Box, Divider, Typography } from "@mui/material";
import type {
  AtlasEdge,
  AtlasGraph,
  AtlasNode,
} from "@innersource-atlas/types";
import type { RepoOwnership } from "../adapters/create-owner-map";

function parseRepoFullNameFromRepoId(repoId: string): string | null {
  if (!repoId.startsWith("repo:")) return null;
  const fullName = repoId.slice("repo:".length);
  // should be "owner/name"
  return fullName.includes("/") ? fullName : null;
}

export function AtlasSidePanel({
  node,
  graph,
  ownerMap,
}: {
  node: AtlasNode | null;
  graph: AtlasGraph;
  ownerMap: Record<string, RepoOwnership>;
}) {
  const ownsCount =
    node?.type === "team"
      ? graph.edges.filter((e: AtlasEdge) => e.source === node.id).length
      : null;

  const ownership = node?.type === "repo" ? ownerMap[node.id] : null;

  const hasOwners =
    ownership && (ownership.teams.length > 0 || ownership.users.length > 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {node?.type === "team"
          ? "Team"
          : node?.type === "repo"
            ? "Repository"
            : "Selection"}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {node ? node.label : "Select a team or repo in the atlas."}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2">CODEOWNERS</Typography>

      {node?.type === "team" ? (
        <Typography variant="body2" color="text.secondary">
          Owns {ownsCount} repos
        </Typography>
      ) : node?.type === "repo" ? (
        ownership ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Source: {ownership.source}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Teams
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ownership.teams.length
                ? ownership.teams.map((t) => `@${t}`).join(", ")
                : "—"}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ownership.users.length
                ? ownership.users.map((u) => `@${u}`).join(", ")
                : "—"}
            </Typography>

            {!hasOwners && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No owners found in CODEOWNERS.
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No CODEOWNERS data for this repo.
          </Typography>
        )
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

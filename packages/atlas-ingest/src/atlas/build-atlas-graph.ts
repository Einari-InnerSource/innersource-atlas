import type {
  AtlasGraph,
  AtlasNode,
  AtlasEdge,
  RepoProfile,
} from "@innersource-atlas/types";

export function buildAtlasGraph(profiles: RepoProfile[]): AtlasGraph {
  const nodes = new Map<string, AtlasNode>();
  const edges: AtlasEdge[] = [];

  for (const p of profiles) {
    const repoId = `repo:${p.owner}/${p.name}`;

    nodes.set(repoId, {
      id: repoId,
      type: "repo",
      label: p.name,
    });

    for (const team of p.ownership.teams) {
      const teamId = `team:${team}`;

      if (!nodes.has(teamId)) {
        nodes.set(teamId, {
          id: teamId,
          type: "team",
          label: team,
        });
      }

      edges.push({
        id: `${teamId}->${repoId}`,
        source: teamId,
        target: repoId,
        type: "owns",
      });
    }
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}

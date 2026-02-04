import type { RepoProfile, AtlasGraph, AtlasNode, AtlasEdge } from "@innersource-atlas/types";

export function buildOwnershipGraph(profiles: RepoProfile[]): AtlasGraph {
  const nodes: AtlasNode[] = [];
  const edges: AtlasEdge[] = [];
  const seen = new Set<string>();

  const addNode = (n: AtlasNode) => {
    if (seen.has(n.id)) return;
    seen.add(n.id);
    nodes.push(n);
  };

  for (const p of profiles) {
    const repoId = `repo:${p.owner}/${p.name}`;

    addNode({
      id: repoId,
      type: "repo",
      label: `${p.owner}/${p.name}`,
    });

    for (const team of p.ownership.teams) {
      const teamId = `team:${team}`;

      addNode({
        id: teamId,
        type: "team",
        label: team,
      });

      edges.push({
        id: `${teamId}->${repoId}`,
        source: teamId,
        target: repoId,
        type: "owns",
      });
    }
  }

  return { nodes, edges };
}

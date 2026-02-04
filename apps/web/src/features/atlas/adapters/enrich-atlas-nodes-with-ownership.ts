import type { AtlasNode, RepoNode } from "../atlasTypes";
import type { RepoProfile } from "@innersource-atlas/types";
import { createOwnerMap } from "./create-owner-map";

export function enrichAtlasNodesWithOwnership(
  nodes: AtlasNode[],
  repoProfiles: RepoProfile[],
): AtlasNode[] {
  const ownershipByFullName = createOwnerMap(repoProfiles);

  return nodes.map((n) => {
    if (n.type !== "repo") return n;

    const repo = n as RepoNode;

    // We need owner + name to join. If owner is missing, we can’t enrich.
    if (!repo.owner) return repo;

    const key = `${repo.owner}/${repo.name}`;
    const ownership = ownershipByFullName[key];

    if (!ownership) return repo;

    // Minimal heuristic for now: has CODEOWNERS => reusable
    const reusable = ownership.source === "codeowners";

    return {
      ...repo,
      ownership,
      reusable: repo.reusable ?? reusable,
    };
  });
}

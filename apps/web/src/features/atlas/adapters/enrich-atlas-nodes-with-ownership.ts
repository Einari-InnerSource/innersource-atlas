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

    if (!repo.owner) return repo;

    const key = `${repo.owner}/${repo.name}`;
    const ownership = ownershipByFullName[key];

    if (!ownership) return repo;

    const reusable = ownership.source === "codeowners";

    return {
      ...repo,
      ownership,
      reusable: repo.reusable ?? reusable,
    };
  });
}

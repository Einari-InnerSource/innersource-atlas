import type { RepoProfile } from "@innersource-atlas/types";

export type RepoOwnership = RepoProfile["ownership"];

export function createOwnerMap(profiles: RepoProfile[]) {
  const map: Record<string, RepoOwnership> = {};

  for (const p of profiles) {
    map[`repo:${p.owner}/${p.name}`] = p.ownership;
  }

  return map;
}
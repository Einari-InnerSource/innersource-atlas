import type { RepoProfile } from "@innersource-atlas/types";

export type RepoOwnership = RepoProfile["ownership"];

export function createOwnerMap(profiles: RepoProfile[]) {
  const map: Record<string, RepoOwnership> = {};

  for (const p of profiles) {
    // key matches your repo node fields owner/name, or full_name if you store it
    map[`${p.owner}/${p.name}`] = p.ownership;
  }

  return map;
}

import type { AtlasNode } from "@innersource-atlas/types";
import { COL_LANG, COL_REPO, COL_TEAM, ROW_GAP, ROW_START } from "./constants";

export function layoutNodes(
  items: AtlasNode[],
): Record<string, { x: number; y: number }> {
  const languages = items.filter((n) => n.type === "language");
  const repos = items.filter((n) => n.type === "repo");
  const teams = items.filter((n) => n.type === "team");

  const pos: Record<string, { x: number; y: number }> = {};

  languages.forEach((n, i) => {
    pos[n.id] = { x: COL_LANG, y: ROW_START + i * ROW_GAP };
  });

  repos.forEach((n, i) => {
    pos[n.id] = { x: COL_REPO, y: ROW_START + i * ROW_GAP };
  });

  teams.forEach((n, i) => {
    pos[n.id] = { x: COL_TEAM, y: ROW_START + i * ROW_GAP };
  });

  return pos;
}

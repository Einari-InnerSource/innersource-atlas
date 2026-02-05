import type { AtlasEdge } from "@innersource-atlas/types";

export function connectedNodeIds(
  edges: AtlasEdge[],
  activeId: string,
): Set<string> {
  const s = new Set<string>([activeId]);

  for (const e of edges) {
    if (e.source === activeId) s.add(e.target);
    if (e.target === activeId) s.add(e.source);
  }

  return s;
}

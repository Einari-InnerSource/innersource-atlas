import type { AtlasEdge } from "@innersource-atlas/types";
import type { Edge } from "reactflow";

export function toReactFlowEdges(
  edges: AtlasEdge[],
  activeId?: string | null,
): Edge[] {
  return edges.map((e) => {
    const isConnected =
      activeId && (e.source === activeId || e.target === activeId);

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      animated: false,
      style: {
        strokeOpacity: activeId ? (isConnected ? 1 : 0.15) : 0.25,
      },
    };
  });
}

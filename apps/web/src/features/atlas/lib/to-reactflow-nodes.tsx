import type { AtlasEdge, AtlasNode } from "@innersource-atlas/types";
import type { Node } from "reactflow";
import { connectedNodeIds } from "./connected-node-ids";
import { layoutNodes } from "./layout-nodes";
import { NODE_H, NODE_W } from "./constants";

export function toReactFlowNodes(
  items: AtlasNode[],
  edges: AtlasEdge[],
  selectedId?: string | null,
  activeId?: string | null,
): Node[] {
  const positions = layoutNodes(items);
  const connected = activeId ? connectedNodeIds(edges, activeId) : null;

  return items.map((n) => {
    const isSelected = n.id === selectedId;
    const isNeighbour = connected ? connected.has(n.id) : true;

    const typeBadge =
      n.type === "team" ? "TEAM" : n.type === "repo" ? "REPO" : "LANG";

    const baseStyle: React.CSSProperties = {
      width: NODE_W,
      height: NODE_H,
      borderRadius: 10,
      border: isSelected ? "2px solid #fff" : "1px solid #333",
      background: "#111",
      color: "#ddd",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      fontSize: 14,
      cursor: "pointer",
      opacity: activeId ? (isNeighbour ? 1 : 0.25) : 1,
    };

    const badgeStyle: React.CSSProperties = {
      fontSize: 10,
      opacity: 0.7,
      marginRight: 10,
      letterSpacing: 0.6,
      minWidth: 60,
    };

    return {
      id: n.id,
      position: positions[n.id],
      data: {
        label: (
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <span style={badgeStyle}>{typeBadge}</span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {n.label}
            </span>
          </div>
        ),
      },
      style: baseStyle,
      type: "default",
    } satisfies Node;
  });
}

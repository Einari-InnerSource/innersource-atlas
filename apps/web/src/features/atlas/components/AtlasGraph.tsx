import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type {
  AtlasGraph as AtlasGraphModel,
  AtlasNode,
  AtlasEdge,
} from "@innersource-atlas/types";

export type AtlasGraphProps = {
  graph: AtlasGraphModel;
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<string | null>>;
};

const NODE_W = 220;
const NODE_H = 48;

function layoutNodes(
  items: AtlasNode[],
): Record<string, { x: number; y: number }> {
  const teams = items.filter((n) => n.type === "team");
  const repos = items.filter((n) => n.type === "repo");

  const pos: Record<string, { x: number; y: number }> = {};

  teams.forEach((t, i) => (pos[t.id] = { x: 60, y: 60 + i * 70 }));
  repos.forEach((r, i) => (pos[r.id] = { x: 420, y: 60 + i * 60 }));

  items.forEach((n, i) => {
    if (!pos[n.id]) pos[n.id] = { x: 60, y: 60 + i * 70 };
  });

  return pos;
}

function toReactFlowEdges(
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

function connectedNodeIds(edges: AtlasEdge[], activeId: string): Set<string> {
  const s = new Set<string>([activeId]);

  for (const e of edges) {
    if (e.source === activeId) s.add(e.target);
    if (e.target === activeId) s.add(e.source);
  }

  return s;
}
function toReactFlowNodes(
  items: AtlasNode[],
  edges: AtlasEdge[],
  selectedId?: string | null,
  activeId?: string | null,
): Node[] {
  const positions = layoutNodes(items);

  const connected = activeId ? connectedNodeIds(edges, activeId) : null;

  return items.map((n) => {
    const isSelected = n.id === selectedId;
    const isActive = activeId && n.id === activeId;
    const isNeighbour = connected ? connected.has(n.id) : true;

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

    const typeBadge = n.type === "team" ? "TEAM" : "REPO";

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

export function AtlasGraph({ graph, selectedId, onSelect }: AtlasGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = selectedId ?? hoveredId;

  const rfEdges = useMemo(
    () => toReactFlowEdges(graph.edges, activeId),
    [graph.edges, activeId],
  );

  const rfNodes = useMemo(
    () => toReactFlowNodes(graph.nodes, graph.edges, selectedId, activeId),
    [graph.nodes, graph.edges, selectedId, activeId],
  );

  const onNodeClick: NodeMouseHandler = (_, node) => {
    onSelect((prev) => (prev === node.id ? null : node.id));
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onPaneClick={() => onSelect(null)}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
        onNodeMouseLeave={() => setHoveredId(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

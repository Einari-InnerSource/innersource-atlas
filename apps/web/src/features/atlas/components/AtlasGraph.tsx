import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo } from "react";
import type {
  AtlasGraph as AtlasGraphModel,
  AtlasNode,
  AtlasEdge,
} from "@innersource-atlas/types";

export type AtlasGraphProps = {
  graph: AtlasGraphModel;
  selectedId: string | null;
  onSelect: (nodeId: string) => void;
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

function toReactFlowEdges(edges: AtlasEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: false,
  }));
}

function toReactFlowNodes(
  items: AtlasNode[],
  selectedId?: string | null,
): Node[] {
  const positions = layoutNodes(items);

  return items.map((n) => {
    const isSelected = n.id === selectedId;

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
  const rfNodes = useMemo(
    () => toReactFlowNodes(graph.nodes, selectedId),
    [graph.nodes, selectedId],
  );
  const rfEdges = useMemo(() => toReactFlowEdges(graph.edges), [graph.edges]);

  const onNodeClick: NodeMouseHandler = (_, node) => {
    onSelect(node.id);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodeClick={onNodeClick}
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

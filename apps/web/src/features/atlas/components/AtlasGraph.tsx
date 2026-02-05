import ReactFlow, {
  Background,
  Controls,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { AtlasGraph as AtlasGraphModel } from "@innersource-atlas/types";
import { toReactFlowEdges } from "../lib/to-reactflow-edges";
import { toReactFlowNodes } from "../lib/to-reactflow-nodes";

export type AtlasGraphProps = {
  graph: AtlasGraphModel;
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<string | null>>;
};

export function AtlasGraph({ graph, selectedId, onSelect }: AtlasGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Prefer hover highlight over selection highlight
  const activeId = hoveredId ?? selectedId;

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

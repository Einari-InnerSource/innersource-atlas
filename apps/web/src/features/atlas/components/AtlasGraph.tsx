import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo } from "react";
import type { AtlasNode } from "../atlasTypes";

export type AtlasGraphProps = {
  nodes: AtlasNode[];
  selected: AtlasNode | null;
  onSelect: (node: AtlasNode) => void;
};

const NODE_W = 220;
const NODE_H = 48;

// Simple deterministic positioning so the graph is usable without a layout engine.
function layoutNodes(
  items: AtlasNode[],
): Record<string, { x: number; y: number }> {
  const domains = items.filter((n) => n.type === "domain");
  const systems = items.filter((n) => n.type === "system");
  const repos = items.filter((n) => n.type === "repo");

  const pos: Record<string, { x: number; y: number }> = {};

  // Domains in a vertical column on the left
  domains.forEach((d, i) => {
    pos[d.id] = { x: 60, y: 60 + i * 90 };
  });

  // Systems in the middle, grouped by domain
  const systemsByDomain = new Map<string, AtlasNode[]>();
  for (const s of systems) {
    const domainId = (s as any).domainId as string;
    const arr = systemsByDomain.get(domainId) ?? [];
    arr.push(s);
    systemsByDomain.set(domainId, arr);
  }

  let sysBlockIndex = 0;
  for (const d of domains) {
    const group = systemsByDomain.get(d.id) ?? [];
    group.forEach((s, j) => {
      pos[s.id] = { x: 360, y: 60 + sysBlockIndex * 140 + j * 70 };
    });
    if (group.length > 0) sysBlockIndex += 1;
  }

  // Repos on the right, grouped by system
  const reposBySystem = new Map<string, AtlasNode[]>();
  for (const r of repos) {
    const systemId = (r as any).systemId as string;
    const arr = reposBySystem.get(systemId) ?? [];
    arr.push(r);
    reposBySystem.set(systemId, arr);
  }

  let repoRow = 0;
  for (const s of systems) {
    const group = reposBySystem.get(s.id) ?? [];
    group.forEach((r, j) => {
      pos[r.id] = { x: 680, y: 60 + repoRow * 140 + j * 60 };
    });
    if (group.length > 0) repoRow += 1;
  }

  // Fallback for anything unpositioned
  items.forEach((n, i) => {
    if (!pos[n.id]) pos[n.id] = { x: 60, y: 60 + i * 70 };
  });

  return pos;
}

function buildEdges(items: AtlasNode[]): Edge[] {
  const edges: Edge[] = [];

  for (const n of items) {
    if (n.type === "system") {
      edges.push({
        id: `e:${n.domainId}->${n.id}`,
        source: n.domainId,
        target: n.id,
        animated: false,
      });
    }

    if (n.type === "repo") {
      edges.push({
        id: `e:${n.systemId}->${n.id}`,
        source: n.systemId,
        target: n.id,
        animated: false,
      });
    }
  }

  return edges;
}

function toReactFlowNodes(
  items: AtlasNode[],
  selectedId?: string | null,
): Node[] {
  const positions = layoutNodes(items);

  return items.map((n) => {
    const isSelected = n.id === selectedId;

    // Visual style is simple and not theme-bound.
    // You can later replace this with custom node components.
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

    const typeBadge =
      n.type === "domain" ? "DOMAIN" : n.type === "system" ? "SYSTEM" : "REPO";

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
              {n.name}
            </span>
          </div>
        ),
      },
      style: baseStyle,
      // ReactFlow default node type is fine for now.
      type: "default",
    } satisfies Node;
  });
}

export function AtlasGraph({ nodes, selected, onSelect }: AtlasGraphProps) {
  const rfNodes = useMemo(
    () => toReactFlowNodes(nodes, selected?.id ?? null),
    [nodes, selected?.id],
  );
  const rfEdges = useMemo(() => buildEdges(nodes), [nodes]);

  const onNodeClick: NodeMouseHandler = (_, node) => {
    const found = nodes.find((n) => n.id === node.id);
    if (found) onSelect(found);
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

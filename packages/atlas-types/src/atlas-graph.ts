export interface AtlasGraph {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

export interface AtlasNodeBase {
  id: string;
  label: string;
}

export interface RepoNode extends AtlasNodeBase {
  type: "repo";
}

export interface TeamNode extends AtlasNodeBase {
  type: "team";
}

export type AtlasNode = RepoNode | TeamNode;

export interface AtlasEdge {
  id: string;
  source: string;
  target: string;
  type: "owns";
}

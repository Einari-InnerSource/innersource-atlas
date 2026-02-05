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

export interface LanguageNode extends AtlasNodeBase {
  type: "language";
}

export type AtlasNode = RepoNode | TeamNode | LanguageNode;

export interface AtlasEdge {
  id: string;
  source: string;
  target: string;
  type: "owns" | "uses"; // owns: team -> repo, uses: language -> repo
}

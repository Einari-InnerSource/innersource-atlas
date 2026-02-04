// features/atlas/atlasTypes.ts

export type AtlasNodeType = "domain" | "system" | "repo";

export type AtlasNodeBase = {
  id: string;
  type: AtlasNodeType;
  name: string;
};

export type DomainNode = AtlasNodeBase & {
  type: "domain";
};

export type SystemNode = AtlasNodeBase & {
  type: "system";
  domainId: string;
};

export type RepoNode = AtlasNodeBase & {
  type: "repo";
  systemId: string;
  owner?: string;

  ownership?: {
    teams: string[];
    users: string[];
    source: "codeowners" | "unknown";
  };

  maturity?: "experimental" | "beta" | "stable" | "deprecated";
  reusable?: boolean;
};

export type AtlasNode = DomainNode | SystemNode | RepoNode;

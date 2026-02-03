export type SourceType = "readme" | "codeowners";

export type SourceRef = {
  type: SourceType;
  location: string; // e.g. "README.md#Ownership" or ".github/CODEOWNERS:line 12"
  extracted: string; // raw string used
};

export type OwnerKind = "team" | "person" | "unknown";

export type OwnerRef =
  | {
      kind: "team";
      display: string; // "Team Platform Core" or "@org/team-platform-core"
      handles: string[]; // ["@org/team-platform-core"]
      confidence: "high" | "medium" | "low";
      sources: SourceRef[];
    }
  | {
      kind: "person";
      display: string; // "@einari"
      handles: string[]; // ["@einari"]
      confidence: "high" | "medium" | "low";
      sources: SourceRef[];
    }
  | {
      kind: "unknown";
      display: "unknown";
      handles: [];
      confidence: "low";
      sources: SourceRef[];
    };

export type OwnershipStatus =
  | "ok"
  | "multi_owner"
  | "conflict"
  | "unknown"
  | "placeholder";

export type OwnershipParseResult = {
  readme: {
    owningTeamRaw?: string;
    contactRaw?: string;
    ownerCandidates: OwnerRef[]; // derived from README only
    sources: SourceRef[];
    hasPlaceholders: boolean;
  };
  codeowners: {
    globalRule?: {
      pattern: string;
      owners: string[]; // as-is, may include @handles
      line: number; // 1-indexed
    };
    ownerCandidates: OwnerRef[]; // derived from CODEOWNERS only
    sources: SourceRef[];
  };
  resolved: {
    status: OwnershipStatus;
    resolvedOwner: OwnerRef;
    candidates: OwnerRef[]; // all candidates (deduped)
    notes: string[]; // explainability
  };
};

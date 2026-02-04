import type { AtlasNode } from "./atlasTypes";

export const SEED_NODES: AtlasNode[] = [
  { id: "domain-platform", type: "domain", name: "Platform" },
  { id: "domain-frontend", type: "domain", name: "Frontend" },

  {
    id: "sys-auth",
    type: "system",
    name: "Auth Middleware",
    domainId: "domain-platform",
  },
  {
    id: "sys-flags",
    type: "system",
    name: "Feature Flags",
    domainId: "domain-platform",
  },
  {
    id: "sys-ui",
    type: "system",
    name: "UI Components",
    domainId: "domain-frontend",
  },

  {
    id: "repo-auth-mw",
    type: "repo",
    name: "auth-middleware",
    systemId: "sys-auth",
    maturity: "stable",
    reusable: true,
  },
  {
    id: "repo-flags",
    type: "repo",
    name: "feature-flags",
    systemId: "sys-flags",
    maturity: "beta",
    reusable: true,
  },
  {
    id: "repo-ui-kit",
    type: "repo",
    name: "ui-components",
    systemId: "sys-ui",
    maturity: "experimental",
    reusable: true,
  },
];

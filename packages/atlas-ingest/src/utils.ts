// ---------- Helpers ----------

import { OwnerRef, SourceRef, SourceType } from "./types";

const PLACEHOLDER_RE = /^\s*(<[^>]+>|tbd|todo|unknown|n\/a|null|none)\s*$/i;

export function extractMarkdownSection(
  markdown: string,
  headingText: string,
): string | null {
  // Find a heading line like: "## Ownership" (any level >= 2 is fine)
  // then take until next heading of same-or-higher level (## or #), but simplest:
  // take until next line starting with "## " (since your template uses ## for sections).
  //
  // We intentionally keep it simple and compatible with your template.
  const lines = markdown.split(/\r?\n/);

  const headingRe = new RegExp(
    `^#{2,6}\\s+${escapeRegExp(headingText)}\\s*$`,
    "i",
  );

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRe.test(lines[i].trim())) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return null;

  const endRe = /^#{2,6}\s+/; // next heading
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (endRe.test(lines[i].trim())) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join("\n").trim();
}

export function extractBoldFieldValue(
  line: string,
  fieldName: string,
): string | undefined {
  // Matches patterns like:
  // - **Owning team:** Team Platform Core
  // - **Contact:** #channel or @someone
  //
  // Tolerant of minor whitespace differences.
  const re = new RegExp(
    `\\*\\*${escapeRegExp(fieldName)}\\*\\*\\s*:\\s*(.+)$`,
    "i",
  );
  const m = line.match(re);
  if (!m) return undefined;
  return m[1].trim();
}

export function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_RE.test(value.trim());
}

export function extractHandles(text: string): string[] {
  // Capture @org/team or @username. Keep punctuation trimming minimal.
  // Example: "@org/team," -> "@org/team"
  const matches = text.match(/@[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?/g);
  if (!matches) return [];
  return matches.map((h) => h.replace(/[.,;:)\]]+$/, ""));
}

export function isTeamHandle(handle: string): boolean {
  return handle.startsWith("@") && handle.includes("/");
}

export function isPersonHandle(handle: string): boolean {
  return handle.startsWith("@") && !handle.includes("/");
}

export function stripInlineComment(line: string): string {
  // Best-effort: split on " #" only if it's preceded by whitespace
  // so patterns like "path#file" aren't mangled.
  const idx = line.search(/\s#/);
  if (idx === -1) return line;
  return line.slice(0, idx).trimEnd();
}

export function pickBestGlobalRule(
  rules: Array<{
    pattern: string;
    owners: string[];
    line: number;
    raw: string;
  }>,
):
  | { pattern: string; owners: string[]; line: number; raw: string }
  | undefined {
  if (rules.length === 0) return undefined;

  const exactStar = rules.find((r) => r.pattern === "*");
  if (exactStar) return exactStar;

  // Broad root patterns (common in the wild)
  const broadPatterns = new Set(["/*", "/**", "/"]);
  const broad = rules.find((r) => broadPatterns.has(r.pattern));
  if (broad) return broad;

  // If no explicit global rule, don't guess from narrower patterns.
  return undefined;
}

export function ownersOverlap(a: OwnerRef, b: OwnerRef): boolean {
  if (a.kind === "unknown" || b.kind === "unknown") return false;

  // If any handle overlaps, we consider it overlapping.
  const aHandles = new Set(a.handles.map((h) => h.toLowerCase()));
  for (const h of b.handles) {
    if (aHandles.has(h.toLowerCase())) return true;
  }

  // As a fallback, compare display strings when no handles exist (e.g. "Team Platform Core")
  // This is intentionally conservative.
  if (a.handles.length === 0 && b.handles.length === 0) {
    return a.display.trim().toLowerCase() === b.display.trim().toLowerCase();
  }

  return false;
}

export function dedupeOwners(owners: OwnerRef[]): OwnerRef[] {
  const seen = new Set<string>();
  const out: OwnerRef[] = [];

  for (const o of owners) {
    const key =
      o.kind === "unknown"
        ? "unknown"
        : `${o.kind}:${(o.handles.length ? o.handles.join(",") : o.display).toLowerCase()}`;

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }

  return out;
}

export function unknownOwner(sources: SourceRef[]): OwnerRef {
  return {
    kind: "unknown",
    display: "unknown",
    handles: [],
    confidence: "low",
    sources,
  };
}

export function sourcesFor(
  path: string,
  extracted: string,
  type: SourceType,
): SourceRef[] {
  return [{ type, location: `${path}#Ownership`, extracted }];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

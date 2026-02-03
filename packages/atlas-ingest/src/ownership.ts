import { OwnershipParseResult, SourceRef, OwnerRef } from "./types";
import {
  extractMarkdownSection,
  extractBoldFieldValue,
  isPlaceholder,
  extractHandles,
  isTeamHandle,
  sourcesFor,
  isPersonHandle,
  dedupeOwners,
  stripInlineComment,
  pickBestGlobalRule,
  unknownOwner,
  ownersOverlap,
} from "./utils";

// ---------- Public API ----------

export function parseOwnership(params: {
  readmeText?: string | null;
  readmePath?: string; // default "README.md"
  codeownersText?: string | null;
  codeownersPath?: string; // default ".github/CODEOWNERS"
}): OwnershipParseResult {
  const readmePath = params.readmePath ?? "README.md";
  const codeownersPath = params.codeownersPath ?? ".github/CODEOWNERS";

  const readme = parseReadmeOwnership(params.readmeText ?? "", readmePath);
  const codeowners = parseCodeownersOwnership(
    params.codeownersText ?? "",
    codeownersPath,
  );

  const resolved = resolveOwnership(readme, codeowners);

  return { readme, codeowners, resolved };
}

/**
 * Expected format (from your template):
 * ## Ownership
 *
 * - **Owning team:** <team-name>
 * - **Contact:** #team-channel or @handle
 *
 * @param readmeText
 * @param readmePath
 * @returns
 */
export function parseReadmeOwnership(
  readmeText: string,
  readmePath = "README.md",
): OwnershipParseResult["readme"] {
  const sources: SourceRef[] = [];
  const ownershipSection = extractMarkdownSection(readmeText, "Ownership");

  if (!ownershipSection) {
    return {
      ownerCandidates: [],
      sources,
      hasPlaceholders: false,
    };
  }

  const location = `${readmePath}#Ownership`;
  const lines = ownershipSection.split(/\r?\n/).map((l) => l.trim());

  // Match the exact bullet style but tolerate minor variations
  const owningTeamLine = lines.find((l) => /Owning\s*team/i.test(l));
  const contactLine = lines.find((l) => /Contact/i.test(l));

  const owningTeamRaw = owningTeamLine
    ? extractBoldFieldValue(owningTeamLine, "Owning team")
    : undefined;
  const contactRaw = contactLine
    ? extractBoldFieldValue(contactLine, "Contact")
    : undefined;

  const hasPlaceholders =
    (owningTeamRaw ? isPlaceholder(owningTeamRaw) : false) ||
    (contactRaw ? isPlaceholder(contactRaw) : false);

  if (owningTeamLine) {
    sources.push({ type: "readme", location, extracted: owningTeamLine });
  }
  if (contactLine) {
    sources.push({ type: "readme", location, extracted: contactLine });
  }

  const candidates: OwnerRef[] = [];

  // Primary: owning team (free text + possible @org/team handle)
  if (owningTeamRaw && !isPlaceholder(owningTeamRaw)) {
    const handles = extractHandles(owningTeamRaw).filter(isTeamHandle);
    candidates.push({
      kind: "team",
      display: owningTeamRaw.trim(),
      handles,
      confidence: "high",
      sources: sourcesFor(readmePath, ownershipSection, "readme"),
    });
  }

  // Fallback: if no owning team, but contact contains @handles, treat as person/team owner candidates
  // (Still lower confidence; contact is not always ownership)
  if (
    (!owningTeamRaw || isPlaceholder(owningTeamRaw)) &&
    contactRaw &&
    !isPlaceholder(contactRaw)
  ) {
    const handles = extractHandles(contactRaw);
    const teamHandles = handles.filter(isTeamHandle);
    const personHandles = handles.filter(isPersonHandle);

    if (teamHandles.length > 0) {
      candidates.push({
        kind: "team",
        display: teamHandles[0],
        handles: teamHandles,
        confidence: "medium",
        sources: sourcesFor(readmePath, ownershipSection, "readme"),
      });
    } else if (personHandles.length > 0) {
      candidates.push({
        kind: "person",
        display: personHandles[0],
        handles: personHandles,
        confidence: "medium",
        sources: sourcesFor(readmePath, ownershipSection, "readme"),
      });
    }
  }

  return {
    owningTeamRaw,
    contactRaw,
    ownerCandidates: dedupeOwners(candidates),
    sources,
    hasPlaceholders,
  };
}

/**
 *
 * Picks the "best global rule" and interpret its owners as candidates.
 * Global rule selection preference:
 *   1) pattern == "*"
 *   2) pattern == "/*" or "/**" or similar broad root patterns
 *   3) none
 * @param codeownersText
 * @param codeownersPath
 * @returns
 */
export function parseCodeownersOwnership(
  codeownersText: string,
  codeownersPath = ".github/CODEOWNERS",
): OwnershipParseResult["codeowners"] {
  const lines = codeownersText.split(/\r?\n/);

  type Rule = { pattern: string; owners: string[]; line: number; raw: string };
  const rules: Rule[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const raw = lines[i];

    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Strip inline comments (best-effort; CODEOWNERS supports # in patterns but rare)
    const noComment = stripInlineComment(trimmed);

    const parts = noComment.split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue;

    const pattern = parts[0];
    const owners = parts.slice(1);

    rules.push({ pattern, owners, line: lineNo, raw });
  }

  const globalRule = pickBestGlobalRule(rules);

  const sources: SourceRef[] = [];
  const candidates: OwnerRef[] = [];

  if (globalRule) {
    sources.push({
      type: "codeowners",
      location: `${codeownersPath}:line ${globalRule.line}`,
      extracted: globalRule.raw,
    });

    const ownerTokens = globalRule.owners;

    const teamHandles = ownerTokens.filter(
      (t) => t.startsWith("@") && t.includes("/"),
    );
    const personHandles = ownerTokens.filter(
      (t) => t.startsWith("@") && !t.includes("/"),
    );

    if (teamHandles.length > 0) {
      candidates.push({
        kind: "team",
        display: teamHandles[0],
        handles: teamHandles,
        confidence: "medium",
        sources: [
          {
            type: "codeowners",
            location: `${codeownersPath}:line ${globalRule.line}`,
            extracted: globalRule.raw,
          },
        ],
      });
    }

    if (teamHandles.length === 0 && personHandles.length > 0) {
      candidates.push({
        kind: "person",
        display: personHandles[0],
        handles: personHandles,
        confidence: "low",
        sources: [
          {
            type: "codeowners",
            location: `${codeownersPath}:line ${globalRule.line}`,
            extracted: globalRule.raw,
          },
        ],
      });
    }
  }

  return {
    globalRule: globalRule
      ? {
          pattern: globalRule.pattern,
          owners: globalRule.owners,
          line: globalRule.line,
        }
      : undefined,
    ownerCandidates: dedupeOwners(candidates),
    sources,
  };
}

// ---------- Resolution ----------

export function resolveOwnership(
  readme: OwnershipParseResult["readme"],
  codeowners: OwnershipParseResult["codeowners"],
): OwnershipParseResult["resolved"] {
  const notes: string[] = [];

  const allCandidates = dedupeOwners([
    ...readme.ownerCandidates,
    ...codeowners.ownerCandidates,
  ]);

  // Placeholder is a special state (template not filled in)
  if (
    readme.hasPlaceholders &&
    readme.ownerCandidates.length === 0 &&
    codeowners.ownerCandidates.length === 0
  ) {
    return {
      status: "placeholder",
      resolvedOwner: unknownOwner([
        {
          type: "readme",
          location: "README.md#Ownership",
          extracted: "placeholders",
        },
      ]),
      candidates: [],
      notes: [
        "Ownership appears to be template placeholders and no CODEOWNERS owner was found.",
      ],
    };
  }

  // Primary precedence:
  // 1) README team owner (high)
  const readmeTeam = readme.ownerCandidates.find((o) => o.kind === "team");
  if (readmeTeam) {
    // conflict check with CODEOWNERS if present
    const coOwner = codeowners.ownerCandidates[0];
    if (coOwner && !ownersOverlap(readmeTeam, coOwner)) {
      return {
        status: "conflict",
        resolvedOwner: readmeTeam,
        candidates: allCandidates,
        notes: [
          "README declares a team owner, but CODEOWNERS global rule points to a different owner.",
          "Prefer README for 'who to talk to', but ownership should be clarified.",
        ],
      };
    }

    notes.push("Resolved owner from README Owning team.");
    return {
      status: allCandidates.length > 1 ? "multi_owner" : "ok",
      resolvedOwner: readmeTeam,
      candidates: allCandidates,
      notes,
    };
  }

  // 2) README person owner (via contact)
  const readmePerson = readme.ownerCandidates.find((o) => o.kind === "person");
  if (readmePerson) {
    const coOwner = codeowners.ownerCandidates[0];
    if (coOwner && !ownersOverlap(readmePerson, coOwner)) {
      return {
        status: "conflict",
        resolvedOwner: readmePerson,
        candidates: allCandidates,
        notes: [
          "README contact suggests an individual owner, but CODEOWNERS global rule points to a different owner.",
          "Prefer README if team ownership is not declared, but ownership should be clarified.",
        ],
      };
    }

    notes.push("Resolved owner from README contact (no owning team declared).");
    return {
      status: allCandidates.length > 1 ? "multi_owner" : "ok",
      resolvedOwner: readmePerson,
      candidates: allCandidates,
      notes,
    };
  }

  // 3) CODEOWNERS team owner
  const coTeam = codeowners.ownerCandidates.find((o) => o.kind === "team");
  if (coTeam) {
    notes.push("Resolved owner from CODEOWNERS global rule (team handle).");
    return {
      status: allCandidates.length > 1 ? "multi_owner" : "ok",
      resolvedOwner: coTeam,
      candidates: allCandidates,
      notes,
    };
  }

  // 4) CODEOWNERS person owner
  const coPerson = codeowners.ownerCandidates.find((o) => o.kind === "person");
  if (coPerson) {
    notes.push(
      "Resolved owner from CODEOWNERS global rule (individual handle).",
    );
    return {
      status: allCandidates.length > 1 ? "multi_owner" : "ok",
      resolvedOwner: coPerson,
      candidates: allCandidates,
      notes,
    };
  }

  // 5) Unknown
  if (readme.hasPlaceholders) {
    notes.push("README ownership appears to be placeholders.");
    return {
      status: "placeholder",
      resolvedOwner: unknownOwner(readme.sources),
      candidates: allCandidates,
      notes,
    };
  }

  return {
    status: "unknown",
    resolvedOwner: unknownOwner([...readme.sources, ...codeowners.sources]),
    candidates: allCandidates,
    notes: [
      "No ownership metadata found in README Ownership section or CODEOWNERS global rule.",
    ],
  };
}

export type ParsedOwnership = {
  teams: string[];
  users: string[];
};

export function parseCodeowners(text: string | null): ParsedOwnership {
  if (!text) {
    return { teams: [], users: [] };
  }

  const teams = new Set<string>();
  const users = new Set<string>();

  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // ignore comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) continue;

    // CODEOWNERS format:
    // <pattern> <owner> <owner> ...
    const parts = trimmed.split(/\s+/).slice(1);

    for (const owner of parts) {
      if (owner.startsWith("@")) {
        const name = owner.slice(1);
        if (name.includes("/")) {
          teams.add(name); // org/team
        } else {
          users.add(name);
        }
      }
    }
  }

  return {
    teams: [...teams],
    users: [...users],
  };
}

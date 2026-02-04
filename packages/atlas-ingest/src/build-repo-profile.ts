import { parseCodeowners } from "./ownership/parse-codeowners";
import type { RepoProfile } from "@innersource-atlas/types";
import type { RepoTextFiles } from "./github/content";

export function buildRepoProfile(args: {
  owner: string;
  repo: string;
  files: RepoTextFiles;
}): RepoProfile {
  const ownership = parseCodeowners(args.files.codeowners.text);

  return {
    owner: args.owner,
    name: args.repo,

    hasReadme: Boolean(args.files.readme),
    hasCodeowners: Boolean(args.files.codeowners.text),

    ownership: {
      teams: ownership.teams,
      users: ownership.users,
      source:
        ownership.teams.length || ownership.users.length
          ? "codeowners"
          : "unknown",
    },
  };
}

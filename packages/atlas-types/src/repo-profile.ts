export interface RepoProfile {
  owner: string;
  name: string;
  hasReadme: boolean;
  hasCodeowners: boolean;

  ownership: {
    teams: string[];
    users: string[];
    source: "codeowners" | "unknown";
  };
  languages: string[];
}

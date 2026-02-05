import { GitHubClient } from "../github-client";
import { RepoRef } from "../types/repo-ref";

export type RepoLanguages = Record<string, number>; // { "TypeScript": 12345, ... }

export async function fetchRepoLanguages(
  client: GitHubClient,
  ref: RepoRef,
): Promise<RepoLanguages> {
  const path = `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/languages`;
  return await client.getJson<RepoLanguages>(path);
}

/**
 * Convenience: returns just the language names (sorted by bytes desc).
 */
export async function fetchRepoLanguageNames(
  client: GitHubClient,
  ref: RepoRef,
): Promise<string[]> {
  const langs = await fetchRepoLanguages(client, ref);

  return Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

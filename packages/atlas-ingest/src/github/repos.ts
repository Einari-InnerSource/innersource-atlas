import { GitHubClient } from "./github-client";

export interface ListReposOptions {
  org: string; // "backstage"
  type?: "all" | "public" | "private" | "forks" | "sources" | "member";
  perPage?: number; // max 100
  maxPages?: number; // safety cap
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  archived: boolean;
  default_branch: string;
  description: string | null;
  html_url: string;
  pushed_at: string | null;
  updated_at: string;
}

export async function listOrgRepos(
  client: GitHubClient,
  opts: ListReposOptions,
): Promise<GitHubRepo[]> {
  const type = opts.type ?? "public";
  const perPage = Math.min(opts.perPage ?? 100, 100);
  const maxPages = opts.maxPages ?? 10;

  const all: GitHubRepo[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await client.getJson<GitHubRepo[]>(
      `/orgs/${encodeURIComponent(opts.org)}/repos?type=${encodeURIComponent(type)}&per_page=${perPage}&page=${page}`,
    );

    all.push(...batch);
    if (batch.length < perPage) break; // no more pages
  }

  return all;
}

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "packages/atlas-ingest/.env"),
});

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { GitHubClient } from "./github/github-client";
import { listOrgRepos } from "./github/repos";
import { fetchRepoTextFiles } from "./github/content";
import { buildRepoProfile } from "./build-repo-profile";

const ORG = "backstage";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set");
  }

  const client = new GitHubClient({ token });

  console.log(`Fetching repos for org: ${ORG}`);

  const repos = await listOrgRepos(client, {
    org: ORG,
    type: "public",
    perPage: 100,
    maxPages: 5,
  });

  console.log(`Found ${repos.length} repos`);

  const profiles = [];

  for (const r of repos) {
    const [owner, repo] = r.full_name.split("/");

    const files = await fetchRepoTextFiles(client, { owner, repo });

    const profile = buildRepoProfile({
      owner,
      repo,
      files,
    });

    profiles.push(profile);

    console.log(`✓ ${owner}/${repo}`);
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const outPath = path.resolve(
    __dirname,
    "../../../apps/web/src/features/atlas/mock/repo-profiles.json",
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(profiles, null, 2), "utf-8");

  console.log(`\nWrote ${profiles.length} repo profiles to:`);
  console.log(outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

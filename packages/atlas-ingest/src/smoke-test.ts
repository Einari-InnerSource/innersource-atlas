import "dotenv/config";

import { GitHubClient } from "./github";
import { listOrgRepos } from "./github/repos";
import { fetchRepoTextFiles } from "./github/content";
import { buildRepoProfile } from "./build-repo-profile";

const token = process.env.GITHUB_TOKEN;

async function main() {
  const client = new GitHubClient({ token });

  const repos = await listOrgRepos(client, {
    org: "backstage",
    type: "public",
    perPage: 100,
    maxPages: 2,
  });

  console.log(`Found ${repos.length} repos`);

  // Pick a couple to test
  const pick = repos.slice(0, 3);

  for (const r of pick) {
    const [owner, repo] = r.full_name.split("/");

    const files = await fetchRepoTextFiles(client, { owner, repo });

    const profile = buildRepoProfile({
      owner,
      repo,
      files,
    });

    console.log(`\n=== ${r.full_name} ===`);
    console.log(`README: ${profile.hasReadme ? "yes" : "no"}`);
    console.log(`CODEOWNERS: ${files.codeowners.path ?? "none"}`);
    console.log("Ownership:", profile.ownership);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

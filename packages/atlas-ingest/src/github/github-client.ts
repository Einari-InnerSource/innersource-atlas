export type GitHubClientOptions = {
  token?: string; // PAT recommended when rate limited
  userAgent?: string;
  baseUrl?: string; // default https://api.github.com
};

export class GitHubClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(opts: GitHubClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "https://api.github.com";
    const ua = opts.userAgent ?? "innersource-atlas-ingest";

    this.headers = {
      "User-Agent": ua,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (opts.token) {
      this.headers["Authorization"] = `Bearer ${opts.token}`;
    }
  }

  async getJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers, ...(init?.headers ?? {}) },
    });

    if (!res.ok) {
      const body = await safeText(res);
      throw new GitHubError(
        res.status,
        `${res.status} ${res.statusText}`,
        body,
      );
    }

    return (await res.json()) as T;
  }

  async getRaw(path: string, init?: RequestInit): Promise<string> {
    // Raw content is easiest via the contents API with this Accept header.
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        Accept: "application/vnd.github.raw+json",
        ...(init?.headers ?? {}),
      },
    });

    if (res.status === 404) return "";

    if (!res.ok) {
      const body = await safeText(res);
      throw new GitHubError(
        res.status,
        `${res.status} ${res.statusText}`,
        body,
      );
    }

    return await res.text();
  }
}

export class GitHubError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

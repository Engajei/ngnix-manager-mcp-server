type TokenState = {
  token: string;
  expires: number;
};

export class NpmApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "NpmApiError";
  }
}

export class NpmClient {
  private baseUrl: string;
  private email: string;
  private password: string;
  private tokenState: TokenState | null = null;

  constructor(opts: { baseUrl: string; email: string; password: string }) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.email = opts.email;
    this.password = opts.password;
  }

  private async authenticate(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: this.email, secret: this.password }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new NpmApiError(
        `Authentication failed (${res.status})`,
        res.status,
        body,
      );
    }
    const data = (await res.json()) as { token: string; expires: string };
    this.tokenState = {
      token: data.token,
      expires: new Date(data.expires).getTime(),
    };
    return data.token;
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (!this.tokenState || this.tokenState.expires - now < 60_000) {
      return this.authenticate();
    }
    return this.tokenState.token;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    opts: { query?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${path}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
    const res = await fetch(url.toString(), { method, headers, body });
    const text = await res.text();
    const parsed = text ? safeJson(text) : null;
    if (!res.ok) {
      throw new NpmApiError(
        `NPM API ${method} ${path} failed (${res.status})`,
        res.status,
        parsed ?? text,
      );
    }
    return parsed as T;
  }

  get<T = unknown>(path: string, query?: Record<string, unknown>) {
    return this.request<T>("GET", path, { query });
  }
  post<T = unknown>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }
  put<T = unknown>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }
  delete<T = unknown>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

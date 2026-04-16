#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NpmClient } from "./client.js";
import { registerProxyHosts } from "./tools/proxyHosts.js";
import { registerRedirectionHosts } from "./tools/redirectionHosts.js";
import { registerDeadHosts } from "./tools/deadHosts.js";
import { registerStreams } from "./tools/streams.js";
import { registerCertificates } from "./tools/certificates.js";
import { registerAccessLists } from "./tools/accessLists.js";
import { registerUsers } from "./tools/users.js";
import { registerMisc } from "./tools/misc.js";

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    let key: string;
    let val: string | undefined;
    if (eq !== -1) {
      key = a.slice(2, eq);
      val = a.slice(eq + 1);
    } else {
      key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        val = next;
        i++;
      } else {
        val = "true";
      }
    }
    out[key.replace(/-/g, "_")] = val;
  }
  return out;
}

function resolveConfig(): { baseUrl: string; email: string; password: string } {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    console.error(
      `nginx-manager-mcp-server

Usage:
  npx @kognar/nginx-manager-mcp-server \\
    --base-url <url> --email <email> --password <password>

Options (fallback to env vars NPM_BASE_URL / NPM_EMAIL / NPM_PASSWORD):
  --base-url, --url       NPM base URL (used as-is, no port appended)
  --email, --user         NPM login email
  --password, --pass      NPM password
  --help, -h              Show this help
`,
    );
    process.exit(0);
  }

  const baseUrl = args.base_url ?? args.url ?? process.env.NPM_BASE_URL;
  const email = args.email ?? args.user ?? process.env.NPM_EMAIL;
  const password = args.password ?? args.pass ?? process.env.NPM_PASSWORD;

  const missing = [
    !baseUrl && "--base-url / NPM_BASE_URL",
    !email && "--email / NPM_EMAIL",
    !password && "--password / NPM_PASSWORD",
  ].filter(Boolean);
  if (missing.length) {
    console.error(
      `[nginx-manager-mcp] Missing required config: ${missing.join(", ")}\nRun with --help for usage.`,
    );
    process.exit(1);
  }

  return { baseUrl: baseUrl!, email: email!, password: password! };
}

async function main() {
  const { baseUrl, email, password } = resolveConfig();

  const client = new NpmClient({ baseUrl, email, password });

  const server = new McpServer({
    name: "nginx-manager-mcp-server",
    version: "0.1.0",
  });

  const ctx = { server, client };
  registerProxyHosts(ctx);
  registerRedirectionHosts(ctx);
  registerDeadHosts(ctx);
  registerStreams(ctx);
  registerCertificates(ctx);
  registerAccessLists(ctx);
  registerUsers(ctx);
  registerMisc(ctx);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[nginx-manager-mcp] ready on stdio");
}

main().catch((e) => {
  console.error("[nginx-manager-mcp] fatal:", e);
  process.exit(1);
});

import { z } from "zod";
import { ok, err, type ToolCtx } from "./shared.js";

export function registerMisc({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_get_settings",
    {
      title: "List settings",
      description: "List all NPM settings.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await client.get("/api/settings"));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_get_setting",
    {
      title: "Get setting",
      description: "Get a setting by name.",
      inputSchema: { name: z.string() },
    },
    async ({ name }) => {
      try {
        return ok(await client.get(`/api/settings/${encodeURIComponent(name)}`));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_update_setting",
    {
      title: "Update setting",
      description: "Update a setting by name.",
      inputSchema: {
        name: z.string(),
        value: z.unknown(),
        meta: z.record(z.unknown()).optional(),
      },
    },
    async ({ name, value, meta }) => {
      try {
        return ok(
          await client.put(`/api/settings/${encodeURIComponent(name)}`, {
            value,
            meta,
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_get_audit_log",
    {
      title: "Get audit log",
      description: "Fetch the audit log.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await client.get("/api/audit-log"));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_get_reports_hosts",
    {
      title: "Hosts report",
      description: "Aggregate hosts report (counts by type/status).",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await client.get("/api/reports/hosts"));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_health",
    {
      title: "API health",
      description: "Check NPM API health/version.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await client.get("/api/"));
      } catch (e) {
        return err(e);
      }
    },
  );
}

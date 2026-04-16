import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/dead-hosts";

const body = z.object({
  domain_names: z.array(z.string()).min(1),
  certificate_id: z.union([z.number().int(), z.literal("new")]).optional(),
  ssl_forced: z.boolean().optional(),
  hsts_enabled: z.boolean().optional(),
  hsts_subdomains: z.boolean().optional(),
  http2_support: z.boolean().optional(),
  advanced_config: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export function registerDeadHosts({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_dead_hosts",
    {
      title: "List 404 hosts",
      description: "List all 404 (dead) hosts.",
      inputSchema: { expand: expandQuery },
    },
    async ({ expand }) => {
      try {
        return ok(await client.get(BASE, buildExpand(expand)));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_get_dead_host",
    {
      title: "Get 404 host",
      description: "Get a 404 host by ID.",
      inputSchema: { id: idSchema, expand: expandQuery },
    },
    async ({ id, expand }) => {
      try {
        return ok(await client.get(`${BASE}/${id}`, buildExpand(expand)));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_create_dead_host",
    {
      title: "Create 404 host",
      description: "Create a 404 host.",
      inputSchema: body.shape,
    },
    async (input) => {
      try {
        return ok(await client.post(BASE, input));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_update_dead_host",
    {
      title: "Update 404 host",
      description: "Update a 404 host.",
      inputSchema: { id: idSchema, ...body.partial().shape },
    },
    async ({ id, ...data }) => {
      try {
        return ok(await client.put(`${BASE}/${id}`, data));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_delete_dead_host",
    {
      title: "Delete 404 host",
      description: "Delete a 404 host.",
      inputSchema: { id: idSchema },
    },
    async ({ id }) => {
      try {
        return ok(await client.delete(`${BASE}/${id}`));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_enable_dead_host",
    {
      title: "Enable 404 host",
      description: "Enable a 404 host.",
      inputSchema: { id: idSchema },
    },
    async ({ id }) => {
      try {
        return ok(await client.post(`${BASE}/${id}/enable`));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_disable_dead_host",
    {
      title: "Disable 404 host",
      description: "Disable a 404 host.",
      inputSchema: { id: idSchema },
    },
    async ({ id }) => {
      try {
        return ok(await client.post(`${BASE}/${id}/disable`));
      } catch (e) {
        return err(e);
      }
    },
  );
}

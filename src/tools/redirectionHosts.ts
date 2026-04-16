import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/redirection-hosts";

const body = z.object({
  domain_names: z.array(z.string()).min(1),
  forward_scheme: z.enum(["http", "https", "$scheme"]),
  forward_domain_name: z.string(),
  forward_http_code: z.number().int().optional(),
  preserve_path: z.boolean().optional(),
  certificate_id: z.union([z.number().int(), z.literal("new")]).optional(),
  ssl_forced: z.boolean().optional(),
  hsts_enabled: z.boolean().optional(),
  hsts_subdomains: z.boolean().optional(),
  http2_support: z.boolean().optional(),
  block_exploits: z.boolean().optional(),
  advanced_config: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export function registerRedirectionHosts({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_redirection_hosts",
    {
      title: "List redirection hosts",
      description: "List all redirection hosts.",
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
    "npm_get_redirection_host",
    {
      title: "Get redirection host",
      description: "Get a redirection host by ID.",
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
    "npm_create_redirection_host",
    {
      title: "Create redirection host",
      description: "Create a redirection host.",
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
    "npm_update_redirection_host",
    {
      title: "Update redirection host",
      description: "Update a redirection host.",
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
    "npm_delete_redirection_host",
    {
      title: "Delete redirection host",
      description: "Delete a redirection host.",
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
    "npm_enable_redirection_host",
    {
      title: "Enable redirection host",
      description: "Enable a redirection host.",
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
    "npm_disable_redirection_host",
    {
      title: "Disable redirection host",
      description: "Disable a redirection host.",
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

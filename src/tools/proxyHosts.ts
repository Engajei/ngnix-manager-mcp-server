import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/proxy-hosts";

const proxyHostBody = z.object({
  domain_names: z.array(z.string()).min(1),
  forward_scheme: z.enum(["http", "https"]),
  forward_host: z.string(),
  forward_port: z.number().int().min(1).max(65535),
  certificate_id: z.union([z.number().int(), z.literal("new")]).optional(),
  ssl_forced: z.boolean().optional(),
  hsts_enabled: z.boolean().optional(),
  hsts_subdomains: z.boolean().optional(),
  http2_support: z.boolean().optional(),
  block_exploits: z.boolean().optional(),
  caching_enabled: z.boolean().optional(),
  allow_websocket_upgrade: z.boolean().optional(),
  access_list_id: z.number().int().optional(),
  advanced_config: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  locations: z
    .array(
      z.object({
        path: z.string(),
        advanced_config: z.string().optional(),
        forward_scheme: z.enum(["http", "https"]),
        forward_host: z.string(),
        forward_port: z.number().int(),
      }),
    )
    .optional(),
});

export function registerProxyHosts({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_proxy_hosts",
    {
      title: "List proxy hosts",
      description: "List all proxy hosts configured in Nginx Proxy Manager.",
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
    "npm_get_proxy_host",
    {
      title: "Get proxy host",
      description: "Get a proxy host by ID.",
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
    "npm_create_proxy_host",
    {
      title: "Create proxy host",
      description: "Create a new proxy host.",
      inputSchema: proxyHostBody.shape,
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
    "npm_update_proxy_host",
    {
      title: "Update proxy host",
      description: "Update an existing proxy host (partial fields allowed).",
      inputSchema: { id: idSchema, ...proxyHostBody.partial().shape },
    },
    async ({ id, ...body }) => {
      try {
        return ok(await client.put(`${BASE}/${id}`, body));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_delete_proxy_host",
    {
      title: "Delete proxy host",
      description: "Delete a proxy host by ID.",
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
    "npm_enable_proxy_host",
    {
      title: "Enable proxy host",
      description: "Enable a proxy host.",
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
    "npm_disable_proxy_host",
    {
      title: "Disable proxy host",
      description: "Disable a proxy host.",
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

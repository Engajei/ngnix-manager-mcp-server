import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/streams";

const body = z.object({
  incoming_port: z.number().int().min(1).max(65535),
  forwarding_host: z.string(),
  forwarding_port: z.number().int().min(1).max(65535),
  tcp_forwarding: z.boolean().optional(),
  udp_forwarding: z.boolean().optional(),
  certificate_id: z.union([z.number().int(), z.literal("new")]).optional(),
  meta: z.record(z.unknown()).optional(),
});

export function registerStreams({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_streams",
    {
      title: "List streams",
      description: "List all TCP/UDP streams.",
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
    "npm_get_stream",
    {
      title: "Get stream",
      description: "Get a stream by ID.",
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
    "npm_create_stream",
    {
      title: "Create stream",
      description: "Create a TCP/UDP stream.",
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
    "npm_update_stream",
    {
      title: "Update stream",
      description: "Update a stream.",
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
    "npm_delete_stream",
    {
      title: "Delete stream",
      description: "Delete a stream.",
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
    "npm_enable_stream",
    {
      title: "Enable stream",
      description: "Enable a stream.",
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
    "npm_disable_stream",
    {
      title: "Disable stream",
      description: "Disable a stream.",
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

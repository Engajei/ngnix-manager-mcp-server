import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/access-lists";

const body = z.object({
  name: z.string(),
  satisfy_any: z.boolean().optional(),
  pass_auth: z.boolean().optional(),
  items: z
    .array(z.object({ username: z.string(), password: z.string() }))
    .optional(),
  clients: z
    .array(
      z.object({
        address: z.string(),
        directive: z.enum(["allow", "deny"]),
      }),
    )
    .optional(),
});

export function registerAccessLists({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_access_lists",
    {
      title: "List access lists",
      description: "List all access lists.",
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
    "npm_get_access_list",
    {
      title: "Get access list",
      description: "Get an access list by ID.",
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
    "npm_create_access_list",
    {
      title: "Create access list",
      description: "Create an access list.",
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
    "npm_update_access_list",
    {
      title: "Update access list",
      description: "Update an access list.",
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
    "npm_delete_access_list",
    {
      title: "Delete access list",
      description: "Delete an access list.",
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
}

import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/users";

export function registerUsers({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_users",
    {
      title: "List users",
      description: "List all NPM users.",
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
    "npm_get_user",
    {
      title: "Get user",
      description: "Get a user by ID. Pass 'me' via id=0 is not supported; use the numeric ID.",
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
    "npm_get_me",
    {
      title: "Get current user",
      description: "Get the currently authenticated user.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await client.get(`${BASE}/me`));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_create_user",
    {
      title: "Create user",
      description: "Create a new user.",
      inputSchema: {
        name: z.string(),
        nickname: z.string(),
        email: z.string().email(),
        roles: z.array(z.string()).optional(),
        is_disabled: z.boolean().optional(),
        auth: z
          .object({ type: z.literal("password"), secret: z.string() })
          .optional(),
      },
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
    "npm_update_user",
    {
      title: "Update user",
      description: "Update a user.",
      inputSchema: {
        id: idSchema,
        name: z.string().optional(),
        nickname: z.string().optional(),
        email: z.string().email().optional(),
        roles: z.array(z.string()).optional(),
        is_disabled: z.boolean().optional(),
      },
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
    "npm_set_user_password",
    {
      title: "Set user password",
      description: "Set a user's password.",
      inputSchema: {
        id: idSchema,
        current: z.string().optional(),
        secret: z.string(),
      },
    },
    async ({ id, current, secret }) => {
      try {
        return ok(
          await client.put(`${BASE}/${id}/auth`, {
            type: "password",
            current,
            secret,
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_set_user_permissions",
    {
      title: "Set user permissions",
      description: "Set a user's permissions.",
      inputSchema: {
        id: idSchema,
        visibility: z.enum(["all", "user"]),
        proxy_hosts: z.enum(["hidden", "view", "manage"]),
        redirection_hosts: z.enum(["hidden", "view", "manage"]),
        dead_hosts: z.enum(["hidden", "view", "manage"]),
        streams: z.enum(["hidden", "view", "manage"]),
        access_lists: z.enum(["hidden", "view", "manage"]),
        certificates: z.enum(["hidden", "view", "manage"]),
      },
    },
    async ({ id, ...perms }) => {
      try {
        return ok(await client.put(`${BASE}/${id}/permissions`, perms));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_delete_user",
    {
      title: "Delete user",
      description: "Delete a user.",
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

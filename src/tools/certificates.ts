import { z } from "zod";
import { ok, err, buildExpand, expandQuery, idSchema, type ToolCtx } from "./shared.js";

const BASE = "/api/nginx/certificates";

export function registerCertificates({ server, client }: ToolCtx) {
  server.registerTool(
    "npm_list_certificates",
    {
      title: "List certificates",
      description: "List all SSL certificates.",
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
    "npm_get_certificate",
    {
      title: "Get certificate",
      description: "Get a certificate by ID.",
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
    "npm_create_certificate_letsencrypt",
    {
      title: "Request Let's Encrypt certificate",
      description:
        "Request a new Let's Encrypt certificate for the given domain names.",
      inputSchema: {
        domain_names: z.array(z.string()).min(1),
        meta: z.object({
          letsencrypt_agree: z.boolean(),
          letsencrypt_email: z.string().email(),
          dns_challenge: z.boolean().optional(),
          dns_provider: z.string().optional(),
          dns_provider_credentials: z.string().optional(),
          propagation_seconds: z.number().int().optional(),
        }),
      },
    },
    async ({ domain_names, meta }) => {
      try {
        return ok(
          await client.post(BASE, {
            provider: "letsencrypt",
            domain_names,
            meta,
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_create_certificate_custom",
    {
      title: "Upload custom certificate (metadata only)",
      description:
        "Create a custom certificate record. File upload must follow via npm_upload_certificate.",
      inputSchema: {
        nice_name: z.string(),
        domain_names: z.array(z.string()).min(1),
      },
    },
    async (input) => {
      try {
        return ok(
          await client.post(BASE, { provider: "other", ...input }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_renew_certificate",
    {
      title: "Renew certificate",
      description: "Renew a Let's Encrypt certificate.",
      inputSchema: { id: idSchema },
    },
    async ({ id }) => {
      try {
        return ok(await client.post(`${BASE}/${id}/renew`));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_test_certificate_http_reach",
    {
      title: "Test HTTP reachability",
      description:
        "Test whether domains are HTTP-reachable before requesting a cert.",
      inputSchema: { domains: z.array(z.string()).min(1) },
    },
    async ({ domains }) => {
      try {
        return ok(
          await client.get(`${BASE}/test-http`, {
            domains: JSON.stringify(domains),
          }),
        );
      } catch (e) {
        return err(e);
      }
    },
  );

  server.registerTool(
    "npm_delete_certificate",
    {
      title: "Delete certificate",
      description: "Delete a certificate by ID.",
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

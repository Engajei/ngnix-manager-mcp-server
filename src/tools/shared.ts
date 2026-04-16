import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NpmClient, NpmApiError } from "../client.js";

export type ToolCtx = { client: NpmClient; server: McpServer };

export function ok(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function err(e: unknown) {
  const message =
    e instanceof NpmApiError
      ? `${e.message}\n${JSON.stringify(e.body, null, 2)}`
      : e instanceof Error
        ? e.message
        : String(e);
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export const expandQuery = z
  .array(z.string())
  .optional()
  .describe("Optional expand fields (e.g. ['owner','certificate'])");

export function buildExpand(expand?: string[]) {
  return expand && expand.length ? { expand: expand.join(",") } : undefined;
}

export const idSchema = z.number().int().positive();

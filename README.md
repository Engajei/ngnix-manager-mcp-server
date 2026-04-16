# nginx-manager-mcp-server

MCP server que abstrai chamadas à API do [Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager).

## Instalação

```bash
npm install
npm run build
```

## Configuração

Aceita via **argumentos de CLI** ou **variáveis de ambiente** (CLI tem precedência):

| flag | env | descrição |
| --- | --- | --- |
| `--base-url` (ou `--url`) | `NPM_BASE_URL` | URL completa da API do NPM (use como está — não adicione porta) |
| `--email` (ou `--user`)   | `NPM_EMAIL`    | email de login |
| `--password` (ou `--pass`)| `NPM_PASSWORD` | senha |

```bash
npx @kognar-tools/nginx-manager-mcp-server \
  --base-url https://npm.example.com \
  --email admin@example.com \
  --password changeme
```

## Uso com Claude Code / Desktop

Adicione no `claude_desktop_config.json` (ou `.mcp.json`):

```json
{
  "mcpServers": {
    "nginx-manager": {
      "command": "npx",
      "args": [
        "-y",
        "@kognar-tools/nginx-manager-mcp-server",
        "--base-url", "https://npm.example.com",
        "--email", "admin@example.com",
        "--password", "changeme"
      ]
    }
  }
}
```

Alternativa com env vars:

```json
{
  "mcpServers": {
    "nginx-manager": {
      "command": "npx",
      "args": ["-y", "@kognar-tools/nginx-manager-mcp-server"],
      "env": {
        "NPM_BASE_URL": "https://npm.example.com",
        "NPM_EMAIL": "admin@example.com",
        "NPM_PASSWORD": "changeme"
      }
    }
  }
}
```

## Tools disponíveis

- **Proxy hosts** — `npm_list_proxy_hosts`, `npm_get_proxy_host`, `npm_create_proxy_host`, `npm_update_proxy_host`, `npm_delete_proxy_host`, `npm_enable_proxy_host`, `npm_disable_proxy_host`
- **Redirection hosts** — idem com `redirection_host`
- **404 hosts** — idem com `dead_host`
- **Streams** — idem com `stream`
- **Certificates** — `npm_list_certificates`, `npm_get_certificate`, `npm_create_certificate_letsencrypt`, `npm_create_certificate_custom`, `npm_renew_certificate`, `npm_test_certificate_http_reach`, `npm_delete_certificate`
- **Access lists** — `npm_list_access_lists`, `npm_get_access_list`, `npm_create_access_list`, `npm_update_access_list`, `npm_delete_access_list`
- **Users** — `npm_list_users`, `npm_get_user`, `npm_get_me`, `npm_create_user`, `npm_update_user`, `npm_set_user_password`, `npm_set_user_permissions`, `npm_delete_user`
- **Misc** — `npm_get_settings`, `npm_get_setting`, `npm_update_setting`, `npm_get_audit_log`, `npm_get_reports_hosts`, `npm_health`

## Desenvolvimento

```bash
npm run dev        # executa via tsx
npm run typecheck  # valida tipos sem emitir
```

Autenticação usa `POST /api/tokens` com cache em memória e refresh automático 1 min antes da expiração.

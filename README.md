# satisfactory-oci-server

Satisfactory server with Tailscale integration for deployment on OCI Container Instances.

## Features

- Satisfactory game server (based on [wolveix/satisfactory-server](https://github.com/wolveix/satisfactory-server))
- Tailscale integration for secure networking
- OCI Container Instance ready

## Deployment

### Quick Deploy to OCI

```bash
# 1. Edit container-config.json with your tokens
nano container-config.json

# 2. Deploy
chmod +x deploy-oci.sh
./deploy-oci.sh

# 3. Delete when done
./delete-oci.sh
```

### GitHub Container Registry (Recommended)

The GitHub Actions workflow automatically builds and pushes images to GHCR on:
- Push to `main` branch
- Tagged releases (`v*`)
- Manual workflow dispatch

**Image URL:**
```
ghcr.io/miyaji255/satisfactory-oci-server:latest
```

### OCI Container Instance Setup

1. **Pull the image:**
```bash
docker pull ghcr.io/miyaji255/satisfactory-oci-server:latest
# Or pull to OCI Container Instance directly
```

2. **Create Container Instance:**
```bash
oci container-instance container create \
  --compartment-id <compartment-id> \
  --display-name satisfactory-server \
  --image ghcr.io/miyaji255/satisfactory-oci-server:latest \
  --container-config file://container-config.json \
  --shape-name CI.Standard.E4.Flex \
  --shape-config '{"memoryInGBs": 8.0, "ocpus": 1.0}' \
  --vnic-id <subnet-id> \
  --cap-add "NET_ADMIN" \
  --device-config '[{"devicePath":"/dev/net/tun","deviceType":"hostDevice"}]'
```

3. **container-config.json:**
```json
{
  "environmentVariables": [
    {"name": "TS_AUTH_KEY", "value": "tskey-auth-xxxxx"},
    {"name": "TS_HOSTNAME", "value": "satisfactory"},
    {"name": "SATISFACTORY_BOT_DISCORD_TOKEN", "value": "your-discord-bot-token"},
    {"name": "MAXPLAYERS", "value": "4"},
    {"name": "PUID", "value": "1000"},
    {"name": "PGID", "value": "1000"}
  ]
}
```

### Docker Compose (Local Testing)

```bash
cp .env.example .env
# Edit .env with your values
docker compose up -d --build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TS_AUTH_KEY` | Yes | - | Tailscale pre-auth key (get from [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)) |
| `TS_HOSTNAME` | No | `satisfactory` | Tailscale hostname |
| `SATISFACTORY_BOT_DISCORD_TOKEN` | Yes | - | Discord bot token |
| `MAXPLAYERS` | No | `4` | Maximum player count |

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run main.ts
```

## Accessing the Server

Once deployed, access the server via Tailscale:
- Game port: `7777` (TCP/UDP)
- Hostname: `satisfactory` (or your configured `TS_HOSTNAME`)

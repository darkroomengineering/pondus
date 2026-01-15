# pondus

GitHub organization metrics and settings CLI.

Get commit statistics, explore org settings, members, teams, webhooks, and GitHub Actions configuration - all from your terminal.

## Installation

```bash
npm install -g pondus
```

Or with other package managers:

```bash
# pnpm
pnpm add -g pondus

# yarn
yarn global add pondus

# bun
bun add -g pondus
```

## Authentication

Pondus uses your existing GitHub authentication:

1. **GitHub CLI (recommended)**: If you have `gh` installed and authenticated, pondus will use it automatically
2. **Environment variable**: Set `GITHUB_TOKEN` or `GH_TOKEN`

Check your auth status:

```bash
pondus config auth
```

## Usage

### Commit Statistics

Get commit counts per organization member:

```bash
# All commits this year
pondus stats commits myorg

# Top 10 contributors
pondus stats commits myorg --top 10

# Specific date range
pondus stats commits myorg --since 2025-01-01 --until 2025-06-30

# Output as JSON
pondus stats commits myorg --output json

# Output as CSV
pondus stats commits myorg --output csv
```

### Organization Info

```bash
# Full org overview (plan, settings, security features)
pondus org info myorg

# List all members
pondus org members myorg

# List all teams
pondus org teams myorg

# List org webhooks (requires admin)
pondus org webhooks myorg

# GitHub Actions settings
pondus org actions myorg

# Include self-hosted runners and secrets
pondus org actions myorg --runners --secrets
```

### Interactive Mode

Run without arguments for a guided experience:

```bash
pondus
```

## Commands

| Command | Description |
|---------|-------------|
| `pondus stats commits <org>` | Commit statistics per member |
| `pondus org info <org>` | Organization settings overview |
| `pondus org members <org>` | List organization members |
| `pondus org teams <org>` | List teams and permissions |
| `pondus org webhooks <org>` | List organization webhooks |
| `pondus org actions <org>` | GitHub Actions settings |
| `pondus config auth` | Check authentication status |
| `pondus` | Interactive mode |

## Options

### Global Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help |
| `-V, --version` | Show version |

### Stats Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --since <date>` | Start date (YYYY-MM-DD) | Jan 1 this year |
| `-u, --until <date>` | End date (YYYY-MM-DD) | Dec 31 this year |
| `--no-members-only` | Include non-member commits | members only |
| `--include-bots` | Include bot accounts | excluded |
| `-o, --output <format>` | Output: table, json, csv | table |
| `-t, --top <n>` | Show top N contributors | all |

### Org Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <format>` | Output: table, json, csv | table |
| `--runners` | Show self-hosted runners (actions) | false |
| `--secrets` | Show org secrets (actions) | false |

## Examples

```bash
# Who contributed most to darkroomengineering this year?
pondus stats commits darkroomengineering --top 5

# Export all commits as CSV for a spreadsheet
pondus stats commits myorg --output csv > commits.csv

# Check org security settings
pondus org info myorg

# Get team structure as JSON
pondus org teams myorg --output json

# Full Actions audit
pondus org actions myorg --runners --secrets
```

## Permissions

Some endpoints require elevated permissions:

| Feature | Required Access |
|---------|-----------------|
| Commit stats | Org member |
| Org info | Org member |
| Members list | Org member |
| Teams list | Org member |
| Webhooks | Org admin |
| Actions settings | Org admin |
| Self-hosted runners | Org admin |
| Org secrets | Org admin |

## Development

```bash
# Clone
git clone https://github.com/darkroomengineering/pondus.git
cd pondus

# Install
bun install

# Run in dev mode
bun run dev stats commits myorg

# Type check
bun run typecheck

# Build
bun run build
```

## License

MIT - Darkroom Engineering

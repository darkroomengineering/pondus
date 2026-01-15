# Pondus

GitHub organization metrics dashboard by [Darkroom Engineering](https://darkroom.engineering).

## Apps

| App | Description | Stack |
|-----|-------------|-------|
| `apps/desktop` | Native desktop app | Tauri 2, React 19, Vite 7 |
| `apps/web` | Marketing website | Next.js 16, React 19 |
| `apps/cli` | Command-line tool | Bun, Commander |

## Packages

| Package | Description |
|---------|-------------|
| `@pondus/core` | Shared types and GitHub client |
| `@pondus/ui` | Darkroom-themed React components |

## Getting Started

```bash
# Install dependencies
bun install

# Run all apps in development
bun dev

# Build all apps
bun build
```

## Desktop App

The desktop app requires [GitHub CLI](https://cli.github.com) for authentication:

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Run desktop app
cd apps/desktop && bun run dev
```

## Requirements

- [Bun](https://bun.sh) >= 1.2
- [Rust](https://rustup.rs) (for Tauri desktop app)
- [GitHub CLI](https://cli.github.com) (for authentication)

## License

MIT

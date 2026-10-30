# AGENTS.md

## Operator experience (mandatory)

End users **never** use a terminal, edit config, or run Docker commands.

| User action | File |
|-------------|------|
| First-time setup | Double-click `install-app.sh` / `install-app.vbs` / `install-app.desktop` |
| Open app | Double-click `start-app.sh` / `start-app.vbs` / desktop **BEEP** shortcut |
| Autostart | Installed by `install-app` into OS login startup |

Support-only commands (plain-language output only):

- `bun dev` · `bun start` · `bun run build`

Implementation: `scripts/run-appliance.ts`, `scripts/install-app.ts`, `scripts/operator-status.ts`.

Logs for support: `.local/operator.log` — not shown to operators.

## Deployment assumptions

Edge / constrained — reference **NVIDIA Jetson Nano, 4 GB RAM**. See `config/deployment-profile.ts`, `docs/edge/deployment-profile.md`.

## Maintainers

| Action | Command |
|--------|---------|
| Typecheck | `bun run typecheck` |
| Tests | `bun test` |
| Compile launcher | `bun run build-executable` |
| CI deploy | `bun run cast:deploy` |

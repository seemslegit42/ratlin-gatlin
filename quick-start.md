# BEEP — quick start

No terminal. No config files. No technical steps.

## First time on this computer

1. Double-click **install-app** (`install-app.sh`, `install-app.command`, `install-app.vbs`, or `install-app.desktop`).
2. Wait until you see **Done.** Your browser opens by itself.

This creates a single app file at **`dist/beep-app`** and registers BEEP to start when you log in.

## Every day after that

- BEEP starts automatically when you sign in to your computer.
- Or double-click **start-app** / the **BEEP** shortcut on your desktop.

## If someone asks for a command (support only)

| Command | Meaning |
|---------|---------|
| `bun dev` | Working mode for product changes |
| `bun start` | Open the app |
| `bun run build` | Prepare a release build |

Operators should not need these; double-click installers are enough.

Technical logs (support only): `.local/operator.log`

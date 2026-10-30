# Install and run (operators)

```bash
# First time — from repo root (double-click is equivalent on desktop)
./install-app.sh
# Windows: install-app.vbs · macOS: install-app.command · Linux: install-app.desktop
```

```bash
# Daily launch
./start-app.sh
# Or use the BEEP desktop shortcut / login autostart from install-app
```

```bash
# Support-only (plain-language output); operators normally never run these
cd /path/to/ratlin-gatlin
bun dev
bun start
bun run build
```

```bash
# Support logs (not shown to operators)
tail -f .local/operator.log
```

Build artifact path after install:

```bash
test -x dist/beep-app && echo "launcher ok"
```

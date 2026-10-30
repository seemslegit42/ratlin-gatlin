# Verify changes

```bash
cd /path/to/ratlin-gatlin
bun install
bun run typecheck
bun test
```

```bash
# CI equivalent (.onedev-buildspec.yml)
bun test && bun run build
```

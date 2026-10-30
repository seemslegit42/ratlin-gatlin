# Edge deployment profile

Constants from `config/deployment-profile.ts` (documentation contract — not imported at runtime):

```typescript
// config/deployment-profile.ts — excerpt
export const DEPLOYMENT_PROFILE = {
  tier: 'edge-constrained',
  referenceDevHardware: 'NVIDIA Jetson Nano (4 GB RAM)',
  referenceDevMemoryGb: 4,
  appwriteInstallDir: 'appwrite',
  appwriteWizardPort: 20080,
  appwriteServerImage: 'appwrite/appwrite:2.6.2',
  operatorInstallScript: 'install-app.sh',
  operatorLauncher: 'dist/beep-app',
  operatorCommands: ['bun dev', 'bun start', 'bun run build'],
  applianceScript: 'scripts/run-appliance.ts',
} as const;
```

```bash
# Appwrite upstream minimum on 4 GB boards — enable swap before install
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

```bash
cd /path/to/ratlin-gatlin
bun run appwrite:bootstrap
docker compose -f docker-compose.sovereign.yml up -d
```

Automate env for edge profile:

```bash
bun run env:automate
```

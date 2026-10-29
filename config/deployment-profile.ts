/**
 * Canonical deployment assumptions for BEEP Dominion (ΛΞVON OS).
 *
 * **Contract only** — documentation, agents, and tests. Do not import this
 * module from runtime services, hooks, or UI logic; it must not change behavior.
 *
 * @see docs/edge-deployment-assumptions.md
 */

export const DEPLOYMENT_PROFILE = {
  tier: 'edge-constrained',
  referenceDevHardware: 'NVIDIA Jetson Nano (4 GB RAM)',
  referenceDevMemoryGb: 4,
  unifiedMemory: true,
  inferencePlacement: 'host-managed-engine',
  composeScope: 'gateway-and-auxiliary-services',
  cloudLlmDefault: 'disabled',
  baasPlacement: 'self-hosted-appwrite-compose',
  appwriteInstallDir: 'appwrite',
  appwriteWizardPort: 20080,
  appwriteServerImage: 'appwrite/appwrite:2.6.2',
  operatorInstallScript: 'install-app.sh',
  operatorLauncher: 'dist/beep-app',
  operatorCommands: ['bun dev', 'bun start', 'bun run build'] as const,
  applianceScript: 'scripts/run-appliance.ts',
} as const;

export type DeploymentProfile = typeof DEPLOYMENT_PROFILE;

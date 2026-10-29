import { describe, expect, it } from 'bun:test';
import { DEPLOYMENT_PROFILE } from './deployment-profile.js';

describe('deployment-profile (contract)', () => {
  it('assumes edge-constrained tier and Jetson Nano 4GB reference dev', () => {
    expect(DEPLOYMENT_PROFILE.tier).toBe('edge-constrained');
    expect(DEPLOYMENT_PROFILE.referenceDevHardware).toBe('NVIDIA Jetson Nano (4 GB RAM)');
    expect(DEPLOYMENT_PROFILE.referenceDevMemoryGb).toBe(4);
    expect(DEPLOYMENT_PROFILE.cloudLlmDefault).toBe('disabled');
    expect(DEPLOYMENT_PROFILE.baasPlacement).toBe('self-hosted-appwrite-compose');
    expect(DEPLOYMENT_PROFILE.operatorInstallScript).toBe('install-app.sh');
  });
});

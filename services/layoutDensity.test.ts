import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('High-Density Layout & Spacing Protocol', () => {
  const cssContent = readFileSync(resolve(process.cwd(), 'index.css'), 'utf-8');
  const htmlContent = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');
  const appContent = readFileSync(resolve(process.cwd(), 'App.tsx'), 'utf-8');

  it('should apply the high-density layout class to the body in index.html', () => {
    expect(htmlContent).toMatch(/<body[^>]*class="[^"]*\bhigh-density\b[^"]*"/);
  });

  it('should apply the high-density layout class to the root shell in App.tsx', () => {
    expect(appContent).toMatch(/className=\{`[^`]*\bhigh-density\b[^`]*`\}/);
  });

  it('should define tightened global spacing scale variables in index.css', () => {
    expect(cssContent).toMatch(/--space-2:\s*0\.375rem;/);
    expect(cssContent).toMatch(/--space-3:\s*0\.5rem;/);
    expect(cssContent).toMatch(/--space-4:\s*0\.75rem;/);
    expect(cssContent).toMatch(/--space-5:\s*1rem;/);
    expect(cssContent).toMatch(/--density-gap:\s*0\.25rem;/);
    expect(cssContent).toMatch(/--density-pad:\s*0\.25rem;/);
  });

  it('should define global component tightening rules within .high-density selector', () => {
    expect(cssContent).toContain('.high-density');
    expect(cssContent).toMatch(/\.high-density\s+\.glass-card/);
    expect(cssContent).toMatch(/\.high-density\s+\.density-section/);
    expect(cssContent).toMatch(/\.high-density\s+\.form-field/);
    expect(cssContent).toMatch(/\.high-density\s+\.one-tap-row/);
  });

  it('should apply the high-density layout class across all core modules and views', () => {
    const views = [
      'modules/main/main-view.tsx',
      'modules/economy/XiDashboard.tsx',
      'modules/crm/CRMView.tsx',
      'modules/operations/OperationsView.tsx',
      'modules/finance/FinanceView.tsx',
      'modules/avf/AVFView.tsx',
      'modules/security/SecurityView.tsx',
      'modules/marketing/MarketingView.tsx',
      'modules/procurement/ProcurementView.tsx',
      'modules/production/ProductionView.tsx',
      'modules/hrm/HRMView.tsx',
      'modules/admin/AdminView.tsx',
      'modules/pantheon/PantheonView.tsx',
      'modules/vault/VaultView.tsx',
      'modules/registry/RegistryView.tsx',
      'modules/notepad/NotepadView.tsx',
      'modules/help/HelpView.tsx',
      'modules/simulacrum/SimulacrumView.tsx',
      'modules/weaver/Weaver.tsx',
      'modules/weaver/layout/DesktopLayout.tsx',
      'modules/weaver/layout/MobileLayout.tsx',
      'modules/economy/ChaosDeckView.tsx',
      'components/economy/XiDashboard.tsx',
      'components/simulacrum/SimulacrumView.tsx',
      'components/CommandPalette.tsx',
      'components/CommandBar.tsx',
      'components/SettingsPanel.tsx',
      'components/CollaborationPanel.tsx',
      'components/Notifications.tsx',
      'components/TemplateBrowser.tsx',
      'components/widgets/NavigationWidget.tsx',
      'components/switchboard/Toolbar.tsx',
      'components/shared/GlassPane.tsx',
      'components/MicroAppForgeView.tsx',
      'components/vitals/vitals-strip.tsx',
      'components/shared/CommandCenter.tsx',
      'components/shared/Modal.tsx',
      'components/shared/Sheet.tsx',
      'components/Header.tsx',
    ];

    for (const viewPath of views) {
      const content = readFileSync(resolve(process.cwd(), viewPath), 'utf-8');
      expect(content).toContain('high-density');
    }
  });

  it('should strictly preserve WCAG 2.5.5 touch target minimums in high-density mode', () => {
    expect(cssContent).toMatch(/--tap-min:\s*44px;/);
    expect(cssContent).toMatch(/\.high-density\s+\.one-tap-row[\s\S]*?min-height:\s*var\(--tap-min\)/);
  });
});

/** Plain-language status lines for non-technical operators (BEEP_OPERATOR=1). */

export type OperatorPhase = 'working' | 'ready' | 'done' | 'attention';

const LABELS: Record<OperatorPhase, string> = {
  working: 'Working…',
  ready: 'Ready.',
  done: 'Done.',
  attention: 'Something needs attention.',
};

export function isOperatorMode(): boolean {
  return process.env.BEEP_OPERATOR === '1' || process.env.BEEP_APPLIANCE === '1';
}

export function status(phase: OperatorPhase, hint?: string): void {
  if (!isOperatorMode()) {
    if (hint) console.log(hint);
    return;
  }
  const line = LABELS[phase];
  console.log(hint ? `${line} ${hint}` : line);
}

export function statusAttention(): never {
  status('attention');
  process.exit(1);
}

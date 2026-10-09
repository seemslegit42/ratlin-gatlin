/**
 * Policy settings for OpenRouter API features.
 */

export function isOpenRouterNativeToolsEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env.OPENROUTER_NATIVE_TOOLS === '0') {
    return false;
  }
  return true;
}

/**
 * @file useHaptics.native.ts
 * @description Tactile feedback hook for the Verdigris Interface Protocol™ in React Native.
 * Provides custom haptic patterns: Glass Seal Breaking, Stone Wheel Turning, and Harmonic Success.
 */

import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const breakGlassSeal = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  };

  const turnStoneWheel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const glassThrum = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const notifyHarmonicSuccess = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const notifyDissonantError = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  };

  return {
    breakGlassSeal,
    turnStoneWheel,
    glassThrum,
    notifyHarmonicSuccess,
    notifyDissonantError,
  };
}

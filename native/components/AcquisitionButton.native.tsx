/**
 * @file AcquisitionButton.native.tsx
 * @description Tactile action instrument for the Verdigris Interface Protocol™ in React Native.
 * Features tactile haptic thrum, glassmorphic sheen, and Roman Aqua border glow.
 */

import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AcquisitionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const AcquisitionButton: React.FC<AcquisitionButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    // Glass Thrum (Tactile Haptic Feedback)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Graceful fallback if haptics unavailable
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.05)';
    switch (variant) {
      case 'secondary':
        return 'rgba(62, 185, 145, 0.15)'; // Patina Green glass
      case 'danger':
        return 'rgba(239, 68, 68, 0.2)';
      case 'primary':
      default:
        return 'rgba(106, 13, 173, 0.45)'; // Imperial Purple glass
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.1)';
    switch (variant) {
      case 'secondary':
        return '#3EB991';
      case 'danger':
        return '#EF4444';
      case 'primary':
      default:
        return '#20B2AA'; // Roman Aqua border glow
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
      >
        {icon}
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#20B2AA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: '#F5FFFA',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledText: {
    color: 'rgba(245, 255, 250, 0.3)',
  },
});

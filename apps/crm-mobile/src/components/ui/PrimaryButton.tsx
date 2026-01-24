// apps/crm-mobile/src/components/ui/PrimaryButton.tsx

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const baseStyle = styles[variant];
  const textStyle = styles[`${variant}Text`];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        baseStyle,
        disabled && styles.disabled,
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#fff'} />
      ) : (
        <Text style={[styles.textBase, textStyle, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textBase: { fontSize: 16, fontWeight: '600' },
  
  // Primary
  primary: { backgroundColor: '#2563eb' },
  primaryText: { color: '#ffffff' },

  // Secondary
  secondary: { backgroundColor: '#eff6ff' },
  secondaryText: { color: '#1d4ed8' },

  // Outline
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#d1d5db' },
  outlineText: { color: '#374151' },

  // Disabled
  disabled: { backgroundColor: '#9ca3af', borderColor: '#9ca3af' },
  disabledText: { color: '#e5e7eb' },
});
import React from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const COLORS = {
  primary: '#F36E27', // Jibble Orange
  white: '#FFFFFF',
  grayBorder: '#E5E7EB',
  textMain: '#374151',
  textGhost: '#6B7280',
  danger: '#DC2626',
};

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  let btnStyle: ViewStyle = {};
  let txtStyle: TextStyle = {};
  let loaderColor = COLORS.white;

  switch (variant) {
    case 'primary':
      btnStyle = { backgroundColor: COLORS.primary, borderWidth: 0 };
      txtStyle = { color: COLORS.white };
      break;
    case 'secondary':
      btnStyle = { backgroundColor: '#FFF7ED' }; // Light Orange
      txtStyle = { color: COLORS.primary };
      loaderColor = COLORS.primary;
      break;
    case 'outline':
      btnStyle = { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.grayBorder };
      txtStyle = { color: COLORS.textMain };
      loaderColor = COLORS.textMain;
      break;
    case 'ghost':
      btnStyle = { backgroundColor: 'transparent', borderWidth: 0 };
      txtStyle = { color: COLORS.textGhost };
      loaderColor = COLORS.primary;
      break;
    case 'danger':
      btnStyle = { backgroundColor: COLORS.danger };
      txtStyle = { color: COLORS.white };
      break;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, btnStyle, disabled && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={[styles.textBase, txtStyle, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52, // ارتفاع مريح للأصبع (UX)
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textBase: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});
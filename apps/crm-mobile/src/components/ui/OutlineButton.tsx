import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';

export function OutlineButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'outline',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'outline' | 'danger';
}) {
  const danger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, danger && styles.danger, (disabled || loading) && styles.disabled]}
    >
      {loading ? <ActivityIndicator /> : <Text style={[styles.text, danger && styles.dangerText]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  text: { color: '#111827', fontWeight: '700', fontSize: 16 },
  danger: { borderColor: '#fecaca' },
  dangerText: { color: '#991b1b' },
  disabled: { opacity: 0.6 },
});

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';

export function Card({
  children,
  style,
}: {
  children?: React.ReactNode;      // ✅ أصبح اختياري
  style?: ViewStyle | ViewStyle[]; // اختياري
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
});

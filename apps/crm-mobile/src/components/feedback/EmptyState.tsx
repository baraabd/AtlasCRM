import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PrimaryButton } from '../ui/PrimaryButton';


export function EmptyState({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {cta ? <PrimaryButton label={cta.label} onPress={cta.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 14, color: '#6b7280' },
});

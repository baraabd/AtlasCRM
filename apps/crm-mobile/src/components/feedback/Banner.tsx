import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Variant = 'info' | 'warning' | 'error' | 'offline' | 'success';

const tones: Record<Variant, { bg: string; text: string; border: string }> = {
  info: { bg: '#eff6ff', text: '#1e3a8a', border: '#bfdbfe' },
  warning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  error: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  offline: { bg: '#f3f4f6', text: '#111827', border: '#e5e7eb' },
  success: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
};

export function Banner({
  variant,
  text,
  action,
}: {
  variant: Variant;
  text: string;
  action?: { label: string; onPress: () => void };
}) {
  const t = tones[variant];
  return (
    <View style={[styles.root, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.text, { color: t.text }]}>{text}</Text>
      {action ? (
        <Pressable onPress={action.onPress}>
          <Text style={[styles.action, { color: t.text }]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 12, borderWidth: 1, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  text: { flex: 1, fontSize: 14, fontWeight: '500' },
  action: { fontSize: 14, fontWeight: '700' },
});

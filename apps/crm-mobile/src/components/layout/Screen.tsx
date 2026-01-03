import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

type Props = {
  title?: string;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function Screen({ title, right, footer, children }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      {(title || right) && (
        <View style={styles.topbar}>
          <Text style={styles.title}>{title ?? ''}</Text>
          <View>{right}</View>
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  topbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { flex: 1, padding: 16, gap: 12 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    padding: 12,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;

  // نتركها للـ API الحالي في الشاشات لكن لا نستخدمها داخل الـ UI
  // حتى لا يظهر عنوانين (Navigation header + عنوان داخلي)
  title?: string;
  right?: React.ReactNode;
};

export function Screen({ children, footer, title: _title, right: _right }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1, padding: 16 },
  footer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', padding: 16 },
});
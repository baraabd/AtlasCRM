// apps/crm-mobile/src/components/layout/Screen.tsx

import React from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar } from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
};

export function Screen({ children, title, footer }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </View>
        
        {footer && <View style={styles.footerWrapper}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  footerWrapper: {
    // يضمن أن الفوتر يظهر فوق المحتوى إذا لزم الأمر
    backgroundColor: 'transparent',
  }
});
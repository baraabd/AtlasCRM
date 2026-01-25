// apps/crm-mobile/src/components/layout/Screen.tsx

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar } from 'react-native';

// ✅ استيراد النوع Action لضبط الـ Props
import type { Action } from './StickyFooter';
import { StickyFooter } from './StickyFooter';

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  right?: React.ReactNode;
  // ✅ استخدام النوع الصحيح بدلاً من any[]
  actions?: Action[]; 
  style?: ViewStyle;
};

export function Screen({ children, title, footer, right, actions, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {(title || right) && (
           <View style={styles.header}>
             {title ? <Text style={styles.title}>{title}</Text> : <View />}
             {right && <View>{right}</View>}
           </View>
        )}

        <View style={styles.content}>
          {children}
        </View>
        
        <View style={styles.footerWrapper}>
          {/* ✅ تمرير actions مباشرة لأن StickyFooter أصبح يدعمها الآن */}
          {actions && actions.length > 0 && !footer && (
               <StickyFooter actions={actions} />
          )}
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 
  },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  footerWrapper: { backgroundColor: 'transparent' }
});
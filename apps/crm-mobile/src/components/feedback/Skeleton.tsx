// apps/crm-mobile/src/components/feedback/Skeleton.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Skeleton({ variant, count = 4 }: { variant: 'cards' | 'list' | 'form'; count?: number }) {
  const height = variant === 'list' ? 56 : variant === 'form' ? 44 : 90;

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.block, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12, // ✅ تم النقل إلى هنا لإصلاح التحذير
  },
  block: { 
    backgroundColor: '#f3f4f6', 
    borderRadius: 12 
  },
});
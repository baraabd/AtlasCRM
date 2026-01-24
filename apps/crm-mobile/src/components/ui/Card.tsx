// apps/crm-mobile/src/components/ui/Card.tsx

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat';
};

export function Card({ children, style, variant = 'default' }: Props) {
  return (
    <View style={[styles.base, variant === 'default' && styles.shadow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
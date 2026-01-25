// apps/crm-mobile/src/components/ui/Card.tsx

import React from 'react';
// ✅ 1. استيراد StyleProp
import type { ViewStyle, StyleProp } from 'react-native';
import { View, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
  // ✅ 2. السماح بتمرير مصفوفة من الستايلات
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: Props) {
  return (
    // ✅ 3. دمج الستايل الافتراضي مع الستايل القادم
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
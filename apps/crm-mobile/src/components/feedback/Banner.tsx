// apps/crm-mobile/src/components/feedback/Banner.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Variant = 'info' | 'success' | 'warning' | 'error' | 'offline';

type Props = {
  text: string;
  variant?: Variant;
  action?: { label: string; onPress: () => void };
};

export function Banner({ text, variant = 'info', action }: Props) {
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{text}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.actionBtn}>
          <Text style={[styles.actionText, styles[`${variant}Text`]]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12, borderRadius: 8, marginBottom: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
  },
  text: { fontSize: 14, fontWeight: '500', flex: 1 },
  actionBtn: { marginLeft: 8 },
  actionText: { fontWeight: '700', textDecorationLine: 'underline' },
  
  info: { backgroundColor: '#eff6ff' },
  infoText: { color: '#1e40af' },
  
  success: { backgroundColor: '#f0fdf4' },
  successText: { color: '#166534' },
  
  warning: { backgroundColor: '#fefce8' },
  warningText: { color: '#854d0e' },
  
  error: { backgroundColor: '#fef2f2' },
  errorText: { color: '#991b1b' },
  
  offline: { backgroundColor: '#374151' },
  offlineText: { color: '#f3f4f6' },
});
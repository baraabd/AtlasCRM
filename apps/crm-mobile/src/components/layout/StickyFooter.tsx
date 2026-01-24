// apps/crm-mobile/src/components/layout/StickyFooter.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PrimaryButton } from '../ui/PrimaryButton';

type Action = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
};

type Props = {
  primary?: Action;
  secondary?: Action;
};

export function StickyFooter({ primary, secondary }: Props) {
  return (
    <View style={styles.container}>
      {secondary && (
        <View style={styles.btnWrapper}>
          <PrimaryButton {...secondary} variant={secondary.variant || 'outline'} />
        </View>
      )}
      {secondary && primary && <View style={{ width: 12 }} />}
      {primary && (
        <View style={styles.btnWrapper}>
          <PrimaryButton {...primary} variant={primary.variant || 'primary'} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 24, // extra padding for safe area
  },
  btnWrapper: { flex: 1 },
});
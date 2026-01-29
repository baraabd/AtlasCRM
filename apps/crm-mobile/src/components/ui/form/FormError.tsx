import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface Props {
  message?: string | null;
}

export function FormError({ message }: Props) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
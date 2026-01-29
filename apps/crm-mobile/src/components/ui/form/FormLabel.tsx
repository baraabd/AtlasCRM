import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface Props {
  text: string;
  style?: TextStyle;
}

export function FormLabel({ text, style }: Props) {
  return <Text style={[styles.label, style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827', // textDark
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
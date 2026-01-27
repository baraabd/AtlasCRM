import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  highlightLink?: { text: string; onPress: () => void };
};

export function Checkbox({ label, checked, onChange, highlightLink }: Props) {
  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.box, checked && styles.checkedBox]} 
        onPress={() => onChange(!checked)}
        hitSlop={8} // UX: يجعل منطقة اللمس أكبر قليلاً
      >
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Pressable>
      
      <View style={styles.textContainer}>
        <Text style={styles.label} onPress={() => onChange(!checked)}>
          {label}
          {highlightLink && (
            <Text style={styles.link} onPress={highlightLink.onPress}>
              {highlightLink.text}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Gray-300
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#65C466', // Success Green
    borderColor: '#65C466',
  },
  textContainer: { flex: 1 },
  label: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  link: { color: '#F36E27', fontWeight: '600', textDecorationLine: 'underline' },
});
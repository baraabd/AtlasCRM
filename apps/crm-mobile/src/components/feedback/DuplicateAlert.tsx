import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Lead } from '../../types/domain';

type Props = {
  existingLeads: Lead[];
  onOpenLead: (id: string) => void;
};

export function DuplicateAlert({ existingLeads, onOpenLead }: Props) {
  if (existingLeads.length === 0) return null;

  const firstMatch = existingLeads[0];
  const count = existingLeads.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={20} color="#B45309" />
        <Text style={styles.title}>
          {count === 1 
            ? 'Phone number already in use' 
            : `Phone used by ${count} businesses`}
        </Text>
      </View>
      
      <Text style={styles.subtitle}>
        Linked to: <Text style={styles.bold}>{firstMatch.name}</Text>
        {count > 1 && ` and ${count - 1} others`}
      </Text>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => onOpenLead(firstMatch.id)}
      >
        <Text style={styles.actionText}>View {firstMatch.name}</Text>
        <Ionicons name="arrow-forward" size={14} color="#B45309" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBEB', // خلفية صفراء فاتحة جداً (تحذيرية وليست خطأ أحمر)
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: -8, // لتقريبه من حقل الهاتف
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { color: '#92400E', fontWeight: '700', fontSize: 13, marginLeft: 6 },
  subtitle: { color: '#B45309', fontSize: 13, marginLeft: 26, marginBottom: 8 },
  bold: { fontWeight: 'bold' },
  actionBtn: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginLeft: 26, backgroundColor: 'rgba(180, 83, 9, 0.1)', 
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 
  },
  actionText: { color: '#B45309', fontSize: 12, fontWeight: '600', marginRight: 4 },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Lead } from '../../types/domain';

type Props = {
  type: 'warning' | 'danger'; // 🟡 أصفر للفرع، 🔴 أحمر للتطابق التام
  clientName: string;
  clientId: string;
  count?: number; // عدد التكرارات (اختياري)
  onOpen: () => void;
};

export function ExistingClientAlert({ type, clientName, clientId, count = 1, onOpen }: Props) {
  const isDanger = type === 'danger';
  
  // تحديد الألوان بناءً على النوع
  const stylesConfig = isDanger ? {
    bg: '#FEF2F2', border: '#F87171', text: '#991B1B', icon: '#DC2626'
  } : {
    bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', icon: '#D97706'
  };

  return (
    <View style={[styles.container, { backgroundColor: stylesConfig.bg, borderColor: stylesConfig.border }]}>
      <View style={styles.header}>
        <Ionicons 
          name={isDanger ? "alert-circle" : "information-circle"} 
          size={20} 
          color={stylesConfig.icon} 
        />
        <Text style={[styles.title, { color: stylesConfig.text }]}>
          {isDanger ? 'Client already exists' : 'Phone number in use'}
        </Text>
      </View>
      
      <Text style={[styles.subtitle, { color: stylesConfig.text }]}>
        {isDanger 
          ? `"${clientName}" is already in your database.` 
          : `Linked to "${clientName}"${count > 1 ? ` and ${count - 1} others` : ''}.`
        }
      </Text>

      <TouchableOpacity 
        style={[styles.actionBtn, { backgroundColor: isDanger ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)' }]}
        onPress={onOpen}
      >
        <Text style={[styles.actionText, { color: stylesConfig.text }]}>
          Open {clientName}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={stylesConfig.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, marginTop: -8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { fontWeight: '700', fontSize: 13, marginLeft: 6 },
  subtitle: { fontSize: 13, marginLeft: 26, marginBottom: 12 },
  actionBtn: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginLeft: 26, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 
  },
  actionText: { fontSize: 12, fontWeight: '700', marginRight: 4 },
});
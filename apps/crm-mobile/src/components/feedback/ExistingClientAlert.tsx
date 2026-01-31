import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  type: 'warning' | 'danger';
  clientName: string;
  count?: number;
  onOpen: () => void;
};

export function ExistingClientAlert({ type, clientName, count = 1, onOpen }: Props) {
  const isDanger = type === 'danger';
  
  // نستخدم الألوان فقط للأيقونات والنصوص لأنها تمرر كـ props أو style بسيط
  const colors = isDanger ? {
    text: '#991B1B',
    icon: '#DC2626',
  } : {
    text: '#92400E',
    icon: '#D97706',
  };

  return (
    // ✅ استخدام ستايلات معرفة مسبقاً بدلاً من Inline
    <View style={[
      styles.container, 
      isDanger ? styles.containerDanger : styles.containerWarning
    ]}>
      <View style={styles.header}>
        <Ionicons 
          name={isDanger ? "alert-circle" : "information-circle"} 
          size={20} 
          color={colors.icon} 
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {isDanger ? 'Client already exists' : 'Phone number in use'}
        </Text>
      </View>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        {isDanger 
          ? `"${clientName}" is already in your database.` 
          : `Linked to "${clientName}"${count > 1 ? ` and ${count - 1} others` : ''}.`
        }
      </Text>

      <TouchableOpacity 
        // ✅ الحل الجذري للتحذير: اختيار الستايل من StyleSheet
        style={[
          styles.actionBtn, 
          isDanger ? styles.btnDanger : styles.btnWarning
        ]}
        onPress={onOpen}
      >
        <Text style={[styles.actionText, { color: colors.text }]}>
          Open {clientName}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    marginTop: -8,
  },
  // ✅ تعريف الستايلات الديناميكية هنا
  containerDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  containerWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { fontWeight: '700', fontSize: 13, marginLeft: 6 },
  subtitle: { fontSize: 13, marginLeft: 26, marginBottom: 12 },
  
  actionBtn: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginLeft: 26, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 
  },
  // ✅ تعريف خلفيات الأزرار هنا
  btnDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  btnWarning: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  
  actionText: { fontSize: 12, fontWeight: '700', marginRight: 4 },
});
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, 
  FlatList, StyleSheet, TouchableWithoutFeedback 
} from 'react-native';

import type { LookupItem } from '../../types/domain';

type Props = {
  label: string;
  placeholder?: string;
  value?: string; // الكود المختار (مثلاً "RETAIL")
  options: LookupItem[];
  onSelect: (code: string) => void;
  error?: string | null;
};

export function SelectInput({ label, placeholder, value, options, onSelect, error }: Props) {
  const [visible, setVisible] = useState(false);

  // البحث عن النص العربي/الإنجليزي للكود المختار
  const selectedItem = options.find((opt) => opt.code === value);
  const displayText = selectedItem ? selectedItem.labelAr : placeholder || 'اختر من القائمة';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={[styles.input, !!error && styles.inputError]} 
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.text, !selectedItem && styles.placeholder]}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>
      
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* النافذة المنبثقة للقائمة */}
      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{label}</Text>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.option, item.code === value && styles.optionSelected]}
                    onPress={() => {
                      onSelect(item.code);
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, item.code === value && styles.textSelected]}>
                      {item.labelAr}
                    </Text>
                    {item.code === value && (
                      <Ionicons name="checkmark" size={20} color="#F36E27" />
                    )}
                  </TouchableOpacity>
                )}
              />
              
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, padding: 14,
  },
  inputError: { borderColor: '#EF4444' },
  text: { fontSize: 16, color: '#1F2937' },
  placeholder: { color: '#9CA3AF' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', padding: 24 
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center'
  },
  option: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    flexDirection: 'row', justifyContent: 'space-between'
  },
  optionSelected: { backgroundColor: '#FFF7ED' },
  optionText: { fontSize: 16, color: '#374151' },
  textSelected: { color: '#F36E27', fontWeight: 'bold' },
  closeBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  closeText: { color: '#6B7280', fontSize: 16 },
});
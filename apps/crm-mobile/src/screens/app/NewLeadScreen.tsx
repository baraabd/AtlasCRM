import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Text, Keyboard } from 'react-native';

import { FormField } from '../../components/ui/FormField';
import { SelectInput } from '../../components/ui/SelectInput';
// ✅ استيراد المكون الجديد الموحد
import { ExistingClientAlert } from '../../components/feedback/ExistingClientAlert';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';

import { useLeadsCtx } from '../../state/LeadsContext';
import { useMetadata } from '../../state/MetadataContext';
import type { Lead } from '../../types/domain';
import type { ScreenProps } from '../_types';

export function NewLeadScreen({ navigation, route }: ScreenProps<'NewLead'>) {
  const { create, findLeadsByPhone, leads, loading } = useLeadsCtx();
  const { lookups, isLoading: loadingMetadata } = useMetadata();
  const clientTypes = lookups['CLIENT_TYPE'] || [];

  const [name, setName] = useState(route.params?.prefillName ?? '');
  const [phone, setPhone] = useState('');
  const [typeCode, setTypeCode] = useState('');

  // 1. حالة لتخزين العميل المطابق بالاسم (للخطأ الأحمر)
  const [exactMatch, setExactMatch] = useState<Lead | null>(null);
  
  // 2. حالة لتخزين العملاء المطابقين بالهاتف (للتحذير الأصفر)
  const [phoneDuplicates, setPhoneDuplicates] = useState<Lead[]>([]);

  // 🧠 فحص الاسم عند مغادرة الحقل (OnBlur) - بدون نافذة منبثقة مزعجة
  const handleNameBlur = () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setExactMatch(null);
      return;
    }

    const found = leads.find(l => l.name.toLowerCase() === cleanName.toLowerCase());
    setExactMatch(found || null); // حفظ النتيجة لعرض البطاقة الحمراء
  };

  // 🧠 فحص الهاتف أثناء الكتابة (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phone.length >= 8) {
        const found = findLeadsByPhone(phone);
        // نستبعد العميل الذي وجدناه بالاسم (لكي لا يظهر تحذير الهاتف واسمه موجود أصلاً في الأحمر)
        const filtered = found.filter(l => l.id !== exactMatch?.id);
        setPhoneDuplicates(filtered);
      } else {
        setPhoneDuplicates([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [phone, findLeadsByPhone, exactMatch]);

  // عند تغيير الاسم، نخفي الخطأ القديم حتى يتم الفحص مرة أخرى
  const onNameChange = (text: string) => {
    setName(text);
    if (exactMatch) setExactMatch(null); 
  };

  const canSubmit = useMemo(() => {
    // نمنع الحفظ إذا كان الاسم مكرراً
    if (exactMatch) return false;
    return name.trim().length >= 2 && typeCode !== '' && phone.trim().length >= 9;
  }, [name, typeCode, phone, exactMatch]);

  async function onSubmit() {
    if (!canSubmit || loading) return;

    // فحص أخير قبل الإرسال
    const finalCheck = leads.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
    if (finalCheck) {
      setExactMatch(finalCheck);
      return;
    }

    try {
      const created = await create({
        name: name.trim(),
        businessType: typeCode,
        phones: [phone.trim()],
      });
      navigation.replace('SelectLead', { selectLeadId: created.id });
    } catch { }
  }

  const getButtonLabel = () => {
    if (loading) return 'Saving...';
    // إذا كان هناك تحذير أصفر فقط
    if (phoneDuplicates.length > 0 && !exactMatch) return 'Save as New Branch';
    return 'Save Lead';
  };

  return (
    <Screen 
      title="New Lead"
      style={styles.screenBg}
      footer={
        <StickyFooter
          actions={[
             {
               label: getButtonLabel(),
               variant: 'primary',
               disabled: !canSubmit || loading, 
               onPress: onSubmit,
             },
             {
               label: 'Cancel',
               variant: 'outline',
               onPress: () => navigation.goBack(),
             }
          ]}
        />
      }
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.container}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.sectionSubtitle}>Please fill in the client details accurately.</Text>

          {/* === حقل الاسم === */}
          <FormField
            label="Business / Lead Name *"
            placeholder="e.g. Al-Amal Furniture"
            value={name}
            onChangeText={onNameChange} // استخدام الدالة المعدلة
            onBlur={handleNameBlur} // الفحص الصامت عند المغادرة
            icon="business-outline"
            // نلون الحقل بالأحمر إذا وجدنا تطابقاً
            error={exactMatch ? " " : undefined} // نرسل مسافة فارغة لتلوين الحقل فقط، الرسالة في البطاقة
          />

          {/* 🔴 البطاقة الحمراء (تظهر عند تكرار الاسم) */}
          {exactMatch && (
            <ExistingClientAlert
              type="danger"
              clientName={exactMatch.name}
              clientId={exactMatch.id}
              onOpen={() => navigation.replace('SelectLead', { selectLeadId: exactMatch.id })}
            />
          )}

          {/* === القائمة المنسدلة === */}
          <SelectInput
            label="Business Type *"
            placeholder={loadingMetadata ? "Loading..." : "Select Business Type"}
            options={clientTypes}
            value={typeCode}
            onSelect={setTypeCode}
          />

          {/* === حقل الهاتف === */}
          <FormField
            label="Primary Phone Number *"
            placeholder="05xxxxxxx"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
            style={phoneDuplicates.length > 0 ? { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' } : undefined}
          />

          {/* 🟡 البطاقة الصفراء (تظهر عند تكرار الهاتف لاسم مختلف) */}
          {phoneDuplicates.length > 0 && (
            <ExistingClientAlert
              type="warning"
              clientName={phoneDuplicates[0].name}
              clientId={phoneDuplicates[0].id}
              count={phoneDuplicates.length}
              onOpen={() => navigation.replace('SelectLead', { selectLeadId: phoneDuplicates[0].id })}
            />
          )}

        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenBg: { backgroundColor: '#F9FAFB' },
  container: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
});
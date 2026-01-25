// apps/crm-mobile/src/screens/app/NewLeadScreen.tsx

import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useLeadsCtx } from '../../state/LeadsContext';
import type { ScreenProps } from '../_types';

export function NewLeadScreen({ navigation, route }: ScreenProps<'NewLead'>) {
  // ✅ التصحيح: استبدال state بـ loading
  const { create, loading, error } = useLeadsCtx();

  const [name, setName] = useState(route.params?.prefillName ?? '');
  const [phones, setPhones] = useState('');
  const [businessType, setBusinessType] = useState('');

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  async function onSubmit() {
    // ✅ استخدام loading بدلاً من state === 'loading'
    if (!canSubmit || loading) return;

    try {
      const phonesArr = phones
        .split(/[,;\n]/g)
        .map((p) => p.trim())
        .filter(Boolean);

      const created = await create({
        name: name.trim(),
        businessType: businessType.trim() || undefined,
        phones: phonesArr.length ? phonesArr : undefined,
      });

      navigation.replace('SelectLead', { selectLeadId: created.id });
    } catch {
      // Error handled by context
    }
  }

  return (
    <Screen 
      title="New Lead"
      footer={
        <StickyFooter
          // ✅ تحويل الأزرار إلى صيغة actions[] المتوافقة مع StickyFooter الجديد
          actions={[
             {
                label: loading ? 'Saving...' : 'Save Lead',
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
      {/* ✅ استخدام error مباشرة */}
      {!!error && <Banner variant="error" text={error} />}

      <Card>
        <Text style={styles.title}>Basic Info</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Business / Lead Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cafe Milano"
            style={styles.input}
            autoFocus
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Business Type</Text>
          <TextInput
            value={businessType}
            onChangeText={setBusinessType}
            placeholder="e.g. Restaurant, Clinic"
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Phone Numbers</Text>
          <TextInput
            value={phones}
            onChangeText={setPhones}
            placeholder="+966..., 050... (Separated by comma)"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '800', fontSize: 16, marginBottom: 12, color: '#111827' },
  field: { marginBottom: 16 },
  label: { marginBottom: 6, color: '#4b5563', fontSize: 14, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, backgroundColor: '#fff', fontSize: 16,
  },
});
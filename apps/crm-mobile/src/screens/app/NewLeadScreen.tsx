import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useLeadsCtx } from '../../state/LeadsContext';

export function NewLeadScreen({ navigation, route }: any) {
  const { createLead, loading, error } = useLeadsCtx() as any;
  const [name, setName] = useState(route.params?.prefillName ?? '');
  const [phones, setPhones] = useState('');
  const [businessType, setBusinessType] = useState('');

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  async function onSubmit() {
    console.log("[UI] Submit triggered. Validating inputs...");
    if (!canSubmit || loading) return;

    try {
      const phonesArr = phones.split(/[,\n]/g).map(p => p.trim()).filter(Boolean);
      console.log("[UI] Prepared Phone Array:", phonesArr);

      console.log("[UI] Calling createLead Context function...");
      const newId = await createLead({
        name: name.trim(),
        businessType: businessType.trim() || undefined,
        phones: phonesArr.length > 0 ? phonesArr : undefined,
      });

      console.log(`[UI] ✅ Lead saved successfully. ID: ${newId}. Navigating to SelectLead...`);
      navigation.navigate('SelectLead', { selectLeadId: newId });

    } catch (e: any) {
      console.error("[UI] ❌ Error in onSubmit flow:", e.message);
    }
  }

  const footer = (
    <StickyFooter
      actions={[
        {
          label: loading ? 'Saving...' : 'Save Lead',
          variant: 'primary',
          disabled: !canSubmit || loading,
          onPress: () => {
            console.log("--- Save Button Clicked ---");
            void onSubmit();
          },
        },
        { label: 'Back', variant: 'outline', onPress: () => navigation.goBack() },
      ]}
    />
  );

  return (
    <Screen footer={footer}>
      <ScrollView style={styles.container}>
        {error && <Banner variant="error" text={error} />}
        <Card>
          <Text style={styles.title}>Lead info</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Business name *</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g. Cafe Milano" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Business type</Text>
            <TextInput value={businessType} onChangeText={setBusinessType} style={styles.input} placeholder="e.g. Restaurant" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Phones</Text>
            <TextInput value={phones} onChangeText={setPhones} style={styles.input} keyboardType="phone-pad" placeholder="Enter phone numbers" />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontWeight: '900', fontSize: 18, marginBottom: 8, color: '#111827' },
  field: { marginTop: 16 },
  label: { marginBottom: 8, color: '#4b5563', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#ffffff', color: '#000000' },
});
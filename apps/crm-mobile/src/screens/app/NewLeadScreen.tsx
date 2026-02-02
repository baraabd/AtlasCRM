import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { ExistingClientAlert } from '../../components/feedback/ExistingClientAlert';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { FormField } from '../../components/ui/FormField';
import { SelectInput } from '../../components/ui/SelectInput';
import type { ScreenProps } from '../../navigation/types';
import { useLeadsCtx } from '../../state/LeadsContext';
import { useMetadata } from '../../state/MetadataContext';
import type { Lead } from '../../types/domain';

export function NewLeadScreen({ navigation, route }: ScreenProps<'NewLead'>) {
  const { findLeadsByPhone, leads } = useLeadsCtx();
  const { lookups, isLoading: loadingMetadata } = useMetadata();
  const clientTypes = lookups['CLIENT_TYPE'] || [];

  const [name, setName] = useState(route.params?.prefillName ?? '');
  const [phone, setPhone] = useState('');
  const [typeCode, setTypeCode] = useState('');

  const [exactMatch, setExactMatch] = useState<Lead | null>(null);
  
  const [phoneDuplicates, setPhoneDuplicates] = useState<Lead[]>([]);

  const handleNameBlur = () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setExactMatch(null);
      return;
    }

    const found = leads.find(l => l.name.toLowerCase() === cleanName.toLowerCase());
    setExactMatch(found || null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phone.length >= 8) {
        const found = findLeadsByPhone(phone);
        const filtered = found.filter(l => l.id !== exactMatch?.id);
        setPhoneDuplicates(filtered);
      } else {
        setPhoneDuplicates([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [phone, findLeadsByPhone, exactMatch]);

  const onNameChange = (text: string) => {
    setName(text);
    if (exactMatch) setExactMatch(null); 
  };

  const canSubmit = useMemo(() => {
    if (exactMatch) return false;
    return name.trim().length >= 2 && typeCode !== '' && phone.trim().length >= 9;
  }, [name, typeCode, phone, exactMatch]);

  async function onNext() {
    if (!canSubmit) return;

    const finalCheck = leads.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
    if (finalCheck) {
      setExactMatch(finalCheck);
      return;
    }

    navigation.navigate('LocationPicker', {
      tempData: {
        name: name.trim(),
        businessType: typeCode,
        phones: [phone.trim()],
      }
    });
  }

  const getButtonLabel = () => {
    if (phoneDuplicates.length > 0 && !exactMatch) return 'Next: Set Location (New Branch)';
    return 'Next: Set Location';
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
               disabled: !canSubmit,
               onPress: onNext,
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

          <FormField
            label="Business / Lead Name *"
            placeholder="e.g. Al-Amal Furniture"
            value={name}
            onChangeText={onNameChange}
            onBlur={handleNameBlur}
            icon="business-outline"
            error={exactMatch ? " " : undefined}
          />

          {exactMatch && (
            <ExistingClientAlert
              type="danger"
              clientName={exactMatch.name}
              onOpen={() => navigation.replace('SelectLead', { selectLeadId: exactMatch.id })}
            />
          )}

          <SelectInput
            label="Business Type *"
            placeholder={loadingMetadata ? "Loading..." : "Select Business Type"}
            options={clientTypes}
            value={typeCode}
            onSelect={setTypeCode}
          />

          <FormField
            label="Primary Phone Number *"
            placeholder="05xxxxxxx"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
            style={phoneDuplicates.length > 0 ? styles.warningInput : undefined}
          />

          {phoneDuplicates.length > 0 && (
            <ExistingClientAlert
              type="warning"
              clientName={phoneDuplicates[0].name}
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
  warningInput: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
});
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import type { ScreenProps } from '../../screens/_types';
import { useLeadsCtx } from '../../state/LeadsContext';

export function NewLeadScreen({ navigation, route }: ScreenProps<'NewLead'>) {
  const { create, state, error } = useLeadsCtx();

  const [name, setName] = useState(route.params?.prefillName ?? '');
  const [phones, setPhones] = useState('');
  const [businessType, setBusinessType] = useState('');

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  async function onSubmit() {
    if (!canSubmit || state === 'loading') return;

    try {
      const phonesArr = phones
        .split(/[,\n]/g)
        .map((p) => p.trim())
        .filter(Boolean);

      const created = await create({
        name: name.trim(),
        ...(businessType.trim() ? { businessType: businessType.trim() } : {}),
        ...(phonesArr.length ? { phones: phonesArr } : {}),
      });

      // ✅ رجوع إلى SelectLead مع تحديد lead الجديد تلقائيًا
      navigation.navigate('SelectLead', { selectLeadId: created.id });
    } catch {
      // error handled via context (Banner)
    }
  }

  const footer = (
    <StickyFooter
      secondary={{
        label: 'Back',
        variant: 'outline',
        onPress: () =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate('SelectLead'),
      }}
      primary={{
        label: state === 'loading' ? 'Saving...' : 'Save Lead',
        variant: 'primary',
        disabled: !canSubmit || state === 'loading',
        loading: state === 'loading',
        onPress: () => void onSubmit(),
      }}
    />
  );

  return (
    <Screen footer={footer}>
      {state === 'error' && <Banner variant="error" text={error ?? 'Create lead failed'} />}

      <Card>
        <Text style={styles.title}>Lead info</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Business name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cafe Milano"
            autoCapitalize="words"
            style={styles.input}
          />
          {!canSubmit && name.length > 0 && (
            <Text style={styles.err}>Name must be at least 2 characters</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Business type</Text>
          <TextInput
            value={businessType}
            onChangeText={setBusinessType}
            placeholder="e.g. Cafe / Dental / Salon"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phones</Text>
          <TextInput
            value={phones}
            onChangeText={setPhones}
            placeholder="+46..., +963... (comma or new line)"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '900', fontSize: 16 },
  field: { marginTop: 12 },
  label: { marginBottom: 6, color: '#6b7280' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  err: { marginTop: 6, color: '#ef4444' },
});

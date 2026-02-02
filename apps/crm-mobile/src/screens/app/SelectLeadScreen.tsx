import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { SearchField } from '../../components/ui/SearchField';
import type { ScreenProps } from '../../navigation/types';
import { useLeadsCtx } from '../../state/LeadsContext';

export function SelectLeadScreen({ navigation, route }: ScreenProps<'SelectLead'>) {
  // استخدام المسميات الصحيحة التي يوفرها الـ Context
  const { loading, error, leads, refreshLeads } = useLeadsCtx();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[SELECT_LEAD] Refreshing leads list...');
    const id = route.params?.selectLeadId;
    void refreshLeads(); // ✅ استدعاء الدالة الصحيحة
    if (id) setSelectedId(id);
  }, [route.params?.selectLeadId, refreshLeads]); // ✅ تصحيح مصفوفة الاعتماديات

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = leads ?? []; // ضمان عدم وجود مصفوفة undefined لتجنب خطأ length
    if (!q) return items;

    return items.filter((l: any) => {
      const name = (l.name ?? '').toLowerCase();
      const phonesText = Array.isArray(l.phones) ? l.phones.join(' ').toLowerCase() : '';
      return name.includes(q) || phonesText.includes(q);
    });
  }, [leads, query]);

  // تحديث نظام الـ Footer ليستخدم مصفوفة actions المتوافقة مع الـ Component
  const footer = (
    <StickyFooter
      actions={[
        {
          label: 'Start Visit',
          disabled: !selectedId,
          variant: 'primary',
          onPress: () => {
            if (selectedId) navigation.navigate('StartVisitProof', { leadId: selectedId, source: 'list' });
          },
        },
        {
          label: '+ New Lead',
          variant: 'secondary',
          onPress: () => navigation.navigate('NewLead', { returnTo: 'SelectLead' }),
        },
      ]}
    />
  );

  if (loading && (!leads || leads.length === 0)) {
    return (
      <Screen footer={footer}>
        <Skeleton variant="list" count={6} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen footer={footer}>
        <Banner variant="error" text={error} action={{ label: 'Retry', onPress: refreshLeads }} />
      </Screen>
    );
  }

  return (
    <Screen footer={footer}>
      <SearchField label="Search" value={query} onChangeText={setQuery} placeholder="Search by name or phone..." />
      {filtered.length === 0 ? (
        <EmptyState title="No leads found" subtitle="Add a new lead to start a visit." />
      ) : (
        <View style={styles.list}>
          {filtered.map((lead: any) => {
            const selected = lead.id === selectedId;
            return (
              <Pressable key={lead.id} onPress={() => setSelectedId(lead.id)}>
                <Card>
                  <View style={styles.row}>
                    <View style={styles.content}>
                      <Text style={styles.name}>{lead.name}</Text>
                      <Text style={styles.sub}>{(lead as any).businessType ?? '—'}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioOn]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: '#111827' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827' },
});
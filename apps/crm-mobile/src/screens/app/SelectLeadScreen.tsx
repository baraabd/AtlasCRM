import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { SearchField } from '../../components/ui/SearchField';
import type { ScreenProps } from '../../screens/_types';
import { useLeadsCtx } from '../../state/LeadsContext';

export function SelectLeadScreen({ navigation, route }: ScreenProps<'SelectLead'>) {
  const { state, error, items, refresh } = useLeadsCtx();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ✅ إذا رجعنا من NewLead ومعنا selectLeadId نحدده تلقائيًا
  useEffect(() => {
    const id = route.params?.selectLeadId;
    if (!id) return;
    setSelectedId(id);
    // لا داعي لمسح params هنا، ليست مشكلة لو بقيت
  }, [route.params?.selectLeadId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((l) => {
      const name = (l.name ?? '').toLowerCase();
      const phonesText = Array.isArray((l as any).phones)
        ? ((l as any).phones as string[]).join(' ').toLowerCase()
        : '';
      return name.includes(q) || phonesText.includes(q);
    });
  }, [items, query]);

  const footer = (
    <StickyFooter
      secondary={{
        label: '+ New Lead',
        variant: 'secondary',
        onPress: () => navigation.navigate('NewLead', { returnTo: 'SelectLead' }),
      }}
      primary={{
        label: 'Start Visit',
        disabled: !selectedId,
        onPress: () => {
          if (!selectedId) return;
          navigation.navigate('StartVisitProof', { leadId: selectedId, source: 'list' });
        },
      }}
    />
  );

  // ✅ Skeleton فقط إذا لا يوجد بيانات أصلًا
  if (state === 'loading' && items.length === 0) {
    return (
      <Screen footer={footer}>
        <Skeleton variant="list" count={6} />
      </Screen>
    );
  }

  if (state === 'error') {
    return (
      <Screen footer={footer}>
        <Banner
          variant="error"
          text={error ?? 'Failed to load leads'}
          action={{ label: 'Retry', onPress: refresh }}
        />
      </Screen>
    );
  }

  return (
    <Screen footer={footer}>
      <SearchField
        label="Search"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or phone..."
      />

      {filtered.length === 0 ? (
        <EmptyState title="No leads found" subtitle="Add a new lead to start a visit." />
      ) : (
        <View style={styles.list}>
          {filtered.map((lead) => {
            const selected = lead.id === selectedId;

            const businessType = (lead as any).businessType as string | undefined;
            const distanceM = (lead as any).distanceM as number | undefined;

            const metaLeft = businessType ?? '—';
            const distance = typeof distanceM === 'number' ? `${Math.round(distanceM)}m` : null;

            const firstPhone = Array.isArray((lead as any).phones)
              ? ((lead as any).phones as string[])[0]
              : null;

            return (
              <Pressable
                key={lead.id}
                onPress={() => setSelectedId(lead.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Card>
                  <View style={styles.row}>
                    <View style={styles.content}>
                      <Text style={styles.name}>{lead.name}</Text>

                      <Text style={styles.sub}>
                        {metaLeft}
                        {distance ? ` • ${distance}` : ''}
                      </Text>

                      {!!firstPhone && <Text style={styles.phone}>{firstPhone}</Text>}
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
  phone: { marginTop: 6, fontSize: 12, color: '#6b7280' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: '#111827' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827' },
});

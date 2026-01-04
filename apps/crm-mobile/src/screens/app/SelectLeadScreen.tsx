import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { SearchField } from '../../components/ui/SearchField';
import { useVisitFlow } from '../../hooks/useVisitFlow';
import type { ScreenProps } from '../../screens/_types';

export function SelectLeadScreen({ navigation }: ScreenProps<'SelectLead'>) {
  const { leads, actions } = useVisitFlow();

  useEffect(() => {
    void actions.refreshLeads();
  }, [actions]);

  const filtered = useMemo(() => {
    const q = leads.query.trim().toLowerCase();
    if (!q) return leads.items;
    return leads.items.filter((l) => l.name.toLowerCase().includes(q));
  }, [leads.items, leads.query]);

  const footer = (
    <StickyFooter
      primary={{
        label: 'Start Visit',
        disabled: !leads.selectedLeadId,
        onPress: () => {
          const leadId = leads.selectedLeadId!;
          navigation.navigate('StartVisitProof', { leadId });

        },
      }}
      secondary={{
        label: '+ New Lead',
        variant: 'secondary',
        onPress: () => navigation.navigate('Dashboard'),
      }}
    />
  );

  if (leads.state === 'loading') {
    return (
      <Screen title="Start Visit" footer={footer}>
        <Skeleton variant="list" count={6} />
      </Screen>
    );
  }

  if (leads.state === 'error') {
    return (
      <Screen title="Start Visit" footer={footer}>
        <Banner
          variant="error"
          text={leads.error?.message ?? 'Failed to load leads'}
          action={{ label: 'Retry', onPress: actions.refreshLeads }}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Start Visit" footer={footer}>
      {leads.offline && <Banner variant="offline" text="Offline mode. Cached leads only." />}

      <SearchField label="Search" value={leads.query} onChangeText={actions.setQuery} placeholder="Search leads..." />

      {filtered.length === 0 ? (
        <EmptyState title="No leads found" subtitle="Add a new lead to start a visit." />
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((lead) => {
            const selected = lead.id === leads.selectedLeadId;
            return (
              <Pressable key={lead.id} onPress={() => actions.selectLead(lead.id)}>
                <Card>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{lead.name}</Text>
                      <Text style={styles.sub}>{lead.businessType ?? '—'} • {(lead.distanceM ?? 0)}m</Text>
                    </View>
                    <Text style={[styles.pill, selected && styles.pillOn]}>{selected ? 'Selected' : 'Select'}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f3f4f6', fontWeight: '700' },
  pillOn: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
});

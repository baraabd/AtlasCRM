import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useDashboard } from '../../hooks/useDashboard';
import type { ScreenProps } from '../../screens/_types';

function formatSec(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export function DashboardScreen({ navigation }: ScreenProps<'Dashboard'>) {
  const { state, offline, error, data, actions } = useDashboard();

  useEffect(() => {
    void actions.refresh();
  }, [actions]);

  const footer = (
    <View style={{ padding: 4 }}>
      <PrimaryButton label="Start Visit" onPress={() => navigation.navigate('SelectLead')} />
    </View>
  );

  if (state === 'loading') {
    return (
      <Screen title="Dashboard" footer={footer}>
        <Skeleton variant="cards" count={4} />
      </Screen>
    );
  }

  if (state === 'error') {
    return (
      <Screen title="Dashboard" footer={footer}>
        <Banner
          variant="error"
          text={error?.message ?? 'Failed to load'}
          action={{ label: 'Retry', onPress: actions.refresh }}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Dashboard" footer={footer}>
      {offline && <Banner variant="offline" text="Offline mode. Showing cached data." />}

      <Card>
        <Text style={styles.h}>Work timer</Text>
        <Text style={styles.big}>{formatSec(data?.workTimerSec ?? 0)}</Text>
        <Text style={styles.sub}>API: {data?.apiHealth ?? '-'}</Text>
      </Card>

      <Card>
        <Text style={styles.h}>Today</Text>
        <Text style={styles.row}>Visits: {data?.stats.visitsToday ?? 0}</Text>
        <Text style={styles.row}>Open deals: {data?.stats.openDeals ?? 0}</Text>
        <Text style={styles.row}>Follow-ups: {data?.stats.followUps ?? 0}</Text>
      </Card>

      {data?.followUpsToday?.length ? (
        <Card>
          <Text style={styles.h}>Follow-ups</Text>
          {data.followUpsToday.map((f) => (
            <Text key={f.id} style={styles.row}>
              {f.title} — {new Date(f.at).toLocaleString()}
            </Text>
          ))}
        </Card>
      ) : (
        <EmptyState title="No follow-ups today" subtitle="You are all set." />
      )}

      <PrimaryButton label="Profile" onPress={() => navigation.navigate('Profile')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  big: { fontSize: 28, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  row: { fontSize: 14, color: '#111827', marginTop: 6 },
});

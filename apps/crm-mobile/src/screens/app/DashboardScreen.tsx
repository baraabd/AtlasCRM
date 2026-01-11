// apps/crm-mobile/src/screens/app/DashboardScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useDashboard } from '../../hooks/useDashboard';
import { runSync } from '../../infra/sync/sync.service'; // استيراد المزامنة
import type { ScreenProps } from '../../screens/_types';

function formatSec(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export function DashboardScreen({ navigation }: ScreenProps<'Dashboard'>) {
  const { state, offline, error, data, actions, message } = useDashboard();

  useEffect(() => {
    void actions.refresh();
  }, [actions]);

  // دالة التعامل مع بدء الزيارة لضمان عدم الانهيار
  const handleStartVisit = () => {
    // 1. الانتقال فوراً (لا ننتظر الإنترنت)
    navigation.navigate('SelectLead');
    
    // 2. محاولة المزامنة "بصمت" خلف الكواليس
    void runSync().catch(err => console.log('[DASHBOARD] background sync skipped:', err));
  };

  const footer = (
    <View style={{ padding: 16 }}>
      <PrimaryButton label="Start Visit" onPress={handleStartVisit} />
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
      {/* ظهور بانر عند انقطاع الإنترنت */}
      {offline && (
        <Banner 
          variant="offline" 
          text="Offline mode. Showing cached data." 
        />
      )}

      <Card>
        <Text style={styles.h}>Work timer</Text>
        <Text style={styles.big}>{formatSec(data?.workTimerSec ?? 0)}</Text>
        <Text style={[styles.sub, { color: message === 'OK' ? '#10b981' : '#ef4444' }]}>
          Server Status: {message ?? 'Checking...'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.h}>Today Summary</Text>
        <Text style={styles.row}>• Visits: {data?.stats.visitsToday ?? 0}</Text>
        <Text style={styles.row}>• Open deals: {data?.stats.openDeals ?? 0}</Text>
        <Text style={styles.row}>• Follow-ups: {data?.stats.followUps ?? 0}</Text>
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

      <View style={{ marginTop: 12 }}>
        <PrimaryButton 
          label="My Profile" 
          onPress={() => navigation.navigate('Profile')} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  big: { fontSize: 28, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  row: { fontSize: 14, color: '#374151', marginTop: 6 },
});
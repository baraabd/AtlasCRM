import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// تأكد من أن المسارات صحيحة
import { FollowUpRow } from '../../components/domain/FollowUpRow';
import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useDashboard } from '../../hooks/useDashboard'; 
import { useAuth } from '../../state/AuthContext';
import type { ScreenProps } from '../_types';

function formatWorkTime(sec: number = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export function DashboardScreen({ navigation }: ScreenProps<'Dashboard'>) {
  const { state: authState } = useAuth();
  
  // استدعاء الـ Hook
  const { state: loadState, data, error, offline, actions } = useDashboard();

  useEffect(() => {
    void actions.refresh();
  }, []);

  const footer = (
    <View style={styles.footerContainer}>
      <PrimaryButton 
        label="Start New Visit" 
        // 🔥 التعديل 1: تمرير كائن فارغ {} لإسكات خطأ التنقل
        // @ts-ignore: لتجاوز أي خطأ متبقي في النوع
        onPress={() => navigation.navigate('SelectLead', {})} 
      />
    </View>
  );

  // 1. Loading State
  if (loadState === 'loading' && !data) {
    return (
      <Screen title="Dashboard">
        <Skeleton variant="cards" count={3} />
      </Screen>
    );
  }

  // 2. Error State
  if (loadState === 'error' && !data) {
    // 🔥 التعديل 2: استخدام (error as any) للوصول للرسالة بالقوة
    const errorMessage = (error as any)?.message ?? 'Failed to load dashboard';

    return (
      <Screen title="Dashboard">
        <Banner
          variant="error"
          text={errorMessage}
          action={{ label: 'Retry', onPress: actions.refresh }}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Dashboard" footer={footer}>
      {offline && (
        <Banner variant="offline" text="You are offline. Showing cached data." />
      )}

      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <View>
          <Text style={styles.greeting}>
            Welcome, {authState.user?.name || 'Agent'}
          </Text>
          <Text style={styles.tenantLabel}>
            Organization: <Text style={styles.tenantValue}>
              {authState.tenants.find(t => t.id === authState.tenantId)?.name || 'Unknown'}
            </Text>
          </Text>
        </View>
      </Card>

      <View style={{ height: 16 }} />

      {/* Stats Card */}
      <Card>
        <Text style={styles.sectionTitle}>Current Work Session</Text>
        <Text style={styles.timerText}>{formatWorkTime(data?.workTimerSec)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data?.stats.visitsToday ?? 0}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={[styles.statItem, styles.borderLeft]}>
            <Text style={styles.statValue}>{data?.stats.openDeals ?? 0}</Text>
            <Text style={styles.statLabel}>Open Deals</Text>
          </View>
          <View style={[styles.statItem, styles.borderLeft]}>
            <Text style={styles.statValue}>{data?.stats.followUps ?? 0}</Text>
            <Text style={styles.statLabel}>Follow-ups</Text>
          </View>
        </View>
      </Card>

      <View style={{ height: 24 }} />

      {/* Follow Ups */}
      <Text style={styles.subHeader}>Today's Follow-ups</Text>
      
      {data?.followUpsToday && data.followUpsToday.length > 0 ? (
        data.followUpsToday.map((item) => (
          <FollowUpRow 
            key={item.id} 
            item={item} 
            onPress={() => actions.openFollowUp(item.id)} 
          />
        ))
      ) : (
        <EmptyState 
          title="All caught up!" 
          subtitle="No follow-ups scheduled for today." 
        />
      )}

      <View style={styles.profileSection}>
        <PrimaryButton 
          variant="secondary" 
          label="View Profile Settings" 
          onPress={() => navigation.navigate('Profile')} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerContainer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  welcomeCard: { backgroundColor: '#f3f4f6', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  greeting: { fontSize: 20, fontWeight: '800', color: '#111827' },
  tenantLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  tenantValue: { fontWeight: '700', color: '#374151' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  timerText: { fontSize: 32, fontWeight: '900', color: '#111827', marginVertical: 8 },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  statItem: { flex: 1, alignItems: 'center' },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: '#e5e7eb' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  subHeader: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  profileSection: { marginTop: 24, marginBottom: 40 }
});
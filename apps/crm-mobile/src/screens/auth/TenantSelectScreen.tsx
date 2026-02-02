import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import type { ScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';

export function TenantSelectScreen({}: ScreenProps<'TenantSelect'>) {
  const { state, actions } = useAuth();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    void actions.loadTenants();
  }, [actions]);

  const handleSelect = async (tenantId: string) => {
    if (selectingId) return;
    setSelectingId(tenantId);
    try {
      await actions.selectTenant(tenantId);
    } catch {
      setSelectingId(null);
    }
  };

  const isLoading = state.tenants.length === 0 && !state.error;

  return (
    <Screen title="Select Workspace">
      {!!state.error && (
        <Banner 
          variant="error" 
          text={state.error} 
          action={{ label: 'Retry', onPress: () => actions.loadTenants() }}
        />
      )}

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Choose the organization you want to access today.
        </Text>
        <Text style={styles.logoutLink} onPress={() => actions.logout()}>
          Logout
        </Text>
      </View>

      {isLoading ? (
        <Skeleton variant="list" count={3} />
      ) : state.tenants.length === 0 ? (
        <EmptyState 
          title="No Organizations" 
          subtitle="You aren't linked to any company yet." 
        />
      ) : (
        <View style={styles.list}>
          {state.tenants.map((tenant) => (
            <Pressable 
              key={tenant.id} 
              onPress={() => handleSelect(tenant.id)}
              disabled={!!selectingId}
            >
              <Card style={[
                styles.card, 
                selectingId === tenant.id && styles.cardActive
              ]}>
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.name}>{tenant.name}</Text>
                    <Text style={styles.sub}>
                      {tenant.industry || 'Workspace'}
                    </Text>
                  </View>
                  {selectingId === tenant.id && <ActivityIndicator color="#2563eb" />}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  subtitle: { color: '#6b7280', fontSize: 14, flex: 1 },
  logoutLink: { color: '#ef4444', fontWeight: '600', marginLeft: 10 },
  list: { gap: 12 },
  card: { padding: 16 },
  cardActive: { borderColor: '#2563eb', borderWidth: 1, backgroundColor: '#eff6ff' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 4, color: '#9ca3af', fontSize: 12 },
});
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import type { ScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';

export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const { state, actions } = useAuth();

  return (
    <Screen title="Profile">
      <Card>
        <Text style={styles.sectionTitle}>User Info</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{state.user?.name || '—'}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{state.user?.email || '—'}</Text>
        </View>
        
        <View style={styles.separator} />

        <View style={styles.row}>
            <Text style={styles.label}>Organization</Text>
            <Text style={styles.value}>
                {state.tenants.find(t => t.id === state.tenantId)?.name || '—'}
            </Text>
        </View>
      </Card>

      <View style={styles.spacer} />

      <PrimaryButton 
        label="Go Back" 
        variant="secondary" 
        onPress={() => navigation.goBack()} 
      />

      <View style={ styles.spacer } />

      <PrimaryButton 
        label="Logout" 
        variant="outline" 
        onPress={() => actions.logout()} 
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#6b7280', fontSize: 14 },
  value: { fontWeight: '600', color: '#111827', fontSize: 14 },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  spacer: { height: 12 },
});
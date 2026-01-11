// apps/crm-mobile/src/screens/app/ProfileScreen.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import type { ScreenProps } from '../../screens/_types';

export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  return (
    <Screen title="Profile">
      <Card>
        <Text style={styles.userName}>Baraa</Text>
        <Text style={styles.userRole}>Role: Agent</Text>
      </Card>

      <PrimaryButton label="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  userName: { 
    fontSize: 18, 
    fontWeight: '900' 
  },
  userRole: { 
    marginTop: 6, 
    color: '#6b7280' 
  },
});
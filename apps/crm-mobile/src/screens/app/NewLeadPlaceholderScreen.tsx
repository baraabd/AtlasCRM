import React from 'react';
import { Text } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import type { ScreenProps } from '../../screens/_types';

export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  return (
    <Screen title="Profile">
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '900' }}>Baraa</Text>
        <Text style={{ marginTop: 6, color: '#6b7280' }}>Role: Agent</Text>
      </Card>

      <PrimaryButton label="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </Screen>
  );
}

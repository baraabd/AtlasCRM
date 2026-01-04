import React from 'react';
import { Text } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import type { ScreenProps } from '../../screens/_types';

export function NewLeadScreen({ navigation }: ScreenProps<'NewLead'>) {
  return (
    <Screen>
      <Text>New Lead will be implemented in Sprint 2 (Step S2-3).</Text>
      <Text onPress={() => navigation.goBack()} style={{ marginTop: 12, fontWeight: '900' }}>
        Back
      </Text>
    </Screen>
  );
}

import React from 'react';
import { Text } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import type { ScreenProps } from '../../screens/_types';

export function EndVisitScreen({ navigation, route }: ScreenProps<'EndVisit'>) {
  return (
    <Screen>
      <Text>End Visit will be implemented in Sprint 2 (Step S2-4).</Text>
      <Text style={{ marginTop: 8 }}>visitId: {route.params.visitId}</Text>
      <Text style={{ marginTop: 8 }}>leadId: {route.params.leadId}</Text>

      <Text onPress={() => navigation.goBack()} style={{ marginTop: 12, fontWeight: '900' }}>
        Back
      </Text>
    </Screen>
  );
}

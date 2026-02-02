import React from 'react';
import { Text } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import type { ScreenProps } from '../../navigation/types';

export function EndVisitScreen({ route }: ScreenProps<'EndVisit'>) {
  return (
    <Screen>
      <Text>visitId: {route.params.visitId}</Text>
      <Text>leadId: {route.params.leadId}</Text>
    </Screen>
  );
}

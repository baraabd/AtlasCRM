import React from 'react';
import { Text } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useVisitFlow } from '../../hooks/useVisitFlow';
import type { ScreenProps } from '../../screens/_types';

export function StartVisitProofScreen({ navigation, route }: ScreenProps<'StartVisitProof'>) {
  const { actions } = useVisitFlow();
  const { leadId } = route.params;

  const footer = (
    <StickyFooter
      primary={{
        label: 'Start Visit',
        onPress: async () => {
          const r = await actions.startVisit(leadId);
          navigation.replace('VisitLive', { visitId: r.visitId, leadId });
        },
      }}
      secondary={{
        label: 'Back',
        variant: 'outline',
        onPress: () => navigation.goBack(),
      }}
    />
  );

  return (
    <Screen title="Start Visit Proof" footer={footer}>
      <Card>
        <Text>Lead ID: {leadId}</Text>
        <Text>Proof screen will be implemented in Sprint 2 exactly as designed.</Text>
      </Card>
    </Screen>
  );
}

// apps/crm-mobile/src/screens/app/StartVisitProofScreen.tsx

import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useVisitFlow } from '../../hooks/useVisitFlow';
import type { ScreenProps } from '../../screens/_types';

export function StartVisitProofScreen({ navigation, route }: ScreenProps<'StartVisitProof'>) {
  const { actions } = useVisitFlow();
  const { leadId } = route.params;

  // ✅ تصحيح البنية لتستخدم actions[] بدلاً من primary/secondary لإصلاح الخطأ TS2322
  const footer = (
    <StickyFooter
      actions={[
        {
          label: 'Start Visit',
          variant: 'primary',
          onPress: async () => {
            console.log(`[PROOF] Starting visit for lead: ${leadId}`);
            try {
              const r = await actions.startVisit(leadId);
              navigation.replace('VisitLive', { visitId: r.visitId, leadId });
            } catch (err) {
              console.error('[PROOF] Failed to start visit:', err);
            }
          },
        },
        {
          label: 'Back',
          variant: 'outline',
          onPress: () => navigation.goBack(),
        },
      ]}
    />
  );

  return (
    <Screen title="Start Visit Proof" footer={footer}>
      <Card>
        <Text style={styles.label}>Lead ID:</Text>
        <Text style={styles.value}>{leadId}</Text>
        <Text style={styles.info}>
          Proof screen will be implemented in Sprint 2 exactly as designed.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: 'bold', color: '#4b5563' },
  value: { fontSize: 16, marginBottom: 12, color: '#111827' },
  info: { fontSize: 14, color: '#6b7280', fontStyle: 'italic' }
});
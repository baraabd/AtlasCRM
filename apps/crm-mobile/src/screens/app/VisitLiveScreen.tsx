// apps/crm-mobile/src/screens/app/VisitLiveScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { useVisitFlow } from '../../hooks/useVisitFlow';
import type { ScreenProps } from '../../navigation/types';

function formatSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VisitLiveScreen({ navigation, route }: ScreenProps<'VisitLive'>) {
  const { live, actions } = useVisitFlow();

  useEffect(() => {
    const t = setInterval(() => actions.tick(), 1000);
    return () => clearInterval(t);
  }, [actions]);

  const right = (
    <OutlineButton
      label="End"
      onPress={() => navigation.navigate('SelectLead', {})}
    />
  );

  return (
    <Screen title="Visit Live" right={right}>
      {live.error && <Banner variant="error" text={live.error.message} />}

      <Card>
        <Text style={styles.statusTitle}>Visit in progress</Text>
        <Text style={styles.timer}>{formatSec(live.elapsedSec)}</Text>
        <Text style={styles.ids}>
          visitId: {route.params.visitId} • leadId: {route.params.leadId}
        </Text>
      </Card>

      <Card>
        <Text style={styles.actionTitle}>Actions</Text>
        <View style={styles.spacer} />
        <OutlineButton 
          label="Create Deal" 
          onPress={() => navigation.navigate('CreateDeal', { leadId: route.params.leadId, visitId: route.params.visitId })} 
        />
        <View style={styles.spacer} />
        <OutlineButton 
          label="Deal Details (sample)" 
          onPress={() => navigation.navigate('DealDetails', { dealId: 'deal_sample' })} 
        />
      </Card>
    </Screen>
  );
}

// ✅ تم تعريف كافة التنسيقات هنا لإصلاح تحذيرات الـ Lint
const styles = StyleSheet.create({
  statusTitle: { 
    fontWeight: '800', 
    fontSize: 16 
  },
  timer: { 
    marginTop: 8, 
    fontSize: 28, 
    fontWeight: '900' 
  },
  ids: { 
    marginTop: 8, 
    color: '#6b7280' 
  },
  actionTitle: { 
    fontWeight: '800' 
  },
  spacer: { 
    height: 10 
  },
});
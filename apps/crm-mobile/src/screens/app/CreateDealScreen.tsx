import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

import { useDeals } from '../..//hooks/useDeals';
import { Banner } from '../../components/feedback/Banner';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import type { ScreenProps } from '../../screens/_types';

export function CreateDealScreen({ navigation, route }: ScreenProps<'CreateDeal'>) {
  const { create, actions } = useDeals({ leadId: route.params.leadId, visitId: route.params.visitId });

  useEffect(() => {
    void actions.loadCatalog();
  }, [actions]);

  const discountExceeded = create.draft.discountType === 'PERCENT' && create.draft.discountValue > create.policy.agentMaxPct;

  const footer = (
    <StickyFooter
      actions={[
        {
          label: discountExceeded ? 'Request approval (Sprint 2)' : 'Create deal',
          variant: 'primary',
          onPress: async () => {
            const r = await actions.submitDeal();
            navigation.replace('DealDetails', { dealId: r.dealId });
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

  if (create.catalogState === 'loading') {
    return (
      <Screen title="Create Deal" footer={footer}>
        <Skeleton variant="list" count={8} />
      </Screen>
    );
  }

  return (
    <Screen title="Create Deal" footer={footer}>
      {discountExceeded && <Banner variant="warning" text="Discount exceeds limit." />}
      <Card>
        <Text style={{ fontWeight: '900', fontSize: 16 }}>Services</Text>
        {(create.catalog ?? []).map((svc: any) => (
          <Pressable key={svc.id} onPress={() => actions.toggleService(svc.id)} style={{ paddingVertical: 10 }}>
            <Text style={{ fontWeight: '800' }}>
              {create.draft.selections.some((s: any) => s.serviceId === svc.id) ? '✅ ' : '⬜ '} {svc.name}
            </Text>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
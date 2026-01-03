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

  const discountExceeded =
    create.draft.discountType === 'PERCENT' && create.draft.discountValue > create.policy.agentMaxPct;

  const footer = (
    <StickyFooter
      primary={{
        label: discountExceeded ? 'Request approval (Sprint 2)' : 'Create deal',
        onPress: async () => {
          const r = await actions.submitDeal();
          navigation.replace('DealDetails', { dealId: r.dealId });
        },
      }}
      secondary={{
        label: 'Back',
        variant: 'outline',
        onPress: () => navigation.goBack(),
      }}
    />
  );

  if (create.catalogState === 'loading') {
    return (
      <Screen title="Create Deal" footer={footer}>
        <Skeleton variant="list" count={8} />
      </Screen>
    );
  }

  if (create.catalogState === 'error') {
    return (
      <Screen title="Create Deal" footer={footer}>
        <Banner variant="error" text={create.error?.message ?? 'Failed to load catalog'} action={{ label: 'Retry', onPress: actions.loadCatalog }} />
      </Screen>
    );
  }

  return (
    <Screen title="Create Deal" footer={footer}>
      {discountExceeded && (
        <Banner variant="warning" text={`Discount exceeds limit (${create.policy.agentMaxPct}%). Approval flow will be in Sprint 2.`} />
      )}

      <Card>
        <Text style={{ fontWeight: '900', fontSize: 16 }}>Services</Text>
        <View style={{ height: 10 }} />
        {create.catalog.map((svc) => {
          const selected = create.draft.selections.some((s) => s.serviceId === svc.id);
          return (
            <Pressable key={svc.id} onPress={() => actions.toggleService(svc.id)} style={{ paddingVertical: 10 }}>
              <Text style={{ fontWeight: '800' }}>
                {selected ? '✅ ' : '⬜ '} {svc.name} — {svc.basePrice}
              </Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>{svc.category}</Text>
            </Pressable>
          );
        })}
      </Card>

      <Card>
        <Text style={{ fontWeight: '900', fontSize: 16 }}>Pricing</Text>
        <Text style={{ marginTop: 8 }}>Subtotal: {create.pricing.subtotal}</Text>
        <Text style={{ marginTop: 4 }}>Discount: {create.pricing.discount}</Text>
        <Text style={{ marginTop: 4, fontWeight: '900' }}>Total: {create.pricing.total}</Text>
      </Card>
    </Screen>
  );
}

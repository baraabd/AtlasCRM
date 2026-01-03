import React, { useEffect } from 'react';

import { Banner } from '../../components/feedback/Banner';
import { Skeleton } from '../../components/feedback/Skeleton';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { useDeals } from '../../hooks/useDeals';
import type { ScreenProps } from '../../screens/_types';

export function DealDetailsScreen({ navigation, route }: ScreenProps<'DealDetails'>) {
  const { details, actions } = useDeals();
  const { dealId } = route.params;

  // ✅ destructure stable callback (prevents infinite loop)
  const { loadDealDetails, setStage } = actions;

  useEffect(() => {
    void loadDealDetails(dealId);
  }, [dealId, loadDealDetails]);

  const right = (
  <OutlineButton
    label="Back"
    onPress={() => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Dashboard');
    }}
  />
);


  if (details.state === 'loading') {
    return (
      <Screen title="Deal Details" right={right}>
        <Skeleton variant="cards" count={4} />
      </Screen>
    );
  }

  if (details.state === 'error') {
    return (
      <Screen title="Deal Details" right={right}>
        <Banner
          variant="error"
          text={details.error?.message ?? 'Failed'}
          action={{ label: 'Retry', onPress: () => loadDealDetails(dealId) }}
        />
      </Screen>
    );
  }

  if (!details.deal) {
    return (
      <Screen title="Deal Details" right={right}>
        <Banner variant="error" text="Deal not found" />
      </Screen>
    );
  }

  return (
    <Screen title="Deal Details" right={right}>
      <Card>
        <Card>
          {/* double Card is not necessary; keep one if you prefer */}
        </Card>
      </Card>

      <Card>
        <Banner variant="info" text={`Lead: ${details.deal.leadName}`} />
      </Card>

      <Card>
        <Banner variant="success" text={`Stage: ${details.deal.stage} • Value: ${details.deal.finalValue}`} />
      </Card>

      <Card>
        <OutlineButton label="Set stage: Negotiation" onPress={() => void setStage('NEGOTIATION')} />
        <OutlineButton label="Set stage: Won" onPress={() => void setStage('WON')} />
      </Card>
    </Screen>
  );
}

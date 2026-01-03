import { useCallback, useMemo, useState } from 'react';

import type {
  AppError,
  Deal,
  DealDraft,
  DiscountPolicy,
  LoadState,
  ServiceItem,
  Stage,
} from '../types/domain';


export type UseDealsResult = {
  create: {
    catalogState: LoadState;
    catalog: ServiceItem[];
    policy: DiscountPolicy;
    draft: DealDraft;
    pricing: { subtotal: number; discount: number; total: number; currency: string };
    error: AppError | null;
  };

  details: {
    state: LoadState;
    deal: Deal | null;
    error: AppError | null;
  };

  actions: {
    loadCatalog: () => Promise<void>;
    toggleService: (serviceId: string) => void;
    setDiscount: (value: number, type: 'PERCENT' | 'AMOUNT') => void;
    submitDeal: () => Promise<{ dealId: string }>;

    loadDealDetails: (dealId: string) => Promise<void>;
    setStage: (stage: Stage) => Promise<void>;
  };
};

const mockCatalog: ServiceItem[] = [
  { id: 'svc_gbp', name: 'Google Business Profile Setup', basePrice: 900, category: 'GBP' },
  { id: 'svc_reviews', name: 'Reviews QR + Direct Link', basePrice: 250, category: 'GBP' },
  { id: 'svc_social', name: 'Social Media Setup', basePrice: 500, category: 'Social' },
  { id: 'svc_ads', name: 'Local Ads Campaign', basePrice: 1500, category: 'Ads' },
];

export function useDeals(params: { leadId?: string; visitId?: string } = {}): UseDealsResult {
  const [catalogState, setCatalogState] = useState<LoadState>('idle');
  const [catalog, setCatalog] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<AppError | null>(null);

  const [policy] = useState<DiscountPolicy>({ agentMaxPct: 10, allowOverride: true });

  const [draft, setDraft] = useState<DealDraft>({
    leadId: params.leadId ?? '',
    visitId: params.visitId,
    selections: [],
    discountValue: 0,
    discountType: 'PERCENT',
  });

  const [detailsState, setDetailsState] = useState<LoadState>('idle');
  const [deal, setDeal] = useState<Deal | null>(null);
  const [detailsError, setDetailsError] = useState<AppError | null>(null);

  const pricing = useMemo(() => {
    const subtotal = draft.selections.reduce((sum, s) => {
      const item = catalog.find((c) => c.id === s.serviceId);
      return sum + (item?.basePrice ?? 0);
    }, 0);

    const discount =
      draft.discountType === 'PERCENT'
        ? Math.round((subtotal * draft.discountValue) / 100)
        : draft.discountValue;

    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total, currency: 'USD' };
  }, [draft, catalog]);

  const loadCatalog = useCallback(async () => {
    try {
      setCatalogState('loading');
      setError(null);
      setCatalog(mockCatalog);
      setCatalogState(mockCatalog.length ? 'ready' : 'empty');
    } catch (e: any) {
      setError({ message: e?.message ?? 'Failed to load catalog', recoverable: true });
      setCatalogState('error');
    }
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setDraft((d) => {
      const exists = d.selections.some((x) => x.serviceId === serviceId);
      const selections = exists
        ? d.selections.filter((x) => x.serviceId !== serviceId)
        : [...d.selections, { serviceId }];
      return { ...d, selections };
    });
  }, []);

  const setDiscount = useCallback((value: number, type: 'PERCENT' | 'AMOUNT') => {
    setDraft((d) => ({ ...d, discountValue: value, discountType: type }));
  }, []);

  const submitDeal = useCallback(async () => {
    const pct = draft.discountType === 'PERCENT' ? draft.discountValue : 0;
    if (pct > policy.agentMaxPct) {
      throw new Error(`Discount exceeds limit (${policy.agentMaxPct}%).`);
    }

    // Mock deal create
    const dealId = `deal_${Date.now()}`;
    return { dealId };
  }, [draft.discountType, draft.discountValue, policy.agentMaxPct]);

  const loadDealDetails = useCallback(
    async (dealId: string) => {
      try {
        setDetailsState('loading');
        setDetailsError(null);

        // Mock deal details
        setDeal({
          id: dealId,
          leadId: params.leadId ?? 'lead_1',
          leadName: 'Cafe Milano',
          stage: 'PROPOSAL',
          finalValue: pricing.total || 900,
          approvalStatus: null,
          lastActivityAt: new Date().toISOString(),
        });

        setDetailsState('ready');
      } catch (e: any) {
        setDetailsError({ message: e?.message ?? 'Failed to load deal', recoverable: true });
        setDetailsState('error');
      }
    },
    [params.leadId, pricing.total],
  );


  const setStage = useCallback(async (stage: Stage) => {
    setDeal((d) => (d ? { ...d, stage } : d));
  }, []);

   // ✅ FIX: actions memoized so it does NOT change every render
  const actions = useMemo(
    () => ({
      loadCatalog,
      toggleService,
      setDiscount,
      submitDeal,
      loadDealDetails,
      setStage,
    }),
    [loadCatalog, toggleService, setDiscount, submitDeal, loadDealDetails, setStage],
  );

  return {
    create: { catalogState, catalog, policy, draft, pricing, error },
    details: { state: detailsState, deal, error: detailsError },
    actions,
  };
}

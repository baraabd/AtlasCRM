import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Dashboard: undefined;

  SelectLead: { selectLeadId?: string } | undefined;
  NewLead: { prefillName?: string; returnTo?: 'SelectLead' } | undefined;

  StartVisitProof: { leadId: string; source?: 'list' | 'search' };

  VisitLive: { visitId: string; leadId: string };
  EndVisit: { visitId: string; leadId: string };

  CreateDeal: { visitId: string; leadId: string };
  DealDetails: { dealId: string; leadId?: string };

  Profile: undefined;
};

export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

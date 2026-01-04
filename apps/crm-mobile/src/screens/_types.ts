import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Dashboard: undefined;
  Profile: undefined;

  SelectLead: undefined;
  NewLead: { returnTo?: 'SelectLead' } | undefined;

  StartVisitProof: { leadId: string };
  VisitLive: { leadId: string; visitId: string };
  EndVisit: { leadId: string; visitId: string };

  CreateDeal: { leadId: string; visitId: string };
  DealDetails: { dealId: string };
};

export type ScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;
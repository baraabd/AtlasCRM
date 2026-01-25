// apps/crm-mobile/src/navigation/types.ts

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  TenantSelect: undefined;
  Dashboard: undefined;
  Profile: undefined;
  
  // ✅ إضافة returnTo و selectLeadId
  SelectLead: { selectLeadId?: string; returnTo?: string };
  
  // ✅ إضافة prefillName و returnTo
  NewLead: { prefillName?: string; returnTo?: string };
  
  // ✅ إضافة البراميترات الناقصة
  StartVisitProof: { leadId: string; source?: string };
  VisitLive: { visitId: string; leadId: string };
  EndVisit: { visitId: string; leadId: string };
  CreateDeal: { leadId: string; visitId: string };
  DealDetails: { dealId: string };
} & AuthStackParamList;

export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
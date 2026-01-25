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
  
  // ✅ تحديث الأنواع لتكون دقيقة
  SelectLead: { selectLeadId?: string; returnTo?: string };
  
  NewLead: { prefillName?: string; returnTo?: string };
  
  // ✅ إضافة البراميترات الناقصة حسب الأخطاء التي ظهرت
  StartVisitProof: { leadId: string; source?: string };
  VisitLive: { visitId: string; leadId: string };
  EndVisit: { visitId: string; leadId: string };
  CreateDeal: { leadId: string; visitId: string };
  DealDetails: { dealId: string };
} & AuthStackParamList;

export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
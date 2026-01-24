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
  
  // ✅ التغيير هنا: إزالة "| undefined" ليعرف TypeScript أن المعاملات اختيارية
  SelectLead: { selectLeadId?: string }; 
  
  NewLead: { prefillName?: string };
  StartVisitProof: { leadId: string };
  VisitLive: { visitId: string };
  EndVisit: { visitId: string };
  CreateDeal: { leadId: string; visitId?: string };
  DealDetails: { dealId: string };
} & AuthStackParamList;

export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
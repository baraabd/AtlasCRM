// apps/crm-mobile/src/navigation/types.ts

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined; // ✅ تم دمج كل الشاشات هنا
};

export type AppStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  TenantSelect: undefined;
  Dashboard: undefined;
  Profile: undefined;
  SelectLead: { selectLeadId?: string; returnTo?: string };
  NewLead: { returnTo?: string; prefillName?: string };
  StartVisitProof: { leadId: string; source: 'list' | 'map' };
  VisitLive: { visitId: string; leadId: string };
  CreateDeal: { leadId: string; visitId: string };
  DealDetails: { dealId: string };
};
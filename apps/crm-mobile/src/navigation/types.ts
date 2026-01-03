import type { Stage } from '../types/domain';

export type RootStackParamList = {
  Splash: undefined; // لاحقًا
  Language: undefined; // لاحقًا
  AuthChoice: undefined; // لاحقًا
  RegisterEmail: undefined; // لاحقًا
  Login: undefined; // لاحقًا
  ForgotPassword: undefined; // لاحقًا
  UploadIdentity: undefined; // لاحقًا
  CompanySelect: undefined; // لاحقًا
  RoleInfo: undefined; // لاحقًا

  ClockIn: undefined; // لاحقًا
  Dashboard: undefined;
  Break: undefined; // لاحقًا
  ClockOutSummary: undefined; // لاحقًا

  SelectLead: undefined;
  StartVisitProof: { leadId: string; source?: 'map' | 'list' };
  LeadFormCreate: { source?: 'visit' | 'lead' }; // لاحقًا
  LeadFormEdit: { leadId: string }; // لاحقًا
  VisitLive: { visitId: string; leadId: string };
  EndVisitOutcome: { visitId: string; leadId: string }; // لاحقًا

  CreateDeal: { leadId: string; visitId?: string };
  DiscountApproval: { dealDraftId: string }; // لاحقًا
  DealDetails: { dealId: string };
  CreateFollowUp: { leadId?: string; dealId?: string; visitId?: string }; // لاحقًا
  FollowUpSuccess: { returnTo: 'deal' | 'dashboard'; dealId?: string }; // لاحقًا

  MapView: undefined; // لاحقًا
  DealsList: { stage?: Stage }; // لاحقًا
  Profile: undefined;
  WorkDayDetails: { date: string }; // لاحقًا
};

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// 1. شاشات المصادقة (Auth)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// ✅ نوع موحّد للبيانات المؤقتة قبل الحفظ
export type LeadTempData = {
  name: string;
  businessType: string;
  phones: string[];
};

// 2. شاشات التطبيق الأساسية (App)
export type AppStackParamList = {
  TenantSelect: undefined;
  Dashboard: undefined;
  Profile: undefined;

  // Leads
  SelectLead: { selectLeadId?: string; returnTo?: string };
  NewLead: { prefillName?: string; returnTo?: string } | undefined;

  // ✅ الخريطة والموقع
  LocationPicker: {
    tempData: LeadTempData;
  };

  // Visits & Deals
  StartVisitProof: { leadId: string; source?: string };
  VisitLive: { visitId: string; leadId: string };
  EndVisit: { visitId: string; leadId: string };
  CreateDeal: { leadId: string; visitId: string };
  DealDetails: { dealId: string };
} & AuthStackParamList;

// 3. Helper Type
export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;

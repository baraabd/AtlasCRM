export type Stage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;
export type LoadState = 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'offline';

export type Lead = {
  id: string;
  serverId?: string | null; // أضفت هذا للحفاظ على التوافق
  name: string;
  businessType?: string | null;
  phones?: string[];        // تم التوحيد على phones ومصفوفة
  phoneNumber?: string;
  address?: string | null;
  distanceM?: number | null;
  hasOpenDeal?: boolean;
};

// ... باقي الأنواع (Deal, Visit, etc) كما هي في كودك الأصلي ...
export type Deal = {
  id: string;
  leadId: string;
  leadName: string;
  stage: Stage;
  finalValue: number;
  approvalStatus: ApprovalStatus;
  nextFollowupAt?: string | null;
  lastActivityAt: string;
};

export type FollowUp = {
  id: string;
  type: 'CALL' | 'VISIT' | 'MEETING';
  title: string;
  at: string;
  leadId?: string;
  dealId?: string;
};

export type DashboardStats = {
  visitsToday: number;
  openDeals: number;
  followUps: number;
};

export type DashboardData = {
  workTimerSec: number;
  clockedInSince?: string;
  stats: DashboardStats;
  followUpsToday: FollowUp[];
  apiHealth?: string;
};

export type VisitOutcome = 'FOLLOW_UP' | 'WON' | 'LOST' | 'NO_ACTION';

export type Visit = {
  id: string;
  leadId: string;
  startedAt: string;
  endedAt?: string | null;
  durationSec?: number | null;
  outcome?: VisitOutcome | null;
  notes?: string | null;
};

export type AppError = {
  message: string;
  code?: string;
  recoverable?: boolean;
};
// ... (بقيت الأنواع كما هي)
export type DealDraft = {
  leadId: string;
  visitId?: string;
  selections: any[];
  discountValue: number;
  discountType: 'PERCENT' | 'AMOUNT';
};
export type DiscountPolicy = { 
  agentMaxPct: number; 
  allowOverride: boolean; 
};

export interface VisitPresented {
  id: string;
  leadName: string;
  outcome: string;
  createdAt: string;
  // أضف أي حقول أخرى تحتاجها واجهة العرض
}

export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  tenantId?: string;
  tenant?: Tenant;
  avatarUrl?: string;
};

export type Tenant = {
  id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
};

export type AuthStatus = 'booting' | 'signedOut' | 'needsTenant' | 'signedIn';

export type Company = {
  id: string;
  name: string;
  role: 'admin' | 'agent';
};

export type AuthResponse = {
  token: string;
  user: User;
  tenant?: Tenant;
};

export type ApiError = {
  message: string;
  code?: string;
};

// ... الأنواع السابقة (User, AuthResponse)

export type LookupItem = {
  id: number;
  category: string;
  code: string;
  labelAr: string;
  labelEn: string;
  sortOrder: number;
};

export type ServiceItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  basePrice: string; 
  minPrice: string;
};

export type AppMetadata = {
  lookups: Record<string, LookupItem[]>; 
  services: ServiceItem[];
  timestamp: string;
};

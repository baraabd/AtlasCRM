export type Stage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;
export type LoadState = 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'offline';

export type Lead = {
  id: string;
  serverId?: string | null; // أضفت هذا للحفاظ على التوافق
  name: string;
  businessType?: string | null;
  phones?: string[];        // تم التوحيد على phones ومصفوفة
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
export type ServiceItem = { id: string; name: string; basePrice: number; category: string; };
export type DiscountPolicy = { agentMaxPct: number; allowOverride: boolean; };
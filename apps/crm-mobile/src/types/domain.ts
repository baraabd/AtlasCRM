export type Stage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export type LoadState = 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'offline';

export type LatLng = { lat: number; lng: number };

export type Lead = {
  id: string;
  name: string;
  businessType?: string | null;
  distanceM?: number | null;
  phones?: string[];
  location?: LatLng | null;
  lastVisitedAt?: string | null;
  hasOpenDeal?: boolean;
};

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

export type TimeLogSummary = {
  clockInAt: string;
  clockOutAt?: string | null;
  workedMin: number;
  breakMin: number;
  visitsCount: number;
  dealsCreated: number;
};

export type GpsStatus = {
  tone: 'success' | 'warning' | 'error';
  text: string;
  accuracyM?: number;
};

export type AppError = {
  message: string;
  code?: string;
  recoverable?: boolean;
};

export type ButtonSpec = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
};

export type ServiceItem = {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  hasPackages?: boolean;
};

export type ServiceSelection = {
  serviceId: string;
  packageId?: string;
  addonIds?: string[];
};

export type DealDraft = {
  leadId: string;
  visitId?: string;
  selections: ServiceSelection[];
  discountValue: number;
  discountType: 'PERCENT' | 'AMOUNT';
};

export type DiscountPolicy = {
  agentMaxPct: number;
  allowOverride: boolean;
};

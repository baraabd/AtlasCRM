import type { Visit, VisitOutcome, VisitPresented } from '../../types/domain';

import { api } from './api';

export async function startVisit(leadId: string): Promise<Visit> {
  const res = await api.post<Visit>('/v1/visits/start', { leadId });
  return res.data;
}

export type EndVisitInput = {
  outcome?: VisitOutcome;
  presented?: Partial<VisitPresented>;
  notes?: string;
  durationSec?: number;
};

export async function endVisit(visitId: string, input: EndVisitInput): Promise<Visit> {
  const res = await api.patch<Visit>(`/v1/visits/${visitId}/end`, input);
  return res.data;
}

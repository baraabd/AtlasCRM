import type { Lead } from '../../types/domain';

import { api } from './api';

export type CreateLeadInput = {
  name: string;
  businessType?: string;
  phones?: string[];
};

export async function getLeads(): Promise<Lead[]> {
  const res = await api.get<Lead[]>('/leads');
  return res.data;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload: Record<string, unknown> = { name: input.name };

  if (input.businessType?.trim()) payload.businessType = input.businessType.trim();
  if (input.phones?.length) payload.phones = input.phones;

  const res = await api.post<Lead>('/leads', payload);
  return res.data;
}

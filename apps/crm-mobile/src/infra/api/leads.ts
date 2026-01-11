import type { Lead } from '../../types/domain';

import { api } from './api';

export type CreateLeadInput = {
  name: string;
  businessType?: string;
  phone?: string[];
};

export async function getLeads(): Promise<Lead[]> {
  const res = await api.get<Lead[]>('/leads');
  return res.data;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload: Record<string, unknown> = { name: input.name };

  if (input.businessType?.trim()) payload.businessType = input.businessType.trim();
  if (input.phone?.length) payload.phone = input.phone;

  const res = await api.post<Lead>('/leads', payload);
  return res.data;
}

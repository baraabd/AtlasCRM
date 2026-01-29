import { http } from './http';
import type { AppMetadata } from '../../types/domain';

export const metadataApi = {
  fetchMetadata: async (): Promise<AppMetadata> => {
    const res = await http.get<AppMetadata>('/v1/metadata');
    return res.data;
  },
};
import type { AppMetadata } from '../../types/domain';

import { http } from './http';

export const metadataApi = {
  fetchMetadata: async (): Promise<AppMetadata> => {
    const res = await http.get<AppMetadata>('/v1/metadata');
    return res.data;
  },
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { apiConfiguration, formatApiError } from '../infra/api/http';
import { metadataApi } from '../infra/api/metadata';
import { getMetadataCacheKey } from '../infra/api/metadata-cache';
import type { AppMetadata, LookupItem, ServiceItem } from '../types/domain';

import { useAuth } from './AuthContext';

type MetadataContextType = {
  lookups: Record<string, LookupItem[]>;
  services: ServiceItem[];
  isLoading: boolean;
  refreshMetadata: () => Promise<void>;
  getLookupLabel: (category: string, code: string) => string;
};

type MetadataSnapshot = { key: string | null; data: AppMetadata | null; loading: boolean };
const MetadataCtx = createContext<MetadataContextType | null>(null);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const cacheKey = authState.status === 'signedIn'
    ? getMetadataCacheKey(apiConfiguration.baseUrl, authState.user?.id, authState.tenantId)
    : null;
  const [snapshot, setSnapshot] = useState<MetadataSnapshot>({ key: null, data: null, loading: false });
  // Hide a previous account's data immediately, before the cache-loading effect runs.
  const data = snapshot.key === cacheKey && cacheKey ? snapshot.data : null;
  const isLoading = !!cacheKey && (snapshot.key !== cacheKey || snapshot.loading);

  const refreshMetadata = useCallback(async () => {
    if (!cacheKey) return;
    setSnapshot((current) => current.key === cacheKey ? { ...current, loading: true } : current);
    try {
      const metadata = await metadataApi.fetchMetadata();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(metadata));
      setSnapshot((current) => current.key === cacheKey ? { key: cacheKey, data: metadata, loading: false } : current);
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn(formatApiError(error, 'Could not refresh workspace data.'));
      }
    } finally {
      setSnapshot((current) => current.key === cacheKey ? { ...current, loading: false } : current);
    }
  }, [cacheKey]);

  useEffect(() => {
    let active = true;
    setSnapshot({ key: cacheKey, data: null, loading: !!cacheKey });
    if (!cacheKey) return;

    const load = async () => {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (active && cached) {
          const metadata: AppMetadata = JSON.parse(cached);
          if (metadata && Array.isArray(metadata.services) && metadata.lookups) {
            setSnapshot({ key: cacheKey, data: metadata, loading: false });
          }
        }
      } catch {
        // A missing or corrupt cache must not prevent fetching authenticated data.
      }
      if (active) await refreshMetadata();
    };
    void load();
    return () => { active = false; };
  }, [cacheKey, refreshMetadata]);

  const getLookupLabel = (category: string, code: string) => {
    const item = data?.lookups[category]?.find((entry) => entry.code === code);
    return item ? item.labelAr : code;
  };

  return (
    <MetadataCtx.Provider value={{
      lookups: data?.lookups || {},
      services: data?.services || [],
      isLoading,
      refreshMetadata,
      getLookupLabel,
    }}>
      {children}
    </MetadataCtx.Provider>
  );
}

export const useMetadata = () => {
  const ctx = useContext(MetadataCtx);
  if (!ctx) throw new Error('useMetadata must be used within MetadataProvider');
  return ctx;
};

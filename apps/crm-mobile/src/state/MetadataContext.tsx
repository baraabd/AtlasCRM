import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { metadataApi } from '../infra/api/metadata';
import type { AppMetadata, LookupItem, ServiceItem } from '../types/domain';

import { useAuth } from './AuthContext';

const KEY_METADATA = 'app_metadata_cache';

type MetadataContextType = {
  lookups: Record<string, LookupItem[]>;
  services: ServiceItem[];
  isLoading: boolean;
  refreshMetadata: () => Promise<void>;
  getLookupLabel: (category: string, code: string) => string;
};

const MetadataCtx = createContext<MetadataContextType | null>(null);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth(); // نحتاج معرفة هل المستخدم مسجل دخول أم لا
  const [data, setData] = useState<AppMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. تحميل البيانات من الكاش أولاً (للسرعة)
  useEffect(() => {
    const loadCache = async () => {
      const cached = await AsyncStorage.getItem(KEY_METADATA);
      if (cached) {
        setData(JSON.parse(cached));
      }
      setIsLoading(false);
    };
    loadCache();
  }, []);

  // 2. دالة جلب البيانات من السيرفر
  const refreshMetadata = async () => {
    try {
      console.log('🔄 [Metadata] Updating...');
      const newData = await metadataApi.fetchMetadata();
      setData(newData);
      await AsyncStorage.setItem(KEY_METADATA, JSON.stringify(newData));
      console.log('✅ [Metadata] Updated successfully');
    } catch (e) {
      console.error('⚠️ [Metadata] Failed to update (using cache if available)', e);
    }
  };

  // 3. تحديث البيانات تلقائياً عند تسجيل الدخول
  useEffect(() => {
    if (authState.status === 'signedIn') {
      refreshMetadata();
    }
  }, [authState.status]);

  // Helper: جلب النص العربي/الإنجليزي للكود
  const getLookupLabel = (category: string, code: string) => {
    const list = data?.lookups[category] || [];
    const item = list.find((i) => i.code === code);
    return item ? item.labelAr : code; // يمكن تغيير labelAr إلى labelEn حسب اللغة المختارة
  };

  return (
    <MetadataCtx.Provider
      value={{
        lookups: data?.lookups || {},
        services: data?.services || [],
        isLoading,
        refreshMetadata,
        getLookupLabel,
      }}
    >
      {children}
    </MetadataCtx.Provider>
  );
}

export const useMetadata = () => {
  const ctx = useContext(MetadataCtx);
  if (!ctx) throw new Error('useMetadata must be used within MetadataProvider');
  return ctx;
};
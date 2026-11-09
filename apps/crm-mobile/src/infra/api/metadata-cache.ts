/** Metadata contains tenant-specific products, so never share a cache across accounts. */
export function getMetadataCacheKey(baseUrl: string | null, userId?: string, tenantId?: string | null): string | null {
  if (!baseUrl || !userId || !tenantId) return null;
  return ['app_metadata_cache_v2', baseUrl, userId, tenantId].map(encodeURIComponent).join(':');
}

export function toApiTenantId(tenantId: string): string {
  return tenantId === 'default' ? 'DEFAULT_TENANT' : tenantId;
}

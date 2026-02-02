import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async applyChanges(tenantId: string, data: any) {
    this.logger.log(`📥 Syncing data for Tenant: ${tenantId}`);

    if (data.leads && Array.isArray(data.leads)) {
      for (const item of data.leads) {
        await this.prisma.client.upsert({
          where: { id: item.id },
          update: {
            businessName: item.name || item.businessName,
            phoneNumber: item.phone || item.phoneNumber || '0000000000',
            updatedAt: new Date(),
          },
          create: {
            id: item.id,
            tenantId: tenantId,
            businessName: item.name || item.businessName,
            phoneNumber: item.phone || item.phoneNumber || '0000000000',
            typeCode: 'GENERAL',
            status: 'NEW_LEAD',
          },
        });
      }
    }

    if (data.visits && Array.isArray(data.visits)) {
      for (const visit of data.visits) {
        const clientExists = await this.prisma.client.findUnique({ where: { id: visit.leadId } });
        
        if (clientExists) {
            await this.prisma.visit.upsert({
              where: { id: visit.id },
              update: {
                outcome: visit.outcome,
                notes: visit.notes,
                checkOutTime: visit.endedAt ? new Date(visit.endedAt) : null,
                updatedAt: new Date(),
              },
              create: {
                id: visit.id,
                clientId: visit.leadId,
                repId: visit.repId || 'UNKNOWN',
                checkInTime: visit.startedAt ? new Date(visit.startedAt) : new Date(),
                outcome: visit.outcome,
                notes: visit.notes,
              },
            });
        }
      }
    }

    return { success: true, syncedAt: new Date() };
  }

  async getChanges(tenantId: string, cursor?: string) {
    const lastSync = cursor ? new Date(cursor) : undefined;

    const whereCondition = lastSync 
      ? { tenantId, updatedAt: { gt: lastSync } } 
      : { tenantId };

    const clients = await this.prisma.client.findMany({
      where: whereCondition,
    });

    const visits = await this.prisma.visit.findMany({
      where: {
        client: { tenantId },
        updatedAt: lastSync ? { gt: lastSync } : undefined,
      },
    });

    return {
      leads: clients,
      visits,
      timestamp: new Date().toISOString(),
    };
  }
}
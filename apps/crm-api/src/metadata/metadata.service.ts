import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async getAppMetadata(tenantId: string) {
    const lookups = await this.prisma.lookupValue.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const services = await this.prisma.serviceProduct.findMany({
      where: { tenantId, isActive: true },
    });

    const groupedLookups = lookups.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      lookups: groupedLookups,
      services: services,
      timestamp: new Date().toISOString(),
    };
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async getAppMetadata(tenantId: string) {
    // 1. جلب القوائم العامة (System-wide Lookups)
    const lookups = await this.prisma.lookupValue.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // 2. جلب خدمات الشركة (Tenant Specific Services)
    const services = await this.prisma.serviceProduct.findMany({
      where: { tenantId, isActive: true },
    });

    // 3. تنظيم القوائم حسب التصنيف لتسهيل استخدامها في الموبايل
    const groupedLookups = lookups.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      lookups: groupedLookups, // مثال: { CLIENT_TYPE: [...], REJECTION_REASON: [...] }
      services: services,      // قائمة الخدمات والأسعار
      timestamp: new Date().toISOString(),
    };
  }
}
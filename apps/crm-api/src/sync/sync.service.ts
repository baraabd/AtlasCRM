import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  // PUSH: تطبيق التغييرات القادمة من الموبايل
  async applyChanges(tenantId: string, events: any[]) {
    for (const event of events) {
      const { entityType, action, payload } = event;
      
      // تجاهل البيانات إذا كانت من شركة أخرى (Security)
      // في payload نتوقع وجود id والبيانات

      if (entityType === 'lead') {
        if (action === 'upsert') {
          await this.prisma.lead.upsert({
            where: { id: payload.id },
            create: {
              id: payload.id,
              name: payload.name,
              businessType: payload.businessType,
              phones: payload.phones ? JSON.parse(payload.phones) : [],
              tenantId: tenantId,
              updatedAt: payload.updatedAt
            },
            update: {
              name: payload.name,
              businessType: payload.businessType,
              phones: payload.phones ? JSON.parse(payload.phones) : [],
              updatedAt: new Date() // نحدث الوقت ليعرف الآخرون بالتغيير
            }
          });
        }
      }
      
      // يمكن إضافة Visits هنا بنفس المنطق
    }
    return { ok: true };
  }

  // PULL: إرسال التغييرات للموبايل
  async getChanges(tenantId: string, cursor?: string) {
    const dateCursor = cursor ? new Date(cursor) : new Date(0);

    const leads = await this.prisma.lead.findMany({
      where: {
        tenantId,
        updatedAt: { gt: dateCursor }
      }
    });

    const visits = await this.prisma.visit.findMany({
      where: {
        lead: { tenantId },
        updatedAt: { gt: dateCursor }
      }
    });

    // تحديد المؤشر الجديد (آخر وقت تحديث)
    const nextCursor = new Date().toISOString();

    return {
      changes: { leads, visits },
      nextCursor
    };
  }
}
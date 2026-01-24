import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // ✅ استيراد UUID

import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId }, // إرجاع عملاء الشركة فقط
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ استقبال tenantId
  async create(dto: CreateLeadDto, tenantId: string) {
    return this.prisma.lead.create({
      data: {
        id: uuidv4(), // ✅ حل مشكلة: Property 'id' is missing
        name: dto.name.trim(),
        businessType: dto.businessType?.trim() || null,
        phones: dto.phones?.length ? dto.phones : [],
        tenantId: tenantId, // ✅ حل مشكلة: Property 'tenant' is missing
      },
    });
  }
}
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    console.log(`📂 [Leads] Fetching list for Tenant: ${tenantId}`);
    
    const results = await this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ [Leads] Found ${results.length} leads.`);
    return results;
  }

  async create(dto: CreateLeadDto, tenantId: string) {
    console.log(`➕ [Leads] Creating new lead: "${dto.name}" for Tenant: ${tenantId}`);

    try {
      const newLead = await this.prisma.lead.create({
        data: {
          id: uuidv4(),
          name: dto.name.trim(),
          businessType: dto.businessType?.trim() || null,
          phones: dto.phones?.length ? dto.phones : [],
          tenantId: tenantId,
        },
      });
      console.log(`✅ [Leads] Created successfully. ID: ${newLead.id}`);
      return newLead;
    } catch (error) {
      console.error(`❌ [Leads] Creation failed:`, error);
      throw error;
    }
  }
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // ✅ استيراد UUID

import { PrismaService } from '../prisma/prisma.service';
import { EndVisitDto } from './dto/end-visit.dto';
import { StartVisitDto } from './dto/start-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: StartVisitDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.visit.create({
      data: {
        id: uuidv4(), // ✅ حل مشكلة: Property 'id' is missing
        leadId: dto.leadId,
        startedAt: new Date(),
      },
    });
  }

  async end(visitId: string, dto: EndVisitDto) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.endedAt) throw new BadRequestException('Visit already ended');

    const endedAt = new Date();

    // حساب المدة تلقائياً إذا لم ترسل
    const durationSec =
      typeof dto.durationSec === 'number'
        ? dto.durationSec
        : Math.max(0, Math.floor((endedAt.getTime() - visit.startedAt.getTime()) / 1000));

    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        endedAt,
        durationSec,
        outcome: (dto.outcome as any) ?? null,
        presented: dto.presented === undefined ? undefined : (dto.presented as any),
        notes: dto.notes ?? undefined,
      },
    });
  }
}
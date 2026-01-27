import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EndVisitDto } from './dto/end-visit.dto';
import { StartVisitDto } from './dto/start-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: StartVisitDto) {
    console.log(`🚀 [Visits] Starting visit for Lead ID: ${dto.leadId}`);

    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    if (!lead) {
      console.error(`❌ [Visits] Lead not found!`);
      throw new NotFoundException('Lead not found');
    }

    const visit = await this.prisma.visit.create({
      data: {
        id: uuidv4(),
        leadId: dto.leadId,
        startedAt: new Date(),
      },
    });

    console.log(`✅ [Visits] Started successfully. Visit ID: ${visit.id}`);
    return visit;
  }

  async end(visitId: string, dto: EndVisitDto) {
    console.log(`🏁 [Visits] Ending visit ID: ${visitId}`);

    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) {
        console.error(`❌ [Visits] Visit not found!`);
        throw new NotFoundException('Visit not found');
    }
    if (visit.endedAt) {
        console.error(`⚠️ [Visits] Visit already ended.`);
        throw new BadRequestException('Visit already ended');
    }

    const endedAt = new Date();
    
    // حساب المدة
    const durationSec =
      typeof dto.durationSec === 'number'
        ? dto.durationSec
        : Math.max(0, Math.floor((endedAt.getTime() - visit.startedAt.getTime()) / 1000));

    console.log(`⏱️ [Visits] Duration calculated: ${durationSec} seconds`);

    const updatedVisit = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        endedAt,
        durationSec,
        outcome: (dto.outcome as any) ?? null,
        presented: dto.presented === undefined ? undefined : (dto.presented as any),
        notes: dto.notes ?? undefined,
      },
    });

    console.log(`✅ [Visits] Visit closed successfully.`);
    return updatedVisit;
  }
}
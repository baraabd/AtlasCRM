import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EndVisitDto } from './dto/end-visit.dto';
import { StartVisitDto } from './dto/start-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ تحديث: يجب استقبال repId لأن الجدول الجديد يطلبه
  async start(dto: StartVisitDto, repId: string) {
    console.log(`🚀 [Visits] Starting visit for Lead ID: ${dto.leadId}`);

    // ✅ تصحيح: استخدام client بدلاً من lead
    const client = await this.prisma.client.findUnique({ where: { id: dto.leadId } });
    if (!client) {
      console.error(`❌ [Visits] Client not found!`);
      throw new NotFoundException('Client not found');
    }

    const visit = await this.prisma.visit.create({
      data: {
        id: uuidv4(),
        // ✅ تصحيح: الحقل أصبح clientId
        clientId: dto.leadId,
        // ✅ إضافة: الحقل repId إجباري الآن
        repId: repId,
        // ✅ تصحيح: الحقل أصبح checkInTime
        checkInTime: new Date(),
        // حقول الموقع (يمكن إرسالها لاحقاً، حالياً اختيارية)
        isVerified: false
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
    
    // ✅ تصحيح: الحقل أصبح checkOutTime
    if (visit.checkOutTime) {
        console.error(`⚠️ [Visits] Visit already ended.`);
        throw new BadRequestException('Visit already ended');
    }

    const endedAt = new Date();
    
    // حساب المدة
    // ✅ تصحيح: استخدام checkInTime بدلاً من startedAt
    const durationSec =
      typeof dto.durationSec === 'number'
        ? dto.durationSec
        : Math.max(0, Math.floor((endedAt.getTime() - visit.checkInTime.getTime()) / 1000));

    console.log(`⏱️ [Visits] Duration calculated: ${durationSec} seconds`);

    const updatedVisit = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        // ✅ تصحيح: الحقول الجديدة
        checkOutTime: endedAt,
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
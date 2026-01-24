import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // تأكد من أنك أنشأت هذا في الخطوات السابقة

import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(AuthGuard('jwt')) // 🛡️ حماية المسار
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@Request() req: any) {
    // نمرر tenantId لفلترة البيانات
    return this.leads.list(req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateLeadDto) {
    // ✅ التعديل هنا: نمرر tenantId المستخرج من التوكن إلى دالة الإنشاء
    return this.leads.create(dto, req.user.tenantId);
  }
}
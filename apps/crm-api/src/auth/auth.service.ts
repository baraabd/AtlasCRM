import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto'; // ✅ استيراد

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    // ... (كود تسجيل الدخول يبقى كما هو)
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    return {
      token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email }
    };
  }

  // ✅ التعديل هنا: تحديد النوع RegisterDto
  async register(data: RegisterDto) {
    console.log('🔄 Processing Register for:', data.email); // طباعة تتبع

    // 1. التحقق من وجود المستخدم
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already exists');

    // 2. تشفير كلمة المرور
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. إنشاء المعرفات
    const tenantId = uuidv4();
    const userId = uuidv4();

    // 4. الحفظ في قاعدة البيانات
    try {
      return await this.prisma.$transaction(async (tx) => {
        // أ) إنشاء الشركة
        const tenant = await tx.tenant.create({
          data: {
            id: tenantId,
            name: `${data.fullName}'s Organization`,
          }
        });

        // ب) إنشاء المستخدم
        const user = await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            password: hashedPassword,
            name: data.fullName,
            tenantId: tenant.id
          }
        });

        // ج) تسجيل الدخول
        const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
        return {
          token: this.jwtService.sign(payload),
          user: { id: user.id, name: user.name, email: user.email }
        };
      });
    } catch (error) {
      console.error('Registration Database Error:', error);
      throw new BadRequestException('Registration failed due to database error');
    }
  }
}
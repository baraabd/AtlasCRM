import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    console.log('------------------------------------------------');
    console.log(`🔍 [Auth] Login Request for: "${email}"`);

    // 1. البحث عن المستخدم
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.error(`❌ [Auth] Failed: User email not found in DB.`);
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(`✅ [Auth] User found (ID: ${user.id}). Checking password...`);

    // 2. التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      console.error(`❌ [Auth] Failed: Password mismatch.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`✅ [Auth] Password correct. Generating token...`);

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    return {
      token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email }
    };
  }

  async register(data: RegisterDto) {
    console.log('------------------------------------------------');
    console.log(`📝 [Auth] Register Request for: "${data.email}"`);

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      console.error(`❌ [Auth] Failed: Email already exists.`);
      throw new BadRequestException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const tenantId = uuidv4();
    const userId = uuidv4();

    try {
      console.log(`⚙️ [Auth] Starting DB Transaction...`);
      return await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            id: tenantId,
            name: `${data.fullName}'s Organization`,
          }
        });

        const user = await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            password: hashedPassword,
            name: data.fullName,
            tenantId: tenant.id
          }
        });

        console.log(`✅ [Auth] User & Tenant created successfully.`);

        const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
        return {
          token: this.jwtService.sign(payload),
          user: { id: user.id, name: user.name, email: user.email }
        };
      });
    } catch (error) {
      console.error('❌ [Auth] Database Error during register:', error);
      throw new BadRequestException('Registration failed due to database error');
    }
  }
}
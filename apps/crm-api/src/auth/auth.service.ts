import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';

import { publicUser, publicUserSelect } from './auth-user';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'YOUR_EMAIL@gmail.com',
      pass: 'YOUR_APP_PASSWORD',
    },
  });

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
      },
      select: { ...publicUserSelect, password: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async register(data: RegisterDto) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existing) throw new BadRequestException('Email already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const tenantId = uuidv4();
    const userId = uuidv4();

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { id: tenantId, name: `${data.fullName}'s Organization` },
      });
      const user = await tx.user.create({
        data: {
          id: userId,
          email,
          password: hashedPassword,
          name: data.fullName,
          tenantId: tenant.id,
        },
        select: publicUserSelect,
      });
      return this.generateToken(user);
    });
  }

  async forgotPassword(email: string) {
    console.log(`📧 [Auth] Forgot Password Request: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode: otp, resetCodeExp: expiresAt },
    });

    console.log(`🔐 [Dev Mode] OTP for ${email}: ${otp}`);

    try {
      await this.transporter.sendMail({
        from: '"Atlas CRM" <no-reply@atlascrm.com>',
        to: email,
        subject: 'Reset Password Code',
        text: `Your verification code is: ${otp}`,
      });
      console.log(`✅ [Auth] Email sent successfully.`);
    } catch {
      console.warn(`⚠️ [Auth] Email failed. Use OTP printed above.`);
    }

    return { message: 'OTP sent' };
  }

  async resetPassword(email: string, otp: string, newPass: string) {
    console.log(`🔄 [Auth] Reset Password for: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.resetCode !== otp)
      throw new BadRequestException('Invalid verification code');
    if (!user.resetCodeExp || new Date() > user.resetCodeExp)
      throw new BadRequestException('Code expired');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExp: null,
      },
    });

    console.log(`✅ [Auth] Password changed successfully.`);
    return { message: 'Password reset successfully' };
  }

  private generateToken(
    user: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
    return {
      token: this.jwtService.sign(payload),
      user: publicUser(user),
      tenant: user.tenant,
    };
  }
}

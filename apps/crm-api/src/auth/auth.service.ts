import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  // إعداد البريد (Mock Mode إذا فشل الإرسال)
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'YOUR_EMAIL@gmail.com', // ضع ايميلك هنا
      pass: 'YOUR_APP_PASSWORD',    // ضع كلمة مرور التطبيق
    },
  });

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    console.log(`🔍 [Auth] Login Request: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async register(data: RegisterDto) {
    console.log(`📝 [Auth] Register Request: ${data.email}`);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const tenantId = uuidv4();
    const userId = uuidv4();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: { id: tenantId, name: `${data.fullName}'s Organization` }
        });
        const user = await tx.user.create({
          data: { id: userId, email: data.email, password: hashedPassword, name: data.fullName, tenantId: tenant.id }
        });
        return this.generateToken(user);
      });
    } catch (error) {
      console.error('DB Error:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async forgotPassword(email: string) {
    console.log(`📧 [Auth] Forgot Password Request: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // ✅ لن يظهر خطأ هنا إذا نفذت npx prisma generate
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
    } catch (error) {
      console.warn(`⚠️ [Auth] Email failed. Use OTP printed above.`);
    }

    return { message: 'OTP sent' };
  }

  async resetPassword(email: string, otp: string, newPass: string) {
    console.log(`🔄 [Auth] Reset Password for: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // ✅ التحقق من الحقول
    if (user.resetCode !== otp) throw new BadRequestException('Invalid verification code');
    if (!user.resetCodeExp || new Date() > user.resetCodeExp) throw new BadRequestException('Code expired');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetCode: null, resetCodeExp: null },
    });

    console.log(`✅ [Auth] Password changed successfully.`);
    return { message: 'Password reset successfully' };
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    return {
      token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email }
    };
  }
}
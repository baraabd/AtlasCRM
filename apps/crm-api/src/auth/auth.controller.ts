import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto'; // ✅ استيراد الـ DTO

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req: any) {
    return this.authService.login(req.email, req.password);
  }

  // ✅ التعديل هنا: استخدام RegisterDto بدلاً من any
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('📥 Register Data Received:', dto); // طباعة للتأكد
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { getJwtSecret } from '../config/environment';
import { PrismaService } from '../prisma/prisma.service';

import { publicUser, publicUserSelect } from './auth-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub?: unknown; tenantId?: unknown }) {
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.tenantId !== 'string'
    ) {
      throw new UnauthorizedException('Invalid session');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect,
    });
    if (!user || user.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Invalid session');
    }
    return { ...publicUser(user), userId: user.id, tenant: user.tenant };
  }
}

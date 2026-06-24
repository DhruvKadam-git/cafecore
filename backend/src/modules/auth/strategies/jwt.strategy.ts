import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'hackathon-secret-key-change-in-production',
    });
  }

  /**
   * Validate JWT token and return user
   */
  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT for user: ${payload.email}`);

    // Check if user exists and is active
    const user = await this.usersService.findActiveById(payload.sub);

    if (!user) {
      this.logger.warn(`User not found or archived: ${payload.sub}`);
      throw new UnauthorizedException('User not found or has been archived');
    }

    // Verify user data matches token
    if (user.email !== payload.email) {
      this.logger.warn(`Email mismatch for user: ${payload.sub}`);
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}

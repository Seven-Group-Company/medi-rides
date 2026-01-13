import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AUTH_ERRORS } from '../../constants/auth.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_NOT_VERIFIED);
    }

    return user;
  }
}
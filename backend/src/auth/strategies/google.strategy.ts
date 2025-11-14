import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { GoogleProfile } from '../../common/types/auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
super({
  clientID: configService.get('auth.google.clientId') || '',
  clientSecret: configService.get('auth.google.clientSecret') || '',
  callbackURL: configService.get('auth.google.callbackURL') || '',
  scope: ['email', 'profile'],
});

  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, name, photos } = profile;
      
      const user = {
        provider: 'google',
        providerId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
        avatar: photos[0]?.value,
        accessToken,
        refreshToken,
      };

      const validatedUser = await this.authService.validateOAuthUser(user);
      done(null, validatedUser);
    } catch (error) {
      done(new InternalServerErrorException('Google authentication failed'), false);
    }
  }
}
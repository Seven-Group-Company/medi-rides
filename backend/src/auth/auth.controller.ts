import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthResponse } from '../common/types/auth.types';
import { UserRole } from '@prisma/client';
import { AUTH_SUCCESS } from '../constants/auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth() {
    // This redirects to Google OAuth
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('No user data received from Google');
      }

      const authResponse = await this.authService.googleLogin(req.user);

      // Redirect to frontend with tokens and user info
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?` +
        `access_token=${authResponse.tokens.access_token}&` +
        `refresh_token=${authResponse.tokens.refresh_token}&` +
        `role=${authResponse.user.role}&` +
        `is_new=${authResponse.isNew ? 'true' : 'false'}&` +
        `redirect_to=${encodeURIComponent(authResponse.redirectTo || '/')}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);

      // Even if token creation fails, we can still redirect with user info
      if (req.user && req.user.user) {
        const user = req.user.user;
        const errorRedirectUrl = `${process.env.FRONTEND_URL}/auth/partial-success?` +
          `email=${encodeURIComponent(user.email)}&` +
          `name=${encodeURIComponent(user.name)}&` +
          `role=${user.role}&` +
          `error=${encodeURIComponent('Token creation failed, please login manually')}`;
        return res.redirect(errorRedirectUrl);
      }

      // Redirect to error page
      const errorRedirectUrl = `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Google authentication failed')}`;
      return res.redirect(errorRedirectUrl);
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser('sub') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {

    if (!userId) {
      throw new UnauthorizedException('User ID not found. Please log in again.');
    }

    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser('sub') userId: number) {
    await this.authService.logout(userId);
    return { message: AUTH_SUCCESS.LOGOUT_SUCCESS };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    const payload = this.authService['jwtService'].verify(refresh_token, {
      secret: this.authService['configService'].get('auth.jwt.refreshSecret'),
    });

    const tokens = await this.authService.refreshTokens(payload.sub, refresh_token);

    return {
      message: AUTH_SUCCESS.TOKEN_REFRESHED,
      ...tokens,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.authService.getProfile(userId);
  }

  // auth.controller.ts - FIXED approach using @CurrentUser()
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('sub') userId: number, // Use CurrentUser decorator instead of Req
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    if (!userId) {
      console.error('❌ No user ID found from CurrentUser');
      throw new UnauthorizedException('User ID not found');
    }

    const updatedUser = await this.authService.updateProfile(userId, updateProfileDto);
    return {
      message: AUTH_SUCCESS.PROFILE_UPDATED,
      user: updatedUser,
    };
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify token validity' })
  async verifyToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  async adminEndpoint(@CurrentUser() user: any) {
    return {
      message: 'Welcome admin!',
      user,
    };
  }
}
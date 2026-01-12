import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  JwtPayload,
  Tokens,
  AuthResponse,
} from '../common/types/auth.types';
import { AuthProvider, UserRole } from '@prisma/client';
import { AUTH_ERRORS, AUTH_SUCCESS } from 'src/constants/auth.constants';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // -------------------------
  // Register new user with email verification
  // -------------------------
  async register(registerDto: RegisterDto): Promise<{ message: string; user: any }> {
    const { email, password, name, phone, role } = registerDto;

    // Check existing user
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
      } else {
        // Resend verification email for unverified users
        await this.sendVerificationEmail(existingUser);
        return { 
          message: AUTH_SUCCESS.VERIFICATION_EMAIL_SENT, 
          user: this.mapUser(existingUser) 
        };
      }
    }

    const hashedPassword = await this.hashData(password);
    const emailVerificationToken = this.generateVerificationToken();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || UserRole.CUSTOMER,
        provider: AuthProvider.LOCAL,
        isVerified: false,
        isActive: true,
        emailVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await this.sendVerificationEmail(user);

    return { 
      message: AUTH_SUCCESS.REGISTRATION_SUCCESS, 
      user: this.mapUser(user) 
    };
  }

  // -------------------------
  // Login with enhanced validation
  // -------------------------
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

    if (!user.isVerified) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_NOT_VERIFIED);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DISABLED);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return { 
      user, 
      tokens,
      redirectTo: this.getRoleBasedRedirect(user.role)
    };
  }

  // -------------------------
  // Verify email
  // -------------------------
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: AUTH_SUCCESS.EMAIL_VERIFIED };
  }

  // -------------------------
  // Resend verification email
  // -------------------------
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    if (user.isVerified) {
      throw new BadRequestException(AUTH_ERRORS.EMAIL_ALREADY_VERIFIED);
    }

    const emailVerificationToken = this.generateVerificationToken();
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.sendVerificationEmail({ ...user, emailVerificationToken });

    return { message: AUTH_SUCCESS.VERIFICATION_EMAIL_SENT };
  }

// -------------------------
// Enhanced OAuth validation
// -------------------------
async validateOAuthUser(oauthUser: {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}): Promise<{ user: any; isNew: boolean }> {
  try {
    let user = await this.prisma.user.findUnique({ 
      where: { email: oauthUser.email } 
    });
    let isNew = false;

    if (user) {
      // Update existing user with OAuth info
      if (user.provider === AuthProvider.LOCAL) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: oauthUser.provider as AuthProvider,
            providerId: oauthUser.providerId,
            avatar: oauthUser.avatar,
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } else {
        // Update last login for existing OAuth users
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });
      }
    } else {
      // Create new user from OAuth
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          name: oauthUser.name,
          provider: oauthUser.provider as AuthProvider,
          providerId: oauthUser.providerId,
          avatar: oauthUser.avatar,
          isVerified: true,
          isActive: true,
          role: UserRole.CUSTOMER,
          lastLoginAt: new Date(),
          // Add required fields that might be missing
          password: null, // Explicitly set to null for OAuth users
        },
      });
      isNew = true;
    }

    return { user: this.mapUser(user), isNew };
  } catch (error) {
    console.error('Error in validateOAuthUser:', error);
    throw error;
  }
}

async googleLogin(googleUser: any): Promise<AuthResponse> {
  try {
    const { user, isNew } = googleUser;

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      user,
      tokens,
      redirectTo: this.getRoleBasedRedirect(user.role),
      isNew,
    };
  } catch (error) {
    console.error('Error in googleLogin:', error);
    throw new InternalServerErrorException('Failed to complete Google login');
  }
}

  // -------------------------
  // Role-based redirect helper
  // -------------------------
  private getRoleBasedRedirect(role: UserRole): string {
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    
    const redirectPaths = {
      [UserRole.ADMIN]: '/dashboard',
      [UserRole.DRIVER]: '/driver-dashboard',
      [UserRole.DISPATCHER]: '/dispatcher/dashboard',
      [UserRole.CUSTOMER]: '/customer-dashboard',
    };

    return `${baseUrl}${redirectPaths[role] || '/customer-dashboard'}`;
  }

  // -------------------------
  // Enhanced user validation
  // -------------------------
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
    });
    
    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return this.mapUser(user);
  }

  // Add to auth.service.ts
async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
  }

  // For OAuth users without password
  if (!user.password) {
    throw new BadRequestException(AUTH_ERRORS.OAUTH_USER_NO_PASSWORD);
  }

  // Check current password
  const isValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedException(AUTH_ERRORS.INVALID_CURRENT_PASSWORD);
  }

  // Hash new password
  const hashedPassword = await this.hashData(changePasswordDto.newPassword);

  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: AUTH_SUCCESS.PASSWORD_CHANGED };
}

  // -------------------------
  // Send verification email
  // -------------------------
  private async sendVerificationEmail(user: any): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${user.emailVerificationToken}`;
    
    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationUrl
    );
  }

  // -------------------------
  // Generate verification token
  // -------------------------
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // -------------------------
  // Hash data (passwords) helper
  // -------------------------
  private async hashData(data: string): Promise<string> {
    const saltOrRounds = Number(this.configService.get('auth.bcrypt.saltOrRounds')) || 10;
    return bcrypt.hash(data, saltOrRounds);
  }

  // -------------------------
  // Logout
  // -------------------------
  async logout(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // -------------------------
  // Refresh tokens
  // -------------------------
  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { refreshTokens: true },
    });

    if (!user || !user.refreshTokens.length) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    const match = user.refreshTokens.find((rt) => rt.token === refreshToken);
    if (!match) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    if (match.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: match.id } });
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  // -------------------------
  // Get user profile
  // -------------------------
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
    return this.mapUser(user);
  }

  // -------------------------
  // Update profile
  // -------------------------
// auth.service.ts - Fix the updateProfile method
async updateProfile(userId: number, dto: UpdateProfileDto) {

  if (!userId) {
    console.error('❌ User ID is undefined in updateProfile');
    throw new BadRequestException('User ID is required');
  }

  const { email, ...updateData } = dto;

  // Check if user exists
  const existingUser = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    console.error('❌ User not found for ID:', userId);
    throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
  }

  if (email && email !== existingUser.email) {
    const userWithEmail = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (userWithEmail && userWithEmail.id !== userId) {
      throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
    }
    
    // If email is changed, mark as unverified and send verification email
    updateData['email'] = email;
    updateData['isVerified'] = false;
    
    // Generate new verification token
    const emailVerificationToken = this.generateVerificationToken();
    updateData['emailVerificationToken'] = emailVerificationToken;
    updateData['emailVerificationExpires'] = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  // Remove undefined values to avoid Prisma errors
  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined)
  );

  try {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: cleanUpdateData,
    });

    // If email was changed, send verification email
    if (email && email !== existingUser.email) {
      await this.sendVerificationEmail(updatedUser);
    }

    return this.mapUser(updatedUser);
  } catch (error) {
    console.error('❌ Prisma update error:', error);
    throw new InternalServerErrorException('Failed to update profile');
  }
}
  // Enhanced token generation with better security
  private async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.secret'),
        expiresIn: this.configService.get('auth.jwt.expiresIn') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.refreshSecret'),
        expiresIn: this.configService.get('auth.jwt.refreshExpiresIn') || '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  // -------------------------
  // Update refresh token
  // -------------------------
// -------------------------
// Update refresh token
// -------------------------
private async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
  const hashedRefreshToken = await this.hashData(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  // Delete any existing refresh tokens for this user first
  await this.prisma.refreshToken.deleteMany({
    where: { userId }
  });

  // Then create a new refresh token
  await this.prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId,
      expiresAt,
    },
  });
}

  // Enhanced user mapping
  private mapUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone ?? null,
      avatar: user.avatar ?? undefined,
      isVerified: user.isVerified,
      isActive: user.isActive,
      provider: user.provider,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
      patientProfile: user.patientProfile ?? null,
      driverProfile: user.driverProfile ?? null,
    };
  }
}
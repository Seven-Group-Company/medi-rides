import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  JwtPayload,
  Tokens,
  AuthResponse,
} from '../common/types/auth.types';
import { AuthProvider, UserRole } from '@prisma/client';
import { AUTH_ERRORS } from 'src/constants/auth.constants';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // -------------------------
  // Register new user
  // -------------------------
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, phone, role } = registerDto;

    // Check existing user
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);

    const hashedPassword = await this.hashData(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || UserRole.CUSTOMER,
        provider: AuthProvider.LOCAL,
        isVerified: true,
        isActive: true,
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return { user: this.mapUser(user), tokens };
  }

  // -------------------------
  // Login
  // -------------------------
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

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

    return { user, tokens };
  }

  // -------------------------
  // Validate local user
  // -------------------------
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return this.mapUser(user);
  }

  // -------------------------
  // Validate OAuth user
  // -------------------------
  async validateOAuthUser(oauthUser: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<any> {
    let user = await this.prisma.user.findUnique({ where: { email: oauthUser.email } });

    if (user) {
      if (!user.providerId) {
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
      }
    } else {
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
        },
      });
    }

    return this.mapUser(user);
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
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { email, ...updateData } = dto;

    if (email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        ...(email && { email, isVerified: false }),
      },
    });

    return this.mapUser(updatedUser);
  }

  // -------------------------
  // Helper: generate tokens
  // -------------------------
  private async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.secret'),
        expiresIn: this.configService.get('auth.jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt.refreshSecret'),
        expiresIn: this.configService.get('auth.jwt.refreshExpiresIn'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  // -------------------------
  // Helper: update refresh token
  // -------------------------
  private async updateRefreshToken(userId: number, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({ data: { userId, token: refreshToken, expiresAt } });

    await this.prisma.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
  }

  // -------------------------
  // Helper: hash password
  // -------------------------
  private async hashData(data: string): Promise<string> {
    const saltRounds = this.configService.get<number>('auth.bcrypt.saltRounds') || 12;
    return bcrypt.hash(data, saltRounds);
  }

  // -------------------------
  // Helper: map DB user to AuthResponse.user
  // -------------------------
  private mapUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone ?? null,
      avatar: user.avatar ?? undefined,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }
}

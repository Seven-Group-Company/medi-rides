export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type AuthResponse = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
    redirectTo: string;
    isVerified: boolean;
    tokens: Tokens;
    isActive: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    provider?: string;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  tokens: Tokens;
  redirectTo?: string;
  isNew?: boolean;
  message?: string;
};

export type GoogleProfile = {
  id: string;
  emails: { value: string; verified: boolean }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
  provider: string;
  _json: any;
};

export type OAuthUser = {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
};
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
    avatar?: string;
    isVerified: boolean;
  };
  tokens: Tokens;
};

export type GoogleProfile = {
  id: string;
  emails: { value: string; verified: boolean }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
  provider: string;
};
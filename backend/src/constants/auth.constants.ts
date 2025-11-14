export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
  UNAUTHORIZED: 'Unauthorized access',
  GOOGLE_AUTH_FAILED: 'Google authentication failed',
  ACCOUNT_NOT_VERIFIED: 'Account not verified',
} as const;

export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;
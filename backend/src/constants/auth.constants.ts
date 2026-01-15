export const AUTH_ERRORS = {
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists. Please try logging in or use a different email address.',
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect. Please check your credentials and try again.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email address before logging in. Check your inbox for the verification email.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support for assistance.',
  INVALID_REFRESH_TOKEN: 'Your session has expired. Please log in again to continue.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again to continue.',
  USER_NOT_FOUND: 'No account found with this email address. Please check the email or create a new account.',
  INVALID_VERIFICATION_TOKEN: 'The verification link is invalid or has expired. Please request a new verification email.',
  EMAIL_ALREADY_VERIFIED: 'This email address has already been verified. You can proceed to log in.',
  GOOGLE_AUTH_FAILED: 'Google authentication failed. Please try again or use another login method.',
  OAUTH_USER_NO_PASSWORD: 'This account was created using Google OAuth and does not have a password set. Please use Google login to access your account.',
  INVALID_CURRENT_PASSWORD: 'The current password you entered is incorrect. Please try again.',
};

export const AUTH_SUCCESS = {
  REGISTRATION_SUCCESS: 'Account created successfully! Please check your email to verify your account before logging in.',
  LOGIN_SUCCESS: 'Welcome back! You have been successfully logged in.',
  LOGOUT_SUCCESS: 'You have been successfully logged out. See you again soon!',
  TOKEN_REFRESHED: 'Your session has been refreshed successfully.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  EMAIL_VERIFIED: 'Your email has been verified successfully! You can now log in to your account.',
  VERIFICATION_EMAIL_SENT: 'Verification email sent! Please check your inbox to verify your email address.',
  PASSWORD_RESET_EMAIL_SENT: 'If an account exists with this email, you will receive a password reset link.',
  PASSWORD_CHANGED: 'Your password has been changed successfully.',
};
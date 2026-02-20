export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',

  // Patient errors
  PATIENT_NOT_FOUND: 'Patient not found',
  PATIENT_ACCESS_DENIED: 'You do not have access to this patient',

  // Chat errors
  CHAT_MESSAGE_FAILED: 'Failed to send message',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',

  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
} as const;

/**
 * Production-grade Error Classifier and Normalizer
 * Translates raw network/Java/HTTP exceptions into user-friendly copy.
 */

export interface AppErrorDetails {
  userMessage: string;
  category: 'NETWORK_OFFLINE' | 'SERVER_ERROR' | 'RATE_LIMITED' | 'VALIDATION' | 'UNKNOWN';
  statusCode?: number;
}

export function classifyError(
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): AppErrorDetails {
  if (!error) {
    return {
      userMessage: fallbackMessage,
      category: 'UNKNOWN',
    };
  }

  const rawString = String((error as any)?.message || error || '').toLowerCase();
  const statusCode = (error as any)?.status || (error as any)?.statusCode;

  // 1. Network disconnection / Host resolution failures / Java NativeRequest drops
  if (
    rawString.includes('network request failed') ||
    rawString.includes('connectexception') ||
    rawString.includes('invalid url host') ||
    rawString.includes('econnrefused') ||
    rawString.includes('enotfound') ||
    rawString.includes('nativerequest.start') ||
    rawString.includes('fetch failed') ||
    rawString.includes('failed to connect')
  ) {
    return {
      userMessage: 'Unable to connect to server. Please check your internet connection and try again.',
      category: 'NETWORK_OFFLINE',
      statusCode,
    };
  }

  // 2. Request timeouts
  if (rawString.includes('timeout') || rawString.includes('timed out') || rawString.includes('aborted') || statusCode === 504) {
    return {
      userMessage: 'Connection timed out. Please check your network and try again.',
      category: 'SERVER_ERROR',
      statusCode: 504,
    };
  }

  // 3. Rate limiting / Too many OTP requests
  if (statusCode === 429 || rawString.includes('too many') || rawString.includes('rate limit')) {
    return {
      userMessage: 'Too many attempts. Please wait a moment before trying again.',
      category: 'RATE_LIMITED',
      statusCode: 429,
    };
  }

  // 4. Server 5xx crashes
  if (statusCode && statusCode >= 500) {
    return {
      userMessage: 'Server is temporarily unavailable. Please try again in a few moments.',
      category: 'SERVER_ERROR',
      statusCode,
    };
  }

  // 5. Clean validation message from backend (e.g. "Invalid OTP", "Phone number already registered")
  const originalMessage = (error as any)?.message;
  if (
    originalMessage &&
    typeof originalMessage === 'string' &&
    !originalMessage.includes('NativeRequest') &&
    !originalMessage.includes('java.') &&
    !originalMessage.includes('http://') &&
    !originalMessage.includes('https://')
  ) {
    return {
      userMessage: originalMessage.trim(),
      category: 'VALIDATION',
      statusCode,
    };
  }

  return {
    userMessage: fallbackMessage,
    category: 'UNKNOWN',
    statusCode,
  };
}

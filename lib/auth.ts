const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const CODE_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 30;

export const validateEmail = (value: string): string | null => {
  const email = value.trim();
  if (!email) return "Enter your email address";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address";
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return "Enter your password";
  if (value.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters`;
  return null;
};

export const validateCode = (value: string): string | null => {
  if (!value) return "Enter the code from your email";
  if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(value)) return `The code is ${CODE_LENGTH} digits`;
  return null;
};

const ERROR_MESSAGES: Record<string, string> = {
  form_identifier_not_found: "We couldn't find an account with that email",
  form_password_incorrect: "That password isn't right. Try again",
  form_identifier_exists: "An account with this email already exists. Sign in instead",
  form_password_pwned: "This password appeared in a data breach. Choose a different one",
  form_password_length_too_short: `Use at least ${PASSWORD_MIN_LENGTH} characters`,
  form_password_validation_failed: "That password isn't right. Try again",
  form_param_format_invalid: "Check the details you entered and try again",
  form_code_incorrect: "That code isn't right. Check your email and try again",
  verification_expired: "That code has expired. Request a new one",
  verification_failed: "Too many attempts. Request a new code",
  too_many_requests: "Too many attempts. Wait a moment and try again",
  user_locked: "Your account is temporarily locked. Try again later",
  session_exists: "You're already signed in",
  network_error: "Can't reach the server. Check your connection",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again";

type ApiErrorLike = { code?: string; errors?: { code?: string }[] };

export const getAuthErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const { code, errors } = error as ApiErrorLike;
  return errors?.[0]?.code ?? code;
};

type ProfileLike = {
  fullName?: string | null;
  firstName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
} | null | undefined;

export const getDisplayName = (user: ProfileLike): string => {
  const name = user?.fullName?.trim() || user?.firstName?.trim() || user?.username?.trim();
  if (name) return name;
  return user?.primaryEmailAddress?.emailAddress.split("@")[0] ?? "";
};

// Maps provider error codes to on-brand copy so raw SDK messages never reach the UI.
export const getAuthErrorMessage = (error: unknown): string => {
  const code = getAuthErrorCode(error);
  return (code && ERROR_MESSAGES[code]) || FALLBACK_MESSAGE;
};

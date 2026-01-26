type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR';

export function errorResponse(
  code: ErrorCode,
  message: string,
  opts?: { errorId?: string; details?: unknown }
) {
  const payload: any = { error: { code, message } };
  if (opts?.errorId) payload.error.errorId = opts.errorId;
  if (process.env.NODE_ENV === 'development' && opts?.details !== undefined) {
    payload.error.details = opts.details;
  }
  return payload;
}





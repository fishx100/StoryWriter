export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  details?: Record<string, unknown>;
}

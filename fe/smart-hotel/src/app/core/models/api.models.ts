export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

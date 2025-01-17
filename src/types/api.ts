import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ApiErrorResponse = ApiResponse<never>;

export interface PaginatedResponse<T> extends ApiResponse {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Helper function to create consistent API responses
export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createApiError(error: string, message?: string): ApiErrorResponse {
  return {
    success: false,
    error,
    message,
  };
}

// Express response helper
export function sendApiResponse<T>(res: Response, statusCode: number, response: ApiResponse<T>) {
  return res.status(statusCode).json(response);
}

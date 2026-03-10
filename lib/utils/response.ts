import { NextRequest, NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export function success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      statusCode: 200,
    },
    { status: 200 }
  );
}

export function created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      statusCode: 201,
    },
    { status: 201 }
  );
}

export function error(message: string, statusCode: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode,
    },
    { status: statusCode }
  );
}

export function unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 401,
    },
    { status: 401 }
  );
}

export function forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 403,
    },
    { status: 403 }
  );
}

export function notFound(message: string = 'Not found'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 404,
    },
    { status: 404 }
  );
}

export function serverError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  console.error('[API Error]', message);
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 500,
    },
    { status: 500 }
  );
}

export function getAuthHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

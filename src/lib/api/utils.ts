import { NextResponse } from 'next/server';
import { z } from 'zod';

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function validateRequestBody<T>(body: unknown, schema: z.ZodSchema<T>) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errorMessage = result.error.errors
      .map(e => e.message)
      .join(', ');
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data };
}

export function validateResponseData<T>(data: unknown, schema: z.ZodSchema<T>) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Response validation failed:', result.error);
    return { success: false, error: 'Invalid response data structure' };
  }
  return { success: true, data: result.data };
}

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return payload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export function getCurrentUser(): { userId: number; email: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  
  return verifyToken(token);
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

export function verifyAuthFromRequest(request: NextRequest): { userId: number; email: string } | null {
  const token = getAuthTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

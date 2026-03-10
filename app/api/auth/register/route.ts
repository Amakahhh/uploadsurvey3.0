import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/database';
import { generateId, hashPassword, generateJWT, generateRefreshToken } from '@/lib/utils/auth';
import { created, error, serverError } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { email, password, confirmPassword, firstName, lastName } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return error('Missing required fields', 400);
    }

    if (password !== confirmPassword) {
      return error('Passwords do not match', 400);
    }

    if (password.length < 6) {
      return error('Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUserResults = (global as any).__db?.exec?.('SELECT id FROM users WHERE email = ?', [email]) || [];
    if (existingUserResults.length > 0 && existingUserResults[0].values.length > 0) {
      return error('User already exists', 409);
    }

    // Create user
    const { run } = await initializeDatabase();
    const userId = generateId();
    const hashedPassword = hashPassword(password);
    const roles = ['respondent']; // Default role

    run(
      `INSERT INTO users (id, email, password, firstName, lastName, roles, isVerified) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [userId, email, hashedPassword, firstName, lastName, JSON.stringify(roles)]
    );

    // Create wallet
    const walletId = generateId();
    run(
      `INSERT INTO wallets (id, user_id, balance, total_earned, total_withdrawn) VALUES (?, ?, 0, 0, 0)`,
      [walletId, userId]
    );

    // Generate tokens
    const jwtToken = generateJWT(userId, email, roles);
    const refreshToken = generateRefreshToken(userId);

    return created({
      id: userId,
      firstName,
      lastName,
      email,
      roles,
      isVerified: true,
      jwToken: jwtToken,
      refreshToken: refreshToken,
      refreshTokenExpiration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error('[Register Error]', err);
    return serverError(err.message);
  }
}

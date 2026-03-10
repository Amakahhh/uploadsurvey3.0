import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/db/database';
import { success, serverError } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    return success({ message: 'Database initialized successfully' });
  } catch (err: any) {
    console.error('[Init Error]', err);
    return serverError(err.message);
  }
}

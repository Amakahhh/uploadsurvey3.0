import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { APIError, ErrorCode } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const requireAuth = async () => {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && data.user) {
      return data.user;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new APIError(ErrorCode.UNAUTHORIZED, "User not authenticated", 401);
  }

  return user;
};

export const requireVerified = async (userId: string) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("is_verified")
    .eq("id", userId)
    .single();

  if (error || !profile?.is_verified) {
    throw new APIError(ErrorCode.NOT_VERIFIED, "Email not verified", 403);
  }

  return true;
};

export const getAuthUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const generateId = () => crypto.randomUUID();

export const hashPassword = (plainPassword: string) => {
  return bcrypt.hashSync(plainPassword, 10);
};

export const verifyPassword = (plainPassword: string, hash: string) => {
  return bcrypt.compareSync(plainPassword, hash);
};

export const generateJWT = (id: string, email: string, roles: string[]) => {
  return jwt.sign({ id, email, roles }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyJWT = (token: string): { id: string; email: string; roles: string[] } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; roles: string[] };
  } catch {
    return null;
  }
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "10d" });
};

import { createClient } from "@/lib/supabase/server";

export const requireAuth = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const requireVerified = async (userId: string) => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("id", userId)
    .single();

  if (error || !profile?.is_verified) {
    throw new Error("Email not verified");
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

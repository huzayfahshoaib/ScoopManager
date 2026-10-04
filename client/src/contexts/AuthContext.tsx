import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "@/lib/supabase";

export type Role = "manager" | "data_entry";

export type Profile = {
  id: string;
  display_name: string | null;
  role: Role;
  active: boolean;
  can_issue_stock: boolean;
  can_settle_employee_day: boolean;
  can_record_expense: boolean;
  can_collect_cash: boolean;
  employee_id: string | null;
};

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileError: string | null;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInAsManager: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function readProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, active, can_issue_stock, can_settle_employee_day, can_record_expense, can_collect_cash, employee_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("This account has no active application role. Ask the Manager to activate it.");
  if (!data.active) throw new Error("This application role is inactive. Ask the Manager to reactivate it.");
  return data as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (supabaseConfigError) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const hydrate = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setProfileError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const nextProfile = await readProfile(nextSession.user.id);
        if (mounted) {
          setProfile(nextProfile);
          setProfileError(null);
        }
      } catch (error) {
        if (mounted) {
          setProfile(null);
          setProfileError(error instanceof Error ? error.message : "Unable to load your application role.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void hydrate(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    session,
    profile,
    loading,
    profileError,
    configError: supabaseConfigError,
    signIn: async (email, password) => {
      if (supabaseConfigError) return supabaseConfigError;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    signInAsManager: async (email, password) => {
      if (supabaseConfigError) return supabaseConfigError;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return "Unable to verify the signed-in account.";
      try {
        const nextProfile = await readProfile(userData.user.id);
        if (nextProfile.role !== "manager") {
          await supabase.auth.signOut();
          return "Manager access is required for this area.";
        }
      } catch (profileError) {
        await supabase.auth.signOut();
        return profileError instanceof Error ? profileError.message : "Unable to verify Manager access.";
      }
      return null;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setProfileError(null);
    },
  }), [session, profile, loading, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

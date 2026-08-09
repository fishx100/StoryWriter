"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

type AuthProviderProps = {
  initialSession?: Session | null;
  children: React.ReactNode;
};

export default function AuthProvider({ initialSession = null, children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);

  useEffect(() => {
    // Subscribe to client auth changes and update state accordingly.
    const supabase = getBrowserSupabase();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    // In case the initialSession prop changes (rare), sync it
    setSession(initialSession ?? null);
    setUser(initialSession?.user ?? null);

    return () => {
      sub.subscription?.unsubscribe?.();
      // Some SDK versions return unsubscribe as a function
      if (typeof (sub as any).unsubscribe === "function") {
        try {
          (sub as any).unsubscribe();
        } catch (e) {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>{children}</AuthContext.Provider>
  );
}

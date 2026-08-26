"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/navigation/logout-button";
import { FieldContainer } from "@/components/layout/field-container";

export function SignIn() {
  const { user } = useAuth();

  return (
    <FieldContainer fieldName="Signed in as">
      <div className="mt-2 flex items-center gap-3">
        <p className="sw-text-plain-small">{user?.email ?? "Unknown"}</p>
        <LogoutButton />
      </div>
    </FieldContainer>
  );
}

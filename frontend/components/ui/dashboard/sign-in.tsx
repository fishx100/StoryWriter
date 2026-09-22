"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/navigation/logout-button";

export function SignIn() {
  const { user } = useAuth();

  return (
    <div className="sw-account">
      <span aria-hidden="true" className="sw-account-avatar">
        {user?.email?.charAt(0).toUpperCase() || "?"}
      </span>
      <p className="sw-account-email" title={user?.email}>
        {user?.email ?? "Unknown"}
      </p>
      <div className="sw-account-actions">
        <LogoutButton />
      </div>
    </div>
  );
}

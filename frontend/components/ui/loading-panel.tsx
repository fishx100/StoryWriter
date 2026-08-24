"use client";

import Link from "next/link";

type LoadingPanelProps = {
  hasError?: boolean;
  backline?: string;
};

export function LoadingPanel({
  hasError = false,
  backline,
}: LoadingPanelProps) {
  return (
    <div className="sw-loading-panel">
      {hasError ? (
        <div className="sw-section-layout">
          <p className="sw-text-plain-small">Unable to load work.</p>
          <div>
            <Link className="sw-normal-button" href={backline ?? "/dashboard"}>
              Back
            </Link>
          </div>
        </div>
      ) : (
        <p className="sw-text-plain-small">Loading...</p>
      )}
    </div>
  );
}

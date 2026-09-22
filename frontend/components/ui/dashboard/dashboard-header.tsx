"use client";

import { Icon } from "../common/icon";
import { SignIn } from "./sign-in";
import { StatsSection } from "./stats-section";

type DashboardHeaderProps = {
  totalWorks: number | null;
  onCreateWork: () => void;
};

export function DashboardHeader({ totalWorks, onCreateWork }: DashboardHeaderProps) {
  return (
    <>
      <header className="sw-dashboard-header">
        <span className="sw-wordmark">STORYWRITER</span>
        <SignIn />
      </header>
      <div className="sw-dashboard-intro">
        <div className="sw-dashboard-welcome">
          <div>
            <h1 className="sw-dashboard-title">Welcome back!</h1>
            <p className="sw-dashboard-subtitle">Create. Organize. Bring your stories to life.</p>
          </div>
          <button type="button" onClick={onCreateWork} className="sw-dashboard-create-button">
            <Icon name="plus" size={18} />
            Create Work
          </button>
        </div>
        <StatsSection totalWorks={totalWorks} />
      </div>
    </>
  );
}

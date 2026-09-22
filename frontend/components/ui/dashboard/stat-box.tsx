import type { ReactNode } from "react";
import { Icon, type IconName } from "../common/icon";

const iconStyles = {
  blue: "sw-stat-icon-works",
  green: "sw-stat-icon-words",
  gold: "sw-stat-icon-goals",
};

type StatBoxProps = {
  icon: IconName;
  tone: keyof typeof iconStyles;
  label: string;
  description: string;
  value?: ReactNode;
  placeholder?: boolean;
  showProgressPlaceholder?: boolean;
};

export function StatBox({
  icon,
  tone,
  label,
  description,
  value,
  placeholder = false,
  showProgressPlaceholder = false,
}: StatBoxProps) {
  const showProgress = placeholder && showProgressPlaceholder;

  return (
    <div className="sw-stat-card">
      <span className={iconStyles[tone]}>
        <Icon name={icon} size={25} />
      </span>
      <div className={showProgress ? "sw-card-content" : undefined}>
        {placeholder ? (
          <div className="sw-stat-placeholder">
            <span aria-hidden="true" className="sw-stat-value-placeholder">&mdash;</span>
            <span className="sw-tag-label">Placeholder</span>
          </div>
        ) : (
          <p className="sw-stat-value">{value}</p>
        )}
        <h2 className="sw-stat-label">{label}</h2>
        {showProgress && (
          <div aria-hidden="true" className="sw-stat-progress-placeholder" />
        )}
        <p className={showProgress ? "sw-text-caption" : "sw-stat-description"}>
          {description}
        </p>
      </div>
    </div>
  );
}

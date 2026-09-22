import type { Work } from "@/types/work";
import { StatusBadge } from "../common/status-badge";
import { Icon } from "../common/icon";

type WorkItemProps = {
  work: Work;
  onClick: (work: Work) => void;
  onDelete: (work: Work) => void;
};

export function WorkItem({ work, onClick, onDelete }: WorkItemProps) {
  return (
    <article className="sw-work-card">
      <div className="sw-work-card-layout">
        <div className="sw-cover-placeholder">
          <Icon name="feather" size={30} />
          <span className="sw-cover-placeholder-label">Cover<br />placeholder</span>
        </div>
        <div className="sw-card-content">
          <StatusBadge currentStatusTagId={work.status_tag_id} />
          <button type="button" onClick={() => onClick(work)} className="sw-work-card-link">
            <h3 className="sw-work-card-title" title={work.title}>{work.title}</h3>
            <p className="sw-work-card-description">
              {work.premise || "No premise yet."}
            </p>
          </button>
          <div className="sw-work-card-footer">
            <span className="sw-work-genre" title={work.genre || "Unspecified"}>
              {work.genre || "Unspecified"}
            </span>
            <div className="sw-work-card-actions">
              <button type="button" onClick={() => onDelete(work)} className="sw-work-delete-button" aria-label={`Delete ${work.title}`} title="Delete work">
                <Icon name="delete" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

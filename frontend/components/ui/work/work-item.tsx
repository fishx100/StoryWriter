import type { Work } from "@/types/work";
import { StatusBadge } from "../common/status-badge";

type WorkItemProps = {
  work: Work;
  onClick: (work: Work) => void;
  onDelete: (work: Work) => void;
  onStatusChange: (work: Work, tagId: string) => void;
  statusSaving: boolean;
};

export function WorkItem({
  work, onClick, onDelete, onStatusChange, statusSaving,
}: WorkItemProps) {
  return (
    <article className="sw-thumbnail">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <StatusBadge
            currentStatusTagId={work.status_tag_id}
            onChange={(tagId) => onStatusChange(work, tagId)}
            disabled={statusSaving}
          />
          <button
            type="button"
            onClick={() => onClick(work)}
            className="sw-invisible-button"
          >
            <h3 className="sw-text-bold-medium">{work.title}</h3>
            <p className="sw-text-plain-small">
              {work.premise || "No premise yet."}
            </p>
          </button>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="sw-tag-label">{work.genre || "Unspecified"}</span>
          <button
            type="button"
            onClick={() => onDelete(work)}
            className="sw-delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

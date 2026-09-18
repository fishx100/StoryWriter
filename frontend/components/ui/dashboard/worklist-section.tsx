"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import useTagStore from "@/stores/tag-store";

import { CreateWorkModal } from "@/components/modals/create-work-modal";
import { useModal } from "@/components/modals/modal-provider";
import { WorkList } from "@/components/ui/work/work-list";
import { Work } from "@/types/work";
import { fetchJson } from "@/lib/api";
import { SectionPanel } from "@/components/layout/section-panel";
import { InlineMessage } from "../common/inline-message";

type WorklistSectionProps = {
  works: Work[];
  setWorks?: Dispatch<SetStateAction<Work[]>>;
};

export function WorklistSection({ works, setWorks }: WorklistSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusRefreshing, setStatusRefreshing] = useState(false);
  const { openModal, closeModal } = useModal();

  const openCreateWorkModal = () => {
    openModal(
      <CreateWorkModal
        onClose={closeModal}
        onWorkCreated={(work) => {
          setWorks?.((currentWorks) => [...currentWorks, work]);
        }}
      />,
    );
  };

  async function handleDeleteWork(work: Work) {
    setError(null);
    try {
      await fetchJson<void>(`/api/works/${work.id}`, {
        method: "DELETE",
      });

      setWorks?.((currentWorks) =>
        currentWorks.filter((w) => w.id !== work.id),
      );
    } catch {
      setError("Failed to delete");
    }
  }

  async function handleStatusChange(work: Work, tagId: string) {
    setStatusSaving(true);
    setError(null);
    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status_tag_id: tagId }),
      });
      setWorks?.((current) => current.map((item) =>
        item.id === work.id ? { ...item, status_tag_id: updated.status_tag_id } : item,
      ));
    } catch {
      setError("Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  }

  useEffect(() => {
    let active = true;
    let requestVersion = 0;
    const unsubscribe = useTagStore.subscribe(
      (state) => state.deletionVersion,
      async () => {
        const version = ++requestVersion;
        setStatusRefreshing(true);
        setError(null);
        try {
          const refreshed = await fetchJson<Work[]>("/api/works");
          if (!active || version !== requestVersion) {
            // Unmounted or newer request has been made, ignore this response
            return;
          }

          setWorks?.((current) => current.map((work) => {
            const updated = refreshed.find((item) => item.id === work.id);
            return updated ? { ...work, status_tag_id: updated.status_tag_id } : work;
          }));
        } catch {
          if (active && version === requestVersion) {
            setError("Status deleted, but works could not be refreshed. Reload to see their current statuses.");
          }
        } finally {
          if (active && version === requestVersion) setStatusRefreshing(false);
        }
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [setWorks]);

  /* @todo handle loading state for delete operation */
  return (
    <SectionPanel title="Your Works">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sw-text-bold-medium">
          Browse and manage story projects
        </h2>

        <button onClick={openCreateWorkModal} className="sw-important-button">
          Create Work
        </button>
      </div>

      {error ? <InlineMessage type="error" message={error} /> : null}

      <WorkList
        works={works}
        onRequestDelete={handleDeleteWork}
        onStatusChange={handleStatusChange}
        statusSaving={statusSaving || statusRefreshing}
      />
    </SectionPanel>
  );
}

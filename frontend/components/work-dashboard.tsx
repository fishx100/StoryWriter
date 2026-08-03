"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { CreateWorkModal } from "@/components/create-work-modal";
import { fetchJson } from "@/lib/api";
import type { CreateWorkInput, Work } from "@/types/work";
import { DashboardHeader } from "./ui/dashboard/dashboard-header";
import { WorklistSection } from "./ui/dashboard/worklist-section";

type WorkDashboardProps = {
  mode: "dashboard" | "works";
};

export function WorkDashboard({ mode }: WorkDashboardProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWorks() {
      try {
        const data = await fetchJson<Work[]>("/api/works");
        if (active) {
          setWorks(data);
        }
      } catch {
        if (active) {
          setError("Unable to load works right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWorks();

    return () => {
      active = false;
    };
  }, []);

  const totalWorks = useMemo(() => works.length, [works]);

  async function handleCreateWork(input: CreateWorkInput) {
    setSaving(true);
    setError(null);

    try {
      const work = await fetchJson<Work>("/api/works", {
        method: "POST",
        body: JSON.stringify(input),
      });

      setWorks((current) => [work, ...current]);
      setCreateOpen(false);
    } catch {
      setError(
        "Could not create work. Check the backend is running on port 8000.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWork() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await fetchJson<void>(`/api/works/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setWorks((current) =>
        current.filter((work) => work.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch {
      setError("Could not delete work right now.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="sw-page-shell">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHeader totalWorks={totalWorks} />

        <WorklistSection
          works={works}
          loading={loading}
          error={error}
          setCreateOpen={setCreateOpen}
          setDeleteTarget={setDeleteTarget}
        />
      </div>

      <CreateWorkModal
        open={createOpen}
        loading={saving}
        error={error}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateWork}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : "Delete work?"}
        message={
          deleteTarget
            ? "This will permanently delete the work and all of its scenes. This action cannot be undone."
            : "This action cannot be undone."
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteWork}
      />
    </main>
  );
}

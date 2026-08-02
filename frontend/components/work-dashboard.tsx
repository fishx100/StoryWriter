"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { CreateWorkModal } from "@/components/create-work-modal";
import { WorkList } from "@/components/work-list";
import { fetchJson } from "@/lib/api";
import type { CreateWorkInput, Work } from "@/types/work";
import { FieldContainer } from "./layout/field-container";

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
        <header className="sw-section-panel">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="sw-section-heading">StoryWriter</p>
              <h1 className="sw-heading-big">Dashboard</h1>
              <p className="sw-text-plain-small">
                Mock authenticated workspace for planning and drafting stories.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Signed in as
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  Alex Writer
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <FieldContainer
              fieldName="Works"
              fieldValue={totalWorks.toString()}
            />
            <FieldContainer fieldName="Mode" fieldValue={mode} />
            <FieldContainer fieldName="Auth" fieldValue="Mock session" />
          </div>
        </header>

        <section className="sw-section-panel">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="sw-section-heading">Your Works</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Browse and manage story projects
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="sw-important-button"
            >
              Create Work
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200/10 p-8 text-slate-300">
              Loading works...
            </div>
          ) : (
            <WorkList works={works} onRequestDelete={setDeleteTarget} />
          )}

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>
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

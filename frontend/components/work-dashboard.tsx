'use client';

import { useEffect, useMemo, useState } from 'react';

import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { CreateWorkModal } from '@/components/create-work-modal';
import { WorkList } from '@/components/work-list';
import { fetchJson } from '@/lib/api';
import type { CreateWorkInput, Work } from '@/types/work';

type WorkDashboardProps = {
  mode: 'dashboard' | 'works';
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
        const data = await fetchJson<Work[]>('/api/works');
        if (active) {
          setWorks(data);
        }
      } catch {
        if (active) {
          setError('Unable to load works right now.');
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
      const work = await fetchJson<Work>('/api/works', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      setWorks(current => [work, ...current]);
      setCreateOpen(false);
    } catch {
      setError('Could not create work. Check the backend is running on port 8000.');
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
      await fetchJson<void>(`/api/works/${deleteTarget.id}`, { method: 'DELETE' });
      setWorks(current => current.filter(work => work.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Could not delete work right now.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300">StoryWriter</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {mode === 'dashboard' ? 'Dashboard' : 'Work List'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Mock authenticated workspace for planning and drafting stories.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed in as</p>
                <p className="mt-1 text-sm font-medium text-slate-100">Alex Writer</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Works</p>
              <p className="mt-2 text-3xl font-semibold">{totalWorks}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Mode</p>
              <p className="mt-2 text-lg font-medium capitalize text-slate-100">{mode}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Auth</p>
              <p className="mt-2 text-lg font-medium text-slate-100">Mock session</p>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Your Works</p>
              <h2 className="mt-2 text-2xl font-semibold">Browse and manage story projects</h2>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-amber-300 border border-slate-200/10 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Create Work
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200/10 p-8 text-slate-300">Loading works...</div>
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
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : 'Delete work?'}
        message={
          deleteTarget
            ? 'This will permanently delete the work and all of its scenes. This action cannot be undone.'
            : 'This action cannot be undone.'
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteWork}
      />
    </main>
  );
}

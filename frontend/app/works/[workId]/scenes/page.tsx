"use client";

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { fetchJson } from '@/lib/api';
import type { Scene, CreateSceneInput } from '@/types/scene';
import { CreateSceneModal } from '@/components/create-scene-modal';
import { SceneList } from '@/components/scene-list';

type ScenesPageProps = {
  params: Promise<{ workId: string }>;
};

export default function ScenesPage({ params }: ScenesPageProps) {
  const { workId } = use(params);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Scene | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchJson<Scene[]>(`/api/works/${workId}/scenes`);
        if (active) setScenes(data);
      } catch (e) {
        if (active) setError('Unable to load scenes.');
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [workId]);

  async function handleCreate(input: CreateSceneInput) {
    setSaving(true); setError(null);
    try {
      const s = await fetchJson<Scene>(`/api/works/${workId}/scenes`, { method: 'POST', body: JSON.stringify(input) });
      setScenes(prev => [...prev, s]);
      setCreateOpen(false);
    } catch (e) { setError('Could not create scene.'); }
    finally { setSaving(false); }
  }

  async function handleDeleteScene() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await fetchJson<void>(`/api/scenes/${deleteTarget.id}`, { method: 'DELETE' });
      setScenes(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { setError('Failed to delete scene.'); }
    finally { setDeleting(false); }
  }

  async function handleReorder(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${workId}/scenes/reorder`, { method: 'POST', body: JSON.stringify({ order }) });
      setScenes(current => {
        const map = new Map(current.map(scene => [scene.id, scene]));
        return order.map(id => map.get(id)).filter((scene): scene is Scene => scene !== undefined);
      });
    } catch { setError('Failed to reorder scenes.'); }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200/10 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:bg-slate-900 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Back to dashboard
          </Link>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            New Scene
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Scenes</h2>
          </div>

          {loading ? <p>Loading...</p> : <SceneList workId={workId} scenes={scenes} onRequestDelete={setDeleteTarget} onReorder={handleReorder} />}

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      <CreateSceneModal open={createOpen} loading={saving} error={error} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : 'Delete scene?'}
        message={deleteTarget ? 'This will permanently delete the scene. This action cannot be undone.' : 'This action cannot be undone.'}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteScene}
      />
    </main>
  );
}

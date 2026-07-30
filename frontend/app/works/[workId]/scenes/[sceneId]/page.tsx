'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';

import { fetchJson } from '@/lib/api';
import type { Scene } from '@/types/scene';

type Props = {
  params: Promise<{ workId: string; sceneId: string }>;
};

function normalizeStatus(status: string): 'todo' | 'in_progress' | 'done' {
  if (status === 'in_progress' || status === 'planning') {
    return 'in_progress';
  }
  if (status === 'done' || status === 'revising') {
    return 'done';
  }
  return 'todo';
}

export default function ScenePage({ params }: Props) {
  const { workId, sceneId } = use(params);
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadScene() {
      try {
        const data = await fetchJson<Scene>(`/api/works/${workId}/scenes/${sceneId}`);
        if (!active) {
          return;
        }
        setScene(data);
        setContent(data.content);
      } catch {
        if (active) {
          setError('Unable to load scene.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadScene();

    return () => {
      active = false;
    };
  }, [sceneId, workId]);

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);
  const displayedWordCount = editing ? wordCount : scene?.word_count ?? 0;

  async function handleSave() {
    if (!scene) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await fetchJson<Scene>(`/api/scenes/${scene.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
      setScene(updated);
      setContent(updated.content);
      setEditing(false);
    } catch {
      setError('Unable to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!scene) {
      return;
    }

    try {
      const updated = await fetchJson<Scene>(`/api/scenes/${scene.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setScene(updated);
    } catch {
      setError('Unable to update status.');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">Loading scene...</div>
      </main>
    );
  }

  if (!scene) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">
          <p className="text-slate-300">Scene not found.</p>
          <Link href={`/works/${workId}/scenes`} className="mt-4 inline-block rounded-full border border-slate-200/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
            Back to scenes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/works/${workId}/scenes`} className="rounded-full border border-slate-200/10 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:bg-slate-900 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300">
            Back to scenes
          </Link>
        </div>

        <section className="rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-slate-200/10 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={normalizeStatus(scene.status)}
                onChange={event => {
                  void handleStatusChange(event.target.value);
                }}
                className="rounded-full border border-slate-200/10 bg-slate-900 px-3 py-2 text-xs uppercase tracking-[0.2em] text-amber-300 outline-none transition focus:border-amber-300/40"
                aria-label="Scene status"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">{scene.title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">{scene.summary || 'No summary yet.'}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200/10 bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">Content</h2>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-slate-200/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {displayedWordCount} words
                </span>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={event => setContent(event.target.value)}
                  className="min-h-[320px] w-full rounded-2xl border border-slate-200/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                  placeholder="Write your scene content here..."
                />
                <div className="flex items-center justify-end gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setContent(scene.content);
                        setEditing(false);
                      }}
                      className="rounded-full border border-slate-200/10 px-4 py-2 text-slate-200 transition hover:bg-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="min-h-[240px] whitespace-pre-wrap rounded-2xl border border-slate-200/10 bg-slate-950/80 p-5 text-slate-200">
                  {scene.content || 'This scene has no content yet.'}
                </div>
                {error ? <div className="text-sm text-rose-300">{error}</div> : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
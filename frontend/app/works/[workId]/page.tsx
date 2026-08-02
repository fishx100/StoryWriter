"use client";

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';

import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { CreateWorkModal } from '@/components/create-work-modal';
import { CharacterList } from '@/components/character-list';
import { fetchJson } from '@/lib/api';
import { SceneList } from '@/components/scene-list';
import type { Character } from '@/types/character';
import type { Work } from '@/types/work';
import type { Scene } from '@/types/scene';
import type { UpdateWorkInput } from '@/types/work';

type WorkPageProps = {
  params: Promise<{ workId: string }>;
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

export default function WorkPage({ params }: WorkPageProps) {
  const { workId } = use(params);
  const [work, setWork] = useState<Work | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scenesLoaded, setScenesLoaded] = useState(false);
  const [scenesLoading, setScenesLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<'overview' | 'scenes' | 'characters'>('overview');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneEditing, setSceneEditing] = useState(false);
  const [sceneContent, setSceneContent] = useState('');
  const [sceneSaving, setSceneSaving] = useState(false);
  const [workError, setWorkError] = useState<string | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [characterError, setCharacterError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scene | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editWorkOpen, setEditWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWork() {
      try {
        const workData = await fetchJson<Work>(`/api/works/${workId}`);
        if (active) {
          setWork(workData);
          setWorkError(null);
        }
      } catch {
        if (active) {
          setWorkError('Unable to load work.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWork();

    return () => {
      active = false;
    };
  }, [workId]);

  async function loadScenesOnce() {
    if (scenesLoaded || scenesLoading || !work) {
      return;
    }

    setScenesLoading(true);
    try {
      const data = await fetchJson<Scene[]>(`/api/works/${workId}/scenes`);
      setScenes(data);
      setScenesLoaded(true);
      setSceneError(null);
    } catch {
      setSceneError('Unable to load scenes.');
    } finally {
      setScenesLoading(false);
    }
  }

  async function loadCharactersOnce() {
    if (charactersLoaded || charactersLoading || !work) {
      return;
    }

    setCharactersLoading(true);
    try {
      const data = await fetchJson<Character[]>(`/api/works/${workId}/characters`);
      setCharacters(data);
      setCharactersLoaded(true);
      setCharacterError(null);
    } catch {
      setCharacterError('Unable to load characters.');
    } finally {
      setCharactersLoading(false);
    }
  }

  const statusSummary = useMemo(() => {
    if (!work) {
      return 'Todo';
    }
    return normalizeStatusLabel(work.status);
  }, [work]);

  const selectedScene = useMemo(() => scenes.find(scene => scene.id === selectedSceneId) ?? null, [scenes, selectedSceneId]);

  const sceneWordCount = useMemo(() => sceneContent.trim().split(/\s+/).filter(Boolean).length, [sceneContent]);
  const selectedSceneWordCount = sceneEditing ? sceneWordCount : selectedScene?.word_count ?? 0;

  useEffect(() => {
    if (selectedScene) {
      setSceneContent(selectedScene.content);
      setSceneEditing(false);
    }
  }, [selectedScene]);

  async function handleStatusChange(status: string) {
    if (!work) {
      return;
    }

    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setWork(updated);
      setWorkError(null);
    } catch {
      setWorkError('Unable to update work status.');
    }
  }

  async function handleSaveWork(input: { title: string; premise: string; genre: string; status: string }) {
    if (!work) {
      return;
    }

    setEditingWork(true);
    setWorkError(null);

    try {
      const updated = await fetchJson<Work>(`/api/works/${work.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: input.title,
          premise: input.premise,
          genre: input.genre,
          status: input.status,
        }),
      });
      setWork(updated);
      setEditWorkOpen(false);
    } catch {
      setWorkError('Unable to update work details.');
    } finally {
      setEditingWork(false);
    }
  }

  async function handleDeleteScene() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await fetchJson<void>(`/api/scenes/${deleteTarget.id}`, { method: 'DELETE' });
      setScenes(current => current.filter(scene => scene.id !== deleteTarget.id));
      if (selectedSceneId === deleteTarget.id) {
        setSelectedSceneId(null);
        setSceneEditing(false);
        setSceneContent('');
      }
      setDeleteTarget(null);
    } catch {
      setSceneError('Unable to delete scene.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleReorderScenes(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${workId}/scenes/reorder`, {
        method: 'POST',
        body: JSON.stringify({ order }),
      });
      setScenes(current => {
        const map = new Map(current.map(scene => [scene.id, scene]));
        return order.map(id => map.get(id)).filter((scene): scene is Scene => scene !== undefined);
      });
    } catch {
      setSceneError('Unable to reorder scenes.');
    }
  }

  async function handleUpdateSceneStatus(sceneId: string, status: string) {
    try {
      const updated = await fetchJson<Scene>(`/api/scenes/${sceneId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setScenes(current => current.map(scene => (scene.id === updated.id ? updated : scene)));
    } catch {
      setSceneError('Unable to update scene status.');
    }
  }

  async function handleSaveSceneContent() {
    if (!selectedScene) {
      return;
    }

    setSceneSaving(true);
    setSceneError(null);

    try {
      const updated = await fetchJson<Scene>(`/api/scenes/${selectedScene.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: sceneContent }),
      });
      setScenes(current => current.map(scene => (scene.id === updated.id ? updated : scene)));
      setSceneContent(updated.content);
      setSceneEditing(false);
    } catch {
      setSceneError('Unable to save scene content.');
    } finally {
      setSceneSaving(false);
    }
  }

  function normalizeStatusLabel(status: string): string {
    if (status === 'in_progress' || status === 'planning') {
      return 'In progress';
    }
    if (status === 'done' || status === 'revising') {
      return 'Done';
    }
    return 'Todo';
  }

  if (loading) {
    return (
      <main className="sw-page-shell">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">Loading work...</div>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="sw-page-shell">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-6">
          <p className="text-slate-300">Work not found.</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-full border border-slate-200/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sw-page-shell">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/20 backdrop-blur lg:w-72 lg:flex-none">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href="/dashboard" className="rounded-full border border-slate-200/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300">
              Back
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Sections</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview' as const, label: 'Overview' },
              { id: 'scenes' as const, label: 'Scenes' },
              { id: 'characters' as const, label: 'Characters' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedItem(item.id);
                  if (item.id === 'scenes') {
                    setSelectedSceneId(null);
                    setSceneEditing(false);
                    setSceneContent('');
                    void loadScenesOnce();
                  }
                  if (item.id === 'characters') {
                    void loadCharactersOnce();
                  }
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  selectedItem === item.id
                    ? 'bg-amber-300 text-slate-950'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
                {item.id === 'scenes' && scenesLoaded ? <span className="text-xs opacity-80">{scenes.length}</span> : null}
                {item.id === 'characters' && charactersLoaded ? <span className="text-xs opacity-80">{characters.length}</span> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="sw-section-panel flex-1">
          {selectedItem === 'overview' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 border-b border-slate-200/10 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="sw-section-heading">Overview</p>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-100">{work.title}</h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditWorkOpen(true)}
                    className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Edit Work
                  </button>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-slate-300">{work.premise || 'No premise yet.'}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sw-field-container">
                  <p className="sw-field-title">Genre</p>
                  <p className="mt-2 text-lg font-medium text-slate-100">{work.genre || 'Unspecified'}</p>
                </div>

                <div className="sw-field-container">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
                  <select
                    value={normalizeStatus(work.status)}
                    onChange={event => {
                      void handleStatusChange(event.target.value);
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
                    aria-label="Work status"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {workError ? <p className="text-sm text-rose-300">{workError}</p> : null}
            </div>
          ) : selectedItem === 'scenes' ? (
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200/10 pb-5">
                <div>
                  <p className="sw-section-heading">Scenes</p>
                </div>
                <button
                    type="button"
                    onClick={() => undefined}
                    className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Create Scene
                  </button>
              </div>

              {scenesLoading && !scenesLoaded ? (
                <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-slate-200/10 bg-slate-900/50 p-8 text-slate-300">
                  Loading scenes...
                </div>
              ) : (
                <>
                  <SceneList
                    workId={work.id}
                    scenes={scenes}
                    onRequestDelete={setDeleteTarget}
                    onReorder={handleReorderScenes}
                    onSelectScene={scene => {
                      setSelectedSceneId(scene.id);
                      setSceneEditing(false);
                      setSceneContent('');
                    }}
                  />

                  {selectedScene ? (
                    <div className="flex flex-col gap-5 rounded-[2rem] border border-slate-200/10 bg-slate-900/70 p-5">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200/10 pb-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Scene</p>
                          <h3 className="mt-2 text-2xl font-semibold text-slate-100">{selectedScene.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSceneId(null);
                            setSceneEditing(false);
                            setSceneContent('');
                          }}
                          className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                        >
                          Back to scenes
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
                          <select
                            value={normalizeStatus(selectedScene.status)}
                            onChange={event => {
                              void handleUpdateSceneStatus(selectedScene.id, event.target.value);
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/40"
                            aria-label="Scene status"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>

                        <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Words</p>
                          <p className="mt-2 text-lg font-medium text-slate-100">{selectedSceneWordCount}</p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-5">
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Summary</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{selectedScene.summary || 'No summary yet.'}</p>
                      </div>

                      <div className="rounded-3xl border border-slate-200/10 bg-slate-900/70 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <h4 className="text-lg font-semibold text-slate-100">Content</h4>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full border border-slate-200/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{selectedSceneWordCount} words</span>
                            {!sceneEditing ? (
                              <button
                                type="button"
                                onClick={() => setSceneEditing(true)}
                                className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                              >
                                Edit
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {sceneEditing ? (
                          <div className="space-y-4">
                            <textarea
                              value={sceneContent}
                              onChange={event => setSceneContent(event.target.value)}
                              className="min-h-[320px] w-full rounded-2xl border border-slate-200/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                              placeholder="Write your scene content here..."
                            />
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSceneContent(selectedScene.content);
                                  setSceneEditing(false);
                                }}
                                className="rounded-full border border-slate-200/10 px-4 py-2 text-slate-200 transition hover:bg-slate-900"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleSaveSceneContent();
                                }}
                                disabled={sceneSaving}
                                className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {sceneSaving ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap rounded-2xl border border-slate-200/10 bg-slate-950/80 p-5 text-slate-200">
                            {selectedScene.content || 'This scene has no content yet.'}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-200/10 bg-slate-900/50 p-8 text-slate-300">
                      Select a scene from the list to view its details.
                    </div>
                  )}

                  {sceneError ? <p className="text-sm text-rose-300">{sceneError}</p> : null}
                </>
              )}
            </div>
          ) : selectedItem === 'characters' ? (
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200/10 pb-5">
                <div>
                  <p className="sw-section-heading">Characters</p>
                </div>
                <button
                    type="button"
                    onClick={() => undefined }
                    className="rounded-full border border-slate-200/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Create Character
                  </button>
              </div>

              {charactersLoading && !charactersLoaded ? (
                <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-slate-200/10 bg-slate-900/50 p-8 text-slate-300">
                  Loading characters...
                </div>
              ) : (
                <CharacterList
                  workId={work.id}
                  characters={characters}
                  onRequestDelete={() => undefined}
                  onReorder={async () => undefined}
                />
              )}

              {characterError ? <p className="text-sm text-rose-300">{characterError}</p> : null}
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : 'Delete scene?'}
        message={deleteTarget ? 'This will permanently delete the scene. This action cannot be undone.' : 'This action cannot be undone.'}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteScene}
      />

      <CreateWorkModal
        open={editWorkOpen}
        loading={editingWork}
        error={workError}
        mode="edit"
        title="Edit Work"
        subtitle="Update the title, summary, and genre for this project."
        submitLabel="Save Changes"
        initialValues={work ? { title: work.title, premise: work.premise, genre: work.genre, status: work.status } : undefined}
        onClose={() => setEditWorkOpen(false)}
        onSubmit={handleSaveWork}
      />
    </main>
  );
}

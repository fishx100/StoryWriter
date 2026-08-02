"use client";

import { CharacterList } from "@/components/character-list";
import { fetchJson } from "@/lib/api";
import { Character } from "@/types/character";
import Link from "next/dist/client/link";
import { use, useEffect, useState } from "react";

type CharactersPageProps = {
  params: Promise<{ workId: string }>;
};

export default async function CharactersPage({ params }: CharactersPageProps) {
  const { workId } = use(params);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchJson<Character[]>(
          `/api/works/${workId}/characters`,
        );
        if (active) setCharacters(data);
      } catch (e) {
        if (active) setError("Unable to load characters.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [workId]);

  async function handleDeleteCharacter() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await fetchJson<void>(`/api/characters/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setCharacters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete character.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReorder(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${workId}/characters/reorder`, {
        method: "POST",
        body: JSON.stringify({ order }),
      });
      setCharacters((current) => {
        const map = new Map(
          current.map((character) => [character.id, character]),
        );
        return order
          .map((id) => map.get(id))
          .filter(
            (character): character is Character => character !== undefined,
          );
      });
    } catch {
      setError("Failed to reorder characters.");
    }
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
            onClick={() => undefined}
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            New Character
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Characters</h2>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <CharacterList
              workId={workId}
              characters={characters}
              onRequestDelete={setDeleteTarget}
              onReorder={handleReorder}
            />
          )}

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}

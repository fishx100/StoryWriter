"use client";

import { useEffect, useState } from "react";
import type { CreateSceneInput, Scene } from "@/types/scene";

type Props = {
  workId: string;
  onClose: () => void;
  onSubmit: (input: CreateSceneInput) => Promise<Scene>;
};

const initial: CreateSceneInput = {
  title: "",
  summary: "",
  content: "",
  status: "todo",
};

export function CreateSceneModal({ workId, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<CreateSceneInput>(initial);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initial);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (e) {
      setError("Failed to create scene.");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full rounded-lg bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Scene</h3>
          <button onClick={onClose} className="text-sm text-slate-300">
            Close
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <div className="text-sm text-slate-300">Title</div>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((s) => ({ ...s, title: e.target.value }))
              }
              className="w-full rounded px-3 py-2 bg-slate-800 text-white"
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-300">Summary</div>
            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm((s) => ({ ...s, summary: e.target.value }))
              }
              className="w-full rounded px-3 py-2 bg-slate-800 text-white"
            />
          </label>

          {error ? <p className="text-rose-400">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-slate-700 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-amber-300 px-4 py-2 text-slate-900"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

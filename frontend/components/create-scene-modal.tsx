"use client";

import { useEffect, useState } from "react";
import type { CreateSceneInput } from "@/types/scene";

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: CreateSceneInput) => Promise<void>;
};

const initial: CreateSceneInput = {
  title: "",
  summary: "",
  content: "",
  status: "todo",
};

export function CreateSceneModal({
  open,
  loading,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateSceneInput>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full rounded-lg bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Scene</h3>
          <button onClick={onClose} className="text-sm text-slate-300">
            Close
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(form);
          }}
        >
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
              disabled={loading}
              className="rounded bg-amber-300 px-4 py-2 text-slate-900"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

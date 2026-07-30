'use client';

import { useEffect, useState } from 'react';

import type { CreateWorkInput } from '@/types/work';

type CreateWorkModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (work: CreateWorkInput) => Promise<void>;
  mode?: 'create' | 'edit';
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  initialValues?: Partial<CreateWorkInput>;
};

const initialFormState: CreateWorkInput = {
  title: '',
  premise: '',
  genre: '',
  status: 'todo',
};

export function CreateWorkModal({
  open,
  loading,
  error,
  onClose,
  onSubmit,
  mode = 'create',
  title,
  subtitle,
  submitLabel,
  initialValues,
}: CreateWorkModalProps) {
  const [form, setForm] = useState<CreateWorkInput>(initialFormState);

  useEffect(() => {
    if (open) {
      setForm({
        ...initialFormState,
        ...initialValues,
      });
    }
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  const heading = title ?? (mode === 'edit' ? 'Edit Work' : 'Create Work');
  const description = subtitle ?? (mode === 'edit' ? 'Update the core details for this project.' : 'Start a new story project');
  const actionLabel = submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Create Work');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/10 bg-slate-950 p-6 text-slate-100 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{mode === 'edit' ? 'Edit Work' : 'Create Work'}</p>
            <h2 className="mt-2 text-2xl font-semibold">{heading}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200/10 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async event => {
            event.preventDefault();
            await onSubmit(form);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Title</span>
            <input
              value={form.title}
              onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
              placeholder="The Sunken Crown"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Premise</span>
            <textarea
              value={form.premise}
              onChange={event => setForm(current => ({ ...current, premise: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
              placeholder="A disgraced heir must reclaim a drowned kingdom."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Genre</span>
              <input
                value={form.genre}
                onChange={event => setForm(current => ({ ...current, genre: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                placeholder="Fantasy"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={event => setForm(current => ({ ...current, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300/50"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CreateSceneInput, Scene } from "@/types/scene";
import { InputField } from "../forms/input-field";
import { TextareaField } from "../forms/textarea-field";
import { InlineMessage } from "../ui/common/inline-message";

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
    <div className="sw-modal-panel">
      <div className="mb-6 flex items-center justify-between">
        <p className="sw-section-heading">Create Scene</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Title"
          value={form.title}
          onChange={(value) =>
            setForm((current) => ({ ...current, title: value }))
          }
        />

        <TextareaField
          label="Summary"
          value={form.summary ?? ""}
          onChange={(value) =>
            setForm((current) => ({ ...current, summary: value }))
          }
        />

        {error && <InlineMessage type="error" message={error} />}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="sw-normal-button">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="sw-important-button"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

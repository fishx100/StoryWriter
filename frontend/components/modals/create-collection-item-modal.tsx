"use client";

import { useState } from "react";
import { InputField } from "@/components/forms/input-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { InlineMessage } from "@/components/ui/common/inline-message";

export type CreateCollectionItemInput = {
  name: string;
  description: string;
};

type CreateCollectionItemModalProps = {
  itemLabel: string;
  onClose: () => void;
  onSubmit: (input: CreateCollectionItemInput) => Promise<void>;
};

export function CreateCollectionItemModal({
  itemLabel,
  onClose,
  onSubmit,
}: CreateCollectionItemModalProps) {
  const [form, setForm] = useState<CreateCollectionItemInput>({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch {
      setError(`Failed to create ${itemLabel.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sw-modal-panel">
      <div className="mb-6 flex items-center justify-between">
        <p className="sw-section-heading">Create {itemLabel}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Title"
          value={form.name}
          onChange={(name) => setForm((current) => ({ ...current, name }))}
        />

        <TextareaField
          label="Summary"
          value={form.description}
          onChange={(description) =>
            setForm((current) => ({ ...current, description }))
          }
        />

        {error ? <InlineMessage type="error" message={error} /> : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="sw-normal-button">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="sw-important-button"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

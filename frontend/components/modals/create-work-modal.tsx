"use client";

import { useEffect, useState } from "react";

import { InputField } from "@/components/forms/input-field";
import { DropdownField } from "@/components/forms/dropdown-field";
import { TextareaField } from "@/components/forms/textarea-field";
import type { CreateWorkInput, Work } from "@/types/work";
import { fetchJson } from "@/lib/api";
import useTagStore from "@/stores/tag-store";

type CreateWorkModalProps = {
  onClose: () => void;
  onWorkCreated?: (work: Work) => void;
};

const initialFormState: CreateWorkInput = {
  title: "",
  premise: "",
  genre: "",
  status_tag_id: "",
};

export function CreateWorkModal({
  onClose,
  onWorkCreated,
}: CreateWorkModalProps) {
  const [form, setForm] = useState<CreateWorkInput>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusTags = useTagStore.getState().getTagsByCategory("status");
  const statusOptions = statusTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  useEffect(() => {
    if (statusTags.length > 0) {
      setForm((current) => ({
        ...current,
        // default to first status tag if available
        status_tag_id: statusTags[0].id,
      }));
    }
  }, []);

  async function handleCreateWork(input: CreateWorkInput) {
    setLoading(true);
    setError(null);

    try {
      const work = await fetchJson<Work>("/api/works", {
        method: "POST",
        body: JSON.stringify(input),
      });

      onWorkCreated?.(work);
      onClose();
    } catch {
      setError("Could not create work. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sw-modal-panel">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="sw-section-heading">Create Work</p>
          <p className="sw-text-plain-small">Start a new story project</p>
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await handleCreateWork(form);
        }}
      >
        <InputField
          label="Title"
          value={form.title}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              title: value,
            }))
          }
          placeholder="The Sunken Crown"
        />

        <TextareaField
          label="Premise"
          value={form.premise}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              premise: value,
            }))
          }
          placeholder="A disgraced heir must reclaim a drowned kingdom."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Genre"
            value={form.genre}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                genre: value,
              }))
            }
            placeholder="Fantasy"
          />

          <DropdownField
            label="Status"
            value={form.status_tag_id}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                status_tag_id: value as CreateWorkInput["status_tag_id"],
              }))
            }
            options={statusOptions}
          />
        </div>

        {error ? <p className="sw-text-warning">{error}</p> : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="sw-normal-button">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="sw-important-button"
          >
            {loading ? "Creating..." : "Create Work"}
          </button>
        </div>
      </form>
    </div>
  );
}

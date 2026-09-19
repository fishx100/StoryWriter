"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CollectionItemForm } from "@/components/forms/collection-item-form";
import { SectionPanel } from "@/components/layout/section-panel";
import type { InlineMessageProps } from "@/components/ui/common/inline-message";
import { updateCollectionItem } from "@/features/collections/api";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { CollectionItem } from "@/types/collection";
import StatusBadge from "@/components/ui/common/status-badge";

type CollectionItemSectionProps = {
  collectionId: string;
  item: CollectionItem;
  onSaved: (item: CollectionItem) => void;
  onBack: () => void;
  backLabel: string;
};

function synchronizeMetadata(item: CollectionItem): CollectionItem {
  const nameField = item.fields.find((field) => field.id === "name");
  const descriptionField = item.fields.find(
    (field) => field.id === "description"
  );

  return {
    ...item,
    name: nameField
      ? String(nameField.value ?? "") || "untitled"
      : item.name,
    description: descriptionField
      ? String(descriptionField.value ?? "")
      : item.description,
  };
}

export function CollectionItemSection({
  collectionId,
  item,
  onSaved,
  onBack,
  backLabel,
}: CollectionItemSectionProps) {
  const [draft, setDraft] = useState(item);
  const [message, setMessage] = useState<InlineMessageProps>();
  const [leaving, setLeaving] = useState(false);
  const latestRef = useRef(item);
  const savedRef = useRef(item);
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const mountedRef = useRef(true);

  const save = useCallback((snapshot: CollectionItem): Promise<boolean> => {
    // Serialize requests so an older edit cannot finish after a newer edit.
    const pending = queueRef.current.then(async () => {
      if (JSON.stringify(snapshot) === JSON.stringify(savedRef.current)) return true;
      if (mountedRef.current) setMessage({ type: "info", message: "Saving..." });
      try {
        const saved = await updateCollectionItem(collectionId, snapshot);
        savedRef.current = saved;
        if (mountedRef.current) {
          onSaved(saved);
          setMessage({
            type: "info",
            message: JSON.stringify(latestRef.current) === JSON.stringify(saved)
              ? "Saved" : "Unsaved changes",
          });
        }
        return true;
      } catch {
        if (mountedRef.current) setMessage({ type: "error", message: "Failed to save. Please retry." });
        return false;
      }
    });
    queueRef.current = pending;
    return pending;
  }, [collectionId, onSaved]);

  const autoSave = useCallback(async (snapshot: CollectionItem) => {
    await save(snapshot);
  }, [save]);

  useAutoSave(`collection-item-${item.id}`, draft, autoSave);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Changing work sections must not discard a pending debounce save.
      void save(latestRef.current);
    };
  }, [save]);

  async function handleBack() {
    setLeaving(true);
    if (await save(latestRef.current)) onBack();
    else setLeaving(false);
  }

  function handleStatusChange(statusTagId: string) {
    const nextItem = { ...latestRef.current, status_tag_id: statusTagId };
    latestRef.current = nextItem;
    setDraft(nextItem);
    void save(nextItem);
  }

  function handleItemChange(nextItem: CollectionItem) {
    const transformedItem = synchronizeMetadata(nextItem);
    latestRef.current = transformedItem;
    setDraft(transformedItem);
    setMessage({ type: "info", message: "Unsaved changes" });
  }

  return (
    <SectionPanel title={draft.name} inlineMessage={message}>
      <div className="mb-4">
        <button
          type="button"
          className="sw-section-back-button"
          disabled={leaving}
          onClick={() => void handleBack()}
        >
          {leaving ? "Saving..." : <>&larr; {backLabel}</>}
        </button>
      </div>
      <fieldset disabled={leaving} className="sw-section-layout">
        <StatusBadge
          currentStatusTagId={draft.status_tag_id ?? undefined}
          disabled={leaving}
          onChange={handleStatusChange}
        />
        <CollectionItemForm
          item={draft}
          onChange={handleItemChange}
        />
      </fieldset>
      {message?.type === "error" ? (
        <button type="button" className="sw-normal-button" onClick={() => void save(latestRef.current)}>
          Retry save
        </button>
      ) : null}
    </SectionPanel>
  );
}

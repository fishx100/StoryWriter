"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionPanel } from "@/components/layout/section-panel";
import { CollectionItemList } from "@/components/lists/collection-item-list";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { useModal } from "@/components/modals/modal-provider";
import { InlineMessage } from "@/components/ui/common/inline-message";
import {
  ensureCollection,
  deleteCollectionItem,
  listCollections,
  reorderCollectionItems,
  saveNewCollectionItem,
} from "@/features/collections/api";
import { createCollectionItem } from "@/features/collections/createCollectionItem";
import type { Collection, CollectionItem, CollectionTemplate } from "@/types/collection";
import { CollectionItemSection } from "@/components/ui/layout/collection-item-section";

type CollectionListSectionProps = {
  workId: string;
  collectionName: string;
  itemLabel: string;
  template: CollectionTemplate;
};

export function CollectionListSection({
  workId,
  collectionName,
  itemLabel,
  template,
}: CollectionListSectionProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const creatingRef = useRef(false);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    let active = true;

    async function loadCollection() {
      setLoading(true);
      setError(null);
      try {
        const collections = await listCollections(workId);
        if (!active) return;
        const found = collections.find((entry) => entry.name === collectionName)
          ?? await ensureCollection(workId, collectionName, template);
        if (active) setCollection(found);
      } catch {
        if (active) setError(`Unable to load ${collectionName.toLowerCase()}.`);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCollection();
    return () => { active = false; };
  }, [workId, collectionName, template, loadAttempt]);

  const handleSaved = useCallback((item: CollectionItem) => {
    setCollection((current) => current ? {
      ...current,
      items: current.items.map((entry) => entry.id === item.id ? item : entry),
    } : current);
  }, []);

  async function handleCreate() {
    if (!collection || creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true);
    setError(null);
    try {
      const item = createCollectionItem(template);
      const saved = await saveNewCollectionItem(collection.id, item);
      setCollection((current) => current ? {
        ...current,
        items: [
          saved,
          ...current.items.map((entry, index) => ({
            ...entry,
            order_index: index + 1,
          })),
        ],
      } : current);
    } catch {
      setError(`Failed to create ${itemLabel.toLowerCase()}. Please try again.`);
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  }

  async function handleReorder(order: string[]) {
    if (!collection) return;
    setError(null);
    try {
      await reorderCollectionItems(collection.id, order);
      setCollection((current) => {
        if (!current) return current;
        const itemsById = new Map(current.items.map((item) => [item.id, item]));
        return {
          ...current,
          items: order.flatMap((id, index) => {
            const item = itemsById.get(id);
            return item ? [{ ...item, order_index: index }] : [];
          }),
        };
      });
    } catch {
      setError(`Unable to reorder ${collectionName.toLowerCase()}.`);
      setCollection((current) => current ? {
        ...current,
        items: [...current.items],
      } : current);
    }
  }

  function openDeleteModal(item: CollectionItem) {
    openModal(
      <ConfirmDeleteModal
        title={item.name}
        message={`Delete ${itemLabel.toLowerCase()} ${item.name}? This action cannot be undone.`}
        onClose={closeModal}
        onConfirm={async () => {
          try {
            await deleteCollectionItem(collection!.id, item.id);
            setCollection((current) => current ? {
              ...current,
              items: current.items
                .filter((entry) => entry.id !== item.id)
                .map((entry, index) => ({ ...entry, order_index: index })),
            } : current);
            closeModal();
          } catch {
            setError(`Failed to delete ${itemLabel.toLowerCase()}.`);
            closeModal();
          }
        }}
      />
    );
  }

  const selectedItem = collection?.items.find((item) => item.id === selectedItemId);
  if (collection && selectedItem) {
    return (
      <CollectionItemSection
        key={selectedItem.id}
        collectionId={collection.id}
        item={selectedItem}
        onSaved={handleSaved}
        onBack={() => setSelectedItemId(null)}
        backLabel={`Back to ${itemLabel.toLowerCase()} list`}
      />
    );
  }

  return (
    <SectionPanel title={collectionName}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sw-text-bold-medium">
          Browse and manage {collectionName.toLowerCase()}
        </h2>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={loading || !collection || creating}
          className="sw-important-button"
        >
          {creating ? "Creating..." : `Create ${itemLabel}`}
        </button>
      </div>

      {loading ? <InlineMessage message={`Loading ${collectionName.toLowerCase()}...`} type="info" /> : (
        <>
          {error ? <InlineMessage message={error} type="error" /> : null}
          {!collection ? (
            <button type="button" className="sw-normal-button" onClick={() => setLoadAttempt((value) => value + 1)}>
              Retry
            </button>
          ) : collection.items.length === 0 ? (
            <InlineMessage
              message={`No ${collectionName.toLowerCase()} yet. Create a ${itemLabel.toLowerCase()} to get started.`}
              type="info"
            />
          ) : (
            <CollectionItemList
              items={collection.items}
              onRequestDelete={openDeleteModal}
              onReorder={handleReorder}
              onSelectItem={(item) => setSelectedItemId(item.id)}
            />
          )}
        </>
      )}
    </SectionPanel>
  );
}

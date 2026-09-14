import { fetchJson } from "@/lib/api";
import type {
  Collection,
  CollectionItem,
  CollectionTemplate,
} from "@/types/collection";

export function listCollections(workId: string): Promise<Collection[]> {
  return fetchJson<Collection[]>(`/api/works/${workId}/collections`);
}

export function ensureCollection(
  workId: string,
  name: string,
  template: CollectionTemplate
): Promise<Collection> {
  return fetchJson<Collection>(`/api/works/${workId}/collections`, {
    method: "POST",
    body: JSON.stringify({ name, template }),
  });
}

export function getCollection(collectionId: string): Promise<Collection> {
  return fetchJson<Collection>(`/api/collections/${collectionId}`);
}

export function saveNewCollectionItem(
  collectionId: string,
  item: CollectionItem
): Promise<CollectionItem> {
  const { id, name, description, fields } = item;
  return fetchJson<CollectionItem>(`/api/collections/${collectionId}/items`, {
    method: "POST",
    body: JSON.stringify({ id, name, description, fields }),
  });
}

export function updateCollectionItem(
  collectionId: string,
  item: CollectionItem
): Promise<CollectionItem> {
  return fetchJson<CollectionItem>(
    `/api/collections/${collectionId}/items/${item.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        fields: item.fields,
      }),
    }
  );
}

export function reorderCollectionItems(
  collectionId: string,
  order: string[]
): Promise<void> {
  return fetchJson<void>(`/api/collections/${collectionId}/items/reorder`, {
    method: "POST",
    body: JSON.stringify({ order }),
  });
}

export function deleteCollectionItem(
  collectionId: string,
  itemId: string
): Promise<void> {
  return fetchJson<void>(`/api/collections/${collectionId}/items/${itemId}`, {
    method: "DELETE",
  });
}

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { fetchJson } from "@/lib/api";

function formatError(err: unknown): string {
  if (!err) return String(err);
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const maybe = err as { message?: unknown };
    if (maybe && typeof maybe.message === "string") return maybe.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export type Tag = {
  id: string;
  category: string;
  name: string;
  color: string;
  order: number;
};

type TagStore = {
  tags: Tag[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  loadTags: (forceReload?: boolean) => Promise<void>;
  createTag: (tag: {
    category?: string;
    name: string;
    color?: string;
    order?: number;
  }) => Promise<Tag | null>;
  updateTag: (tag: {
    id: string;
    name?: string;
    color?: string;
  }) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  getTag: (id: string) => Tag | undefined;
  getTagsByCategory: (category: string) => Tag[];
  clear: () => void;
};

export const useTagStore = create<TagStore>()(
  subscribeWithSelector((set, get) => ({
    tags: [],
    isLoading: false,
    isLoaded: false,
    error: null,

  loadTags: async (forceReload?: boolean) => {
    if (get().isLoaded && !forceReload) return;

    set({ isLoading: true, error: null });
    try {
      // Fetch all tags in a single request; filtering by category is done client-side
      const items = await fetchJson<Tag[]>("/api/tags");
      // Sort tags by order (ascending) before storing in state
      const results = (items ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      set({ tags: results, isLoading: false, isLoaded: true });
    } catch (err: unknown) {
      set({ error: formatError(err), isLoading: false, isLoaded: false });
    }
  },

  createTag: async ({ category = "", name, color = "#888888", order = 0 }) => {
    if (
      (!name || name.trim() === "") &&
      (!category || category.trim() === "")
    ) {
      set({ error: "Tag name and category are required." });
      return null;
    }

    try {
      const payload: {
        name: string;
        color: string;
        category: string;
        order: number;
      } = { name, color, category, order };

      const newTag = await fetchJson<Tag>("/api/tags", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (newTag) {
        set((store) => ({
          tags: [...store.tags, newTag]
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }));
      }
      return newTag;
    } catch (err: unknown) {
      set({ error: formatError(err) });
      return null;
    }
  },

  updateTag: async ({ id, name, color }) => {
    try {
      const updatedTag = await fetchJson<Tag>(`/api/tags/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, color }),
      });

      if (updatedTag) {
        set((s) => ({
          tags: s.tags
            .map((t) => (t.id === id ? { ...t, ...updatedTag } : t))
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }));
      }
      return updatedTag;
    } catch (err: unknown) {
      set({ error: formatError(err) });
      return null;
    }
  },

  deleteTag: async (id: string) => {
    try {
      await fetchJson(`/api/tags/${id}`, { method: "DELETE" });
      set((s) => ({
        tags: s.tags
          .filter((t) => t.id !== id)
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      }));
      return true;
    } catch (err: unknown) {
      set({ error: formatError(err) });
      return false;
    }
  },

  getTag: (id: string) => {
    return get().tags.find((t) => t.id === id);
  },

  getTagsByCategory: (category: string) => {
    return get()
      .tags.filter((t) => t.category === category)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  clear: () =>
    set({ tags: [], isLoading: false, isLoaded: false, error: null }),
  })),
);

export default useTagStore;

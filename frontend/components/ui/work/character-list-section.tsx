"use client";

import { SectionPanel } from "@/components/layout/section-panel";
import { Work } from "@/types/work";
import { Character } from "@/types/character";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { useModal } from "@/components/modals/modal-provider";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { CharacterList } from "@/components/character-list";
import { CreateCharacterModal } from "@/components/create-character-modal";

type CharacterListSectionProps = {
  work: Work;
};

export function CharacterListSection({ work }: CharacterListSectionProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharacters() {
      setLoading(true);
      try {
        const data = await fetchJson<Character[]>(
          `/api/works/${work.id}/characters`,
        );
        setCharacters(data);
      } catch (e) {
        console.error("Failed to fetch characters:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, [work.id]);

  const { openModal, closeModal } = useModal();

  function openDeleteModal(character: Character) {
    openModal(
      <ConfirmDeleteModal
        workTitle={character.name}
        onClose={closeModal}
        onConfirm={async () => {
          await handleDeleteCharacter(character);
          closeModal();
        }}
      />,
    );
  }

  function openCreateCharacterModal() {
    openModal(
      <CreateCharacterModal
        workId={work.id}
        onClose={closeModal}
        onSubmit={async (input) => {
          try {
            const c = await fetchJson<Character>(
              `/api/works/${work.id}/characters`,
              {
                method: "POST",
                body: JSON.stringify(input),
              },
            );
            setCharacters((current) => [...current, c]);
            closeModal();
            return c;
          } catch (e) {
            setError("Could not create character.");
            throw e;
          }
        }}
      />,
    );
  }

  async function handleReorderCharacters(order: string[]) {
    try {
      await fetchJson<void>(`/api/works/${work.id}/characters/reorder`, {
        method: "POST",
        body: JSON.stringify({ order }),
      });
      setCharacters((current) => {
        const map = new Map(current.map((ch) => [ch.id, ch]));
        return order
          .map((id) => map.get(id))
          .filter((ch): ch is Character => ch !== undefined);
      });
    } catch {
      setError("Unable to reorder characters.");
    }
  }

  async function handleDeleteCharacter(character: Character) {
    setLoading(true);

    try {
      await fetchJson<void>(`/api/characters/${character.id}`, {
        method: "DELETE",
      });
      setCharacters((current) => current.filter((c) => c.id !== character.id));
    } catch {
      setError("Unable to delete character.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionPanel title="Characters">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Browse and manage characters</h2>

        <button
          onClick={openCreateCharacterModal}
          className="sw-important-button"
        >
          Create Character
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-slate-200/10 bg-slate-900/50 p-8 text-slate-300">
          Loading characters...
        </div>
      ) : (
        <>
          <CharacterList
            workId={work.id}
            characters={characters}
            onRequestDelete={openDeleteModal}
            onReorder={handleReorderCharacters}
            onSelectCharacter={(c) => setSelectedCharacterId(c.id)}
          />
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </>
      )}
    </SectionPanel>
  );
}

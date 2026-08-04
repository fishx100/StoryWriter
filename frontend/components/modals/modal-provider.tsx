"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Modal } from "@/components/modals/modal";

type ModalContextValue = {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ReactNode | null>(null);

  const openModal = useCallback((content: ReactNode) => {
    setModal(content);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({ openModal, closeModal }),
    [closeModal, openModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal open={!!modal} onClose={closeModal}>
        {modal}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside a ModalProvider");
  }

  return context;
}

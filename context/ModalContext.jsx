"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

export const MODAL_PRIORITIES = {
  onboarding: 1,
  cookie_preferences: 2,
  auth: 3,
  pwa: 4,
};

const defaultValue = {
  activeModal: null,
  requestModal: () => {},
  releaseModal: () => {},
  canShow: () => false,
  isModalActive: () => false,
  requestedModals: {},
};

const ModalContext = createContext(defaultValue);

export function ModalProvider({ children }) {
  const [requestedModals, setRequestedModals] = useState({});

  const requestModal = useCallback((id) => {
    setRequestedModals((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  }, []);

  const releaseModal = useCallback((id) => {
    setRequestedModals((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const activeModal = useMemo(() => {
    const activeIds = Object.keys(requestedModals).filter((id) => requestedModals[id]);
    if (activeIds.length === 0) return null;

    activeIds.sort((a, b) => {
      const pA = MODAL_PRIORITIES[a] ?? 999;
      const pB = MODAL_PRIORITIES[b] ?? 999;
      return pA - pB;
    });

    return activeIds[0];
  }, [requestedModals]);

  const canShow = useCallback(
    (id) => activeModal === id,
    [activeModal]
  );

  const isModalActive = useCallback(
    (id) => activeModal === id,
    [activeModal]
  );

  const value = useMemo(
    () => ({
      activeModal,
      requestModal,
      releaseModal,
      canShow,
      isModalActive,
      requestedModals,
    }),
    [activeModal, requestModal, releaseModal, canShow, isModalActive, requestedModals]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  return useContext(ModalContext);
}

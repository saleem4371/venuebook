"use client";

/**
 * components/shared/DiamondWelcomeGate.jsx
 *
 * Zero-UI mount point: wires useDiamondWelcome() to <DiamondWelcomeModal>.
 * Rendered once inside app/[locale]/layout.jsx, inside <AuthProvider>, so
 * it persists across client-side navigation within a session instead of
 * re-checking on every page. Kept as its own file (rather than inlined
 * in the modal or the layout) so the layout stays a plain server
 * component and doesn't need "use client" just to host this.
 */

import { useDiamondWelcome } from "@/hooks/useDiamondWelcome";
import DiamondWelcomeModal from "./DiamondWelcomeModal";

export default function DiamondWelcomeGate() {
  const { open, dismiss, bonusPoints } = useDiamondWelcome();

  return <DiamondWelcomeModal open={open} bonusPoints={bonusPoints} onClose={dismiss} />;
}

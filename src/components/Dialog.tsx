import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useI18n } from "../lib/i18n";

type Props = {
  title: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

/** Modal in the same style as the file preview. Closes with Escape, the close button, or a click on the backdrop. */
export function Dialog({ title, icon, onClose, children }: Props) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="learning-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="learning-modal"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.18 }}
      >
        <div className="learning-modal-head">
          <div className="learning-modal-icon" aria-hidden="true">
            {icon}
          </div>
          <div className="learning-modal-title">
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="learning-modal-close"
            onClick={onClose}
            aria-label={t("close")}
            title={t("close")}
          >
            <X size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div className="learning-modal-body">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

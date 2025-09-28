import React, { useEffect, useRef } from "react";
import "./Drawer.css";

export interface DrawerLink {
  id: string;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

interface DrawerProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  links: DrawerLink[];
}

/**
 * PUBLIC_INTERFACE
 * Drawer: Accessible left-side slide-in panel with a backdrop overlay.
 */
export default function Drawer({ open, title = "Menu", onClose, links }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const drawer = overlayRef.current?.querySelector('[data-drawer-panel="true"]') as HTMLElement | null;
        if (!drawer) return;
        const focusables = drawer.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const elements = Array.from(focusables).filter(el => !el.hasAttribute("disabled"));
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const t = setTimeout(() => firstButtonRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className="drawer-overlay"
      onClick={onClose}
    >
      <aside data-drawer-panel="true" className="drawer" onClick={stop}>
        <div className="drawer__header">
          <div className="drawer__brand">
            <div className="drawer__brand-logo">ICU</div>
            <div className="drawer__brand-text">
              <div className="drawer__brand-title">{title}</div>
              <div className="drawer__brand-subtitle">Ocean Professional</div>
            </div>
          </div>

          <button aria-label="Close menu" onClick={onClose} className="btn drawer__close">✕</button>
        </div>

        <nav aria-label="Side navigation" className="drawer__nav">
          <ul className="drawer__list">
            {links.map((link, idx) => (
              <li key={link.id}>
                <button
                  ref={idx === 0 ? firstButtonRef : undefined}
                  className="btn drawer__link"
                  aria-label={link.ariaLabel || link.label}
                  onClick={() => {
                    link.onClick();
                    onClose();
                  }}
                >
                  <span aria-hidden="true" className="drawer__dot" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="drawer__tips">
          Tips
          <ul>
            <li>Press Esc to close.</li>
            <li>Click outside to dismiss.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

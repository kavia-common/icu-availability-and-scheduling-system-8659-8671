import React, { useEffect, useRef } from "react";

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
 * - open: controls visibility
 * - onClose: called when overlay clicked, Escape pressed, or close button clicked
 * - links: navigation actions rendered as buttons
 */
export default function Drawer({ open, title = "Menu", onClose, links }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close on ESC and basic focus handling when opened.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // Basic focus trap: loop focus inside drawer with Tab
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
    // focus first interactive element after open
    const t = setTimeout(() => {
      firstButtonRef.current?.focus();
    }, 0);

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
      aria-label="Navigation menu"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
      }}
    >
      <aside
        data-drawer-panel="true"
        onClick={stop}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "min(88vw, 320px)",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          boxShadow: "0 10px 30px rgba(17,24,39,0.18)",
          transform: "translateX(0)",
          transition: "transform .25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="surface"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: "var(--radius-lg)",
            borderBottomRightRadius: "var(--radius-lg)",
            border: "none",
            boxShadow: "none",
            padding: 16,
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, rgba(37,99,235,.2), rgba(245,158,11,.2))",
                display: "grid",
                placeItems: "center",
                color: "var(--color-primary)",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              ICU
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Ocean Professional</div>
            </div>
          </div>

          <button
            aria-label="Close menu"
            onClick={onClose}
            className="btn"
            style={{ borderColor: "var(--color-border)", background: "#fff" }}
          >
            ✕
          </button>
        </div>

        <nav aria-label="Side navigation" style={{ padding: 12 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {links.map((link, idx) => (
              <li key={link.id}>
                <button
                  ref={idx === 0 ? firstButtonRef : undefined}
                  className="btn"
                  aria-label={link.ariaLabel || link.label}
                  onClick={() => {
                    link.onClick();
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 12,
                    background: "#fff",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "var(--color-primary-500)",
                      boxShadow: "0 0 0 3px rgba(59,130,246,.15)",
                    }}
                  />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ marginTop: "auto", padding: 12, color: "var(--color-muted)", fontSize: 12 }}>
          Tips
          <ul style={{ margin: "6px 0 0 18px" }}>
            <li>Press Esc to close.</li>
            <li>Click outside to dismiss.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

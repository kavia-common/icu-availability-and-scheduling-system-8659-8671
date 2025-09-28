import React, { useState } from "react";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void;
  onOpenScheduleManager: () => void;
  onGoHome: () => void;
}

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme, onOpenScheduleManager, onGoHome }: HeaderProps) {
  /** Header with hamburger menu, brand, quick navigation, and theme toggle. */
  const [open, setOpen] = useState(false);

  return (
    <header aria-label="App header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(1.2) blur(6px)"
      }}
    >
      <div
        className="surface"
        style={{
          borderRadius: "0 0 16px 16px",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              aria-label="Open menu"
              className="btn"
              onClick={() => setOpen(v => !v)}
              style={{
                background: "#fff",
                borderColor: "var(--color-border)",
                color: "var(--color-text)"
              }}
            >
              ☰
            </button>

            <div
              onClick={onGoHome}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onGoHome()}
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(37,99,235,.25), rgba(245,158,11,.25))",
                display: "grid",
                placeItems: "center",
                color: "var(--color-primary)",
                fontWeight: 800
              }}>ICU</div>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: .2 }}>ICU Scheduling</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Ocean Professional</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btn btn-amber" onClick={onOpenScheduleManager}>
                Schedule Manager
              </button>
              <button className="btn btn-primary" onClick={onToggleTheme}>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>

          {open && (
            <nav aria-label="Navigation" style={{ marginTop: 12, paddingBottom: 8 }}>
              <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button className="btn" onClick={onGoHome} style={{ borderColor: "var(--color-border)" }}>
                    Home
                  </button>
                  <button className="btn" onClick={onOpenScheduleManager} style={{ borderColor: "var(--color-border)" }}>
                    Schedule Manager
                  </button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

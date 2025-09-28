import React from "react";

export interface Tab {
  id: string;
  label: string;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children?: React.ReactNode;
}

// PUBLIC_INTERFACE
export default function TabLayout({ tabs, activeTab, onTabChange, children = null }: TabLayoutProps) {
  /** Presents a tab bar and renders current tab children. */
  return (
    <div className="surface" style={{ padding: 12 }}>
      <div
        role="tablist"
        aria-label="Main tabs"
        style={{
          display: "flex",
          gap: 10,
          padding: 6,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(243,244,246,0.5))",
          border: "1px solid var(--color-border)",
        }}
      >
        {tabs.map(t => {
          const selected = t.id === activeTab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={"panel-" + t.id}
              className="btn"
              onClick={() => onTabChange(t.id)}
              style={{
                background: selected ? "var(--color-surface)" : "#fff",
                borderColor: selected ? "var(--color-primary-500)" : "var(--color-border)",
                color: selected ? "var(--color-primary)" : "var(--color-text)"
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div id={"panel-" + activeTab} role="tabpanel" style={{ marginTop: 16 }}>
        {children}
      </div>
    </div>
  );
}

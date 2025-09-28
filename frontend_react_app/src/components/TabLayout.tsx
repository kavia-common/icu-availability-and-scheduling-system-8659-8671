import React from "react";
import "./TabLayout.scss";

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
export default function TabLayout({ tabs, activeTab, onTabChange, children }: TabLayoutProps) {
  /** Presents a tab bar and renders current tab children with SCSS styling. */
  return (
    <section className="tab-layout">
      <div role="tablist" aria-label="Main tabs" className="tab-layout__tabs">
        {tabs.map(t => {
          const selected = t.id === activeTab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              className={`tab-layout__btn ${selected ? "tab-layout__btn--active" : ""}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div id={`panel-${activeTab}`} role="tabpanel" className="tab-layout__panel">
        {children}
      </div>
    </section>
  );
}

import React, { useState } from "react";
import Drawer, { DrawerLink } from "./Drawer";
import "./Header.css";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void;
  onOpenSchedule: () => void;
  onGoHome: () => void;
}

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme, onOpenSchedule, onGoHome }: HeaderProps) {
  /** Header with hamburger menu and minimal actions. Home shows only this header. */
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links: DrawerLink[] = [
    { id: "schedule", label: "Schedule", onClick: onOpenSchedule, ariaLabel: "Open Schedule" },
  ];

  return (
    <header className="app-header" role="banner" aria-label="App header">
      <div className="app-header__inner">
        <button
          aria-label="Open menu"
          className="hamburger-btn"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="hamburger-btn__icon" aria-hidden>☰</span>
        </button>

        <div
          className="brand"
          onClick={onGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onGoHome()}
        >
          <div className="brand__logo">ICU</div>
          <div className="brand__text">
            <div className="brand__title">ICU Scheduling</div>
            <div className="brand__subtitle">Ocean Professional</div>
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={onToggleTheme}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Navigation"
        links={links}
      />
    </header>
  );
}

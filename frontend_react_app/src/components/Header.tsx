import React, { useRef, useState } from "react";
import Drawer, { DrawerLink } from "./Drawer";
import "./Header.scss";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void;
  onOpenSchedule: () => void;
  onGoHome: () => void;
}

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme, onOpenSchedule, onGoHome }: HeaderProps) {
  /** Header with accessible hamburger menu and minimal actions. Home shows only this header. */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const links: DrawerLink[] = [
    { id: "schedule", label: "Schedule", onClick: onOpenSchedule, ariaLabel: "Open Schedule" },
  ];

  const openMenu = () => setDrawerOpen(true);
  const closeMenu = () => {
    setDrawerOpen(false);
    // Return focus to the hamburger after closing for accessibility
    setTimeout(() => hamburgerRef.current?.focus(), 0);
  };

  return (
    <header className="app-header" role="banner" aria-label="App header">
      <div className="app-header__inner">
        {/* Functional hamburger replacing <i class='bi bi-list menu-icon'></i> */}
        <button
          ref={hamburgerRef}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          className="hamburger-btn"
          onClick={openMenu}
        >
          <svg
            className="hamburger-btn__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
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

      <div id="app-drawer">
        <Drawer
          open={drawerOpen}
          onClose={closeMenu}
          title="Navigation"
          links={links}
        />
      </div>
    </header>
  );
}

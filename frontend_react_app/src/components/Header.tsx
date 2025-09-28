import React, { useEffect, useRef, useState } from "react";
import Drawer, { DrawerLink } from "./Drawer";
import "./Header.scss";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void; // preserve prop for compatibility
  onOpenSchedule: () => void;
  onGoHome: () => void;
}

/**
 * PUBLIC_INTERFACE
 * Header: Ocean Professional header with hamburger-driven Drawer and user menu.
 * Structure and style match the user's latest code; only the menu icon is a standard hamburger.
 */
export default function Header({ onOpenSchedule, onGoHome }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const links: DrawerLink[] = [
    { id: "schedule", label: "Schedule", onClick: onOpenSchedule, ariaLabel: "Open Schedule" },
  ];

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => {
    setDrawerOpen(false);
    // Restore focus to hamburger after drawer closes
    setTimeout(() => hamburgerRef.current?.focus(), 0);
  };

  const toggleMenu = () => setMenuOpen(v => !v);
  const closeMenu = () => setMenuOpen(false);

  // Close user menu on outside click or Esc
  useEffect(() => {
    if (!menuOpen) return;

    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current || !menuButtonRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target) && !menuButtonRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        setTimeout(() => menuButtonRef.current?.focus(), 0);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!menuOpen) return;
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;

    const idx = Array.from(items).findIndex(el => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1 + items.length) % items.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  };

  const handleLogout = () => {
    // Placeholder for auth integration
    setMenuOpen(false);
  };

  return (
    <header className="icu-header" role="banner" aria-label="ICU Scheduler header">
      <div className="icu-header__inner">
        {/* Left: Hamburger (standard accessible SVG icon) */}
        <button
          ref={hamburgerRef}
          type="button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          className="icu-header__hamburger"
          onClick={openDrawer}
        >
          <svg
            className="icu-header__hamburger-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Center: Logo + App Name */}
        <div
          className="icu-brand"
          role="button"
          tabIndex={0}
          onClick={onGoHome}
          onKeyDown={(e) => e.key === "Enter" && onGoHome()}
          aria-label="Go to home"
        >
          <div className="icu-brand__logo" aria-hidden="true">
            <span className="icu-brand__logo-text">ICU</span>
          </div>
          <div className="icu-brand__text">
            <div className="icu-brand__title">ICU Scheduler</div>
          </div>
        </div>

        {/* Right: User avatar + dropdown */}
        <div className="icu-user">
          <button
            ref={menuButtonRef}
            type="button"
            className="icu-user__btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="user-menu"
            onClick={toggleMenu}
          >
            <span className="icu-user__avatar" aria-hidden="true">JD</span>
            <span className="icu-user__chevron" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 20 20">
                <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="sr-only">Open user menu</span>
          </button>

          {menuOpen && (
            <div
              id="user-menu"
              ref={menuRef}
              role="menu"
              aria-label="User menu"
              className="icu-user__menu"
              onKeyDown={onMenuKeyDown}
            >
              <button role="menuitem" className="icu-user__menu-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer host */}
      <div id="app-drawer">
        <Drawer open={drawerOpen} onClose={closeDrawer} title="Navigation" links={links} />
      </div>
    </header>
  );
}

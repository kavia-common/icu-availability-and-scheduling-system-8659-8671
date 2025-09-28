import React, { useEffect, useRef, useState } from "react";
import Drawer, { DrawerLink } from "./Drawer";
import "./Header.scss";

interface HeaderProps {
  theme: "ocean" | "dark";
  onToggleTheme: () => void; // kept for compatibility though not surfaced in UI per requirements
  onOpenSchedule: () => void;
  onGoHome: () => void;
}

/**
 * PUBLIC_INTERFACE
 * ICUHeader: Ocean Professional header for ICU Scheduler.
 * - Left: Hamburger button opens an accessible Drawer.
 * - Center: App logo + name ("ICU Scheduler").
 * - Right: User avatar with dropdown (Logout).
 * Accessibility:
 *  - Hamburger has aria attributes and restores focus on close.
 *  - Avatar menu is button-activated, dismisses on Esc/click-out, arrow key navigation, and tab-cycling supported.
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
    setTimeout(() => hamburgerRef.current?.focus(), 0);
  };

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  // Click outside to close user menu
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

    const idx = Array.from(items).findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(idx + 1 + items.length) % items.length];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  };

  const handleLogout = () => {
    // Placeholder: wire actual logout when auth exists
    // For now simply close the menu
    setMenuOpen(false);
  };

  return (
    <header className="icu-header" role="banner" aria-label="ICU Scheduler header">
      <div className="icu-header__inner">
        {/* Left: Hamburger */}
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
          {/* Using inline SVG to avoid external icon deps; stylistically matches bi-list */}
          <svg
            className="icu-header__hamburger-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
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
            {/* Simple monogram in brand gradient */}
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

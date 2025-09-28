import React, { useEffect, useRef, useState } from "react";
import "./Header.scss";
import "./HeaderLocalOverrides.scss";
import { useNavigate } from "react-router-dom";
// Import Schedule page component for type awareness/reference if needed.
// Note: We do not render it here; App handles route rendering.
import ScheduleICU from "./ScheduleICU";

interface HeaderProps {
  userId?: string; // kept for compatibility with previous version
  theme?: "ocean" | "dark";
  onToggleTheme?: () => void;
  onOpenSchedule?: () => void; // App wires this to hash route "/schedule"
  onGoHome?: () => void; // App wires this to "/"
}

/**
 * PUBLIC_INTERFACE
 * Header: App top bar with a left hamburger that opens a dropdown menu including "Schedule".
 * - Minimalist logic: useState for open/close
 * - Accessibility: keyboard accessible, closes on outside click or Esc
 * - Navigation: uses onOpenSchedule() if provided, otherwise react-router-dom navigate("/schedule").
 * - Renders a <su/> custom clickable element that navigates to Schedule when clicked.
 */
export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSchedule,
  onGoHome,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close on click outside and Esc
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (btnRef.current && btnRef.current.contains(target)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!menuOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const navigateSchedule = () => {
    if (onOpenSchedule) {
      onOpenSchedule();
    } else {
      navigate("/schedule");
    }
    setMenuOpen(false);
  };

  const navigateHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate("/");
    }
    setMenuOpen(false);
  };

  const onHamburgerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !menuOpen) {
      e.preventDefault();
      setMenuOpen(true);
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLElement>('button[data-menuitem="true"], su[data-menuitem="true"]');
        first?.focus();
      }, 0);
    }
  };

  return (
    <header className="icu-header" role="banner">
      <div className="icu-header__inner">
        {/* Left cluster: Hamburger + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <button
            ref={btnRef}
            aria-label="Open menu"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="icu-header__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            onKeyDown={onHamburgerKeyDown}
          >
            <svg
              className="icu-header__hamburger-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <button
            className="icu-brand"
            aria-label="Go home"
            onClick={navigateHome}
            style={{ background: "transparent", border: "none" }}
          >
            <div className="icu-brand__logo">
              <span className="icu-brand__logo-text">ICU</span>
            </div>
            <div className="icu-brand__title">Scheduling</div>
          </button>

          {/* Dropdown menu under hamburger (positioned below and aligned to left) */}
          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Main menu"
              className="icu-user__menu"
              style={{
                position: "absolute",
                top: 52,
                left: 0,
                right: "auto",
                minWidth: 160,
              }}
            >
              <button
                data-menuitem="true"
                role="menuitem"
                className="icu-user__menu-item"
                onClick={navigateSchedule}
              >
                Schedule
              </button>

              {/* su element: a custom clickable tag that navigates to Schedule */}
              <su
                data-menuitem="true"
                role="menuitem"
                tabIndex={0}
                onClick={navigateSchedule}
                onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateSchedule();
                  }
                }}
                style={{
                  display: "inline-flex",
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: "10px 10px",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid transparent",
                  borderRadius: 10,
                  color: "var(--color-text)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
                aria-label="Go to Schedule page"
                title="Schedule"
              >
                Schedule
              </su>
            </div>
          )}
        </div>

        {/* Right cluster: Theme toggle (optional) */}
        <div className="icu-user">
          {onToggleTheme && (
            <button className="icu-user__btn" onClick={onToggleTheme} aria-label="Toggle theme">
              <span className="icu-user__avatar">{theme === "dark" ? "🌙" : "☀️"}</span>
              <span className="icu-user__chevron">Theme</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => (
  <footer className="footer">
    <small>© 2025 ICU Scheduling</small>
  </footer>
);

// Maintain compatibility with existing imports expecting a default export
export default Header;

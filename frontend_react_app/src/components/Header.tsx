import React, { useEffect, useRef, useState } from "react";
import "./Header.scss";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userId?: string;
  theme?: "ocean" | "dark";
  onToggleTheme?: () => void;
  onOpenSchedule?: () => void;
  onGoHome?: () => void;
}

/**
 * PUBLIC_INTERFACE
 * Header: App top bar with left-aligned hamburger + brand and right-aligned admin/user controls.
 * - Background color is forced to #3E85C5 (per requirement).
 * - Hamburger icon enlarged (~36–40px visual) and flush-left within content container.
 * - Admin Paper+ text and user icon are grouped and right-aligned.
 * - Accessibility: retains role="banner", ARIA for menus, Esc/Outside click to close.
 */
export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSchedule,
  onGoHome,
  userId,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close hamburger menu on click outside and Esc
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

  const handleToggleDropdown = () => setDropdownOpen((prev) => !prev);

  const navigateSchedule = () => {
    if (onOpenSchedule) onOpenSchedule();
    else navigate("/schedule");
    setMenuOpen(false);
  };

  const manageSchedule = () => {
    if (onOpenSchedule) onOpenSchedule();
    else navigate("/manageSchedule");
    setMenuOpen(false);
  };

  const navigateHome = () => {
    if (onGoHome) onGoHome();
    else navigate("/dashboard/admin");
    setMenuOpen(false);
  };

  const onHamburgerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !menuOpen) {
      e.preventDefault();
      setMenuOpen(true);
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLElement>(
          'button[data-menuitem="true"], su[data-menuitem="true"]'
        );
        first?.focus();
      }, 0);
    }
  };

  const handleChangePassword = () => {
    navigate("/changepassword", { state: { userId, from: "superadmin" } });
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="icu-header" role="banner">
      <div className="icu-header__inner">
        {/* Left cluster: hamburger + brand (flush left) */}
        <div className="icu-header__left" style={{ position: "relative" }}>
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
          >
            <div className="icu-brand__logo">
              <span className="icu-brand__logo-text">ICU</span>
            </div>
            <div className="icu-brand__title">Scheduling</div>
          </button>

          {/* Dropdown menu under hamburger, left-aligned */}
          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Main menu"
              className="icu-user__menu"
              style={{
                position: "absolute",
                top: 56,
                left: 0,
                right: "auto",
                minWidth: 180,
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
              <button
                data-menuitem="true"
                role="menuitem"
                className="icu-user__menu-item"
                onClick={manageSchedule}
              >
                manageSchedule
              </button>
            </div>
          )}
        </div>

        {/* Right cluster: Admin Paper+ text + user icon, right-aligned */}
        <div className="icu-header__right">
          <div className="icu-user" ref={dropdownRef}>
            <span className="icu-header__admin">Admin Paper+</span>
            {/* Using a simple person glyph to avoid external icon deps */}
            <span
              role="button"
              aria-label="User menu"
              tabIndex={0}
              className="icu-header__usericon"
              onClick={handleToggleDropdown}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggleDropdown();
                }
              }}
            >
              ☺
            </span>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={handleChangePassword}>
                  Change Password
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
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

export default Header;

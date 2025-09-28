import React, { useState, useRef, useEffect } from 'react';
import './HeaderLocalOverrides.scss';

import { useNavigate, Link } from 'react-router-dom';
interface HeaderProps {
  userId?: string;
  theme?: "ocean" | "dark";
  onToggleTheme?: () => void;
  onOpenSchedule?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userId, theme, onToggleTheme, onOpenSchedule, onGoHome }) => {
   console.log('Header received userId:', userId);
   const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

const handleToggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleChangePassword = () => {
    navigate('/changepassword', { state: { userId, from: 'superadmin' } });
  };

const handleLogout = () => {

localStorage.clear(); 
  window.location.href = '/login'; 
};

return (

<header className="header-footer header-PaperAns">
  <div className="header-content">
    <div className="header-left">
      <Link to="/dashboard/admin">
        <img src="/assets/logo_light.png" alt="PaperAns Logo" className="PaperAns-logo" />
      </Link>
    </div>
    <div className="header-right" ref={dropdownRef}>
      <span className="admin-text">Admin Paper+</span>
      <i className="bi bi-person user-icon" onClick={handleToggleDropdown}></i>
      {dropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-item" onClick={handleChangePassword}>Change Password</div>
          <div className="dropdown-item" onClick={handleLogout}>Logout</div>
        </div>
      )}
    </div>
  </div>
</header>

);
};

export const Footer: React.FC = () => (
  <footer className="header-footer">
    <small>© 2025 PaperAns</small>
  </footer>
);

// Maintain compatibility with existing imports expecting a default export
export default Header;

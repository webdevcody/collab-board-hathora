import { useState, useEffect } from "react";
import { Link } from "react-router";

export const STORAGE_KEY = "userToken";
import logo from "../assets/logo.svg";

interface HeaderProps {
  // Props for authenticated app mode
  userId?: string;
  onLogout?: () => void;
  // Props for landing page mode (default)
  showNavigation?: boolean;
}

export function Header({
  userId,
  onLogout,
  showNavigation = true
}: HeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(!!token);
  }, []);

  // If userId is provided, this is authenticated app mode
  const isAppMode = !!userId;

  if (isAppMode) {
    return (
      <header className="auth-header">
        <div className="auth-title">
          <img src={logo} alt="Collaborative Boards" />
          <Link to="/">Collaborative Boards</Link>
        </div>
        <div className="auth-actions">
          <span>Welcome, {userId}</span>
          <button className="button button-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
    );
  }

  // Landing page mode
  return (
    <header className="landing-header">
      <div className="landing-container">
        <div className="landing-nav">
          <div className="landing-logo">
            <img src={logo} alt="Collaborative Boards" />
            <Link to="/">Collaborative Boards</Link>
          </div>
          {showNavigation && (
            <nav className="landing-nav-links">
              <a href="#about">About</a>
              <a href="#testimonials">Testimonials</a>
              {isAuthenticated ? (
                <a href="/dashboard" className="button button-secondary">
                  Dashboard
                </a>
              ) : (
                <a href="/dashboard" className="button button-secondary">
                  Sign In
                </a>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

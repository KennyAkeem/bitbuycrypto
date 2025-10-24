import Link from "next/link";
import AuthModal from "./AuthModal";
import { useUser } from "../context/UserContext";
import { useState } from "react";

export default function Header({ showToast }) {
  const { user, logout } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [startView, setStartView] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => setMenuOpen(false);
  const openModal = (view) => {
    setStartView(view);
    setShowModal(true);
    handleNavClick();
  };

  const isAdmin = !!(user && (user.is_admin || user.profile?.is_admin));

  return (
    <header
      className="site-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 2,
        background: "#fff",
        boxShadow: "0 2px 14px 0 rgba(35,89,247,0.06)",
        borderBottom: "1px solid #e3e7ed",
      }}
    >
      <nav
        className="navbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          onClick={handleNavClick}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <h1
            style={{
              color: "#2359f7",
              fontWeight: 700,
              fontSize: "1.8rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <i className="fas fa-donate me-2"></i>Bitbuy
          </h1>
        </Link>

        {/* Hamburger */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link href="/" onClick={handleNavClick}>
            Home
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={handleNavClick}>
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" onClick={handleNavClick}>
                <button className="btn-outline">Dashboard</button>
              </Link>
              <button
                className="btn-dark"
                onClick={() => {
                  logout();
                  showToast && showToast("success", "Logged out!");
                  handleNavClick();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => openModal("login")}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link href="/" onClick={handleNavClick}>
          Home
        </Link>
        {isAdmin && (
          <Link href="/admin" onClick={handleNavClick}>
            Admin
          </Link>
        )}
        {user ? (
          <div className="mobile-actions">
            <Link href="/profile" onClick={handleNavClick}>
              <button className="btn-outline">Dashboard</button>
            </Link>
            <button
              className="btn-dark"
              onClick={() => {
                logout();
                showToast && showToast("success", "Logged out!");
                handleNavClick();
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={() => openModal("login")}
          >
            Login
          </button>
        )}
      </div>

      {/* Auth Modal */}
      {showModal && (
        <AuthModal
          initialView={startView}
          onClose={() => setShowModal(false)}
          showToast={showToast}
        />
      )}

      <style jsx>{`
        /* Common button styles */
        .btn-primary {
          background: #2359f7;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }
        .btn-outline {
          border: 1px solid #2359f7;
          color: #2359f7;
          border-radius: 50px;
          padding: 0.5rem 1rem;
          background: transparent;
          font-weight: 600;
        }
        .btn-dark {
          background: #111827;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }

        /* Desktop nav */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-links a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
        }

        /* Hamburger icon */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 26px;
          height: 20px;
          cursor: pointer;
        }
        .hamburger span {
          display: block;
          height: 3px;
          width: 100%;
          background: #2359f7;
          border-radius: 3px;
          transition: 0.3s;
        }
        .hamburger.open span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.open span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        /* Mobile menu */
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: #fff;
          border-top: 1px solid #e3e7ed;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
          transition: max-height 0.3s ease;
          overflow: hidden;
        }
        .mobile-menu.open {
          display: flex;
          padding: 1rem;
          gap: 0.75rem;
        }
        .mobile-menu a {
          color: #333;
          text-decoration: none;
          font-weight: 500;
        }
        .mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .nav-links {
            display: none;
          }
          .hamburger {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}

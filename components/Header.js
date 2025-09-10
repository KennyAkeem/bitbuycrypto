import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { useUser } from "../context/UserContext";

export default function Header({ showToast }) {
  const { user, logout } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [startView, setStartView] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false); // state for mobile menu

  return (
    <header className="site-header header bg-dark text-white">
      <div className="container header-inner d-flex align-items-center justify-content-between">
        {/* Brand */}
        <div className="brand d-flex align-items-center">
          <div className="logo me-2">B</div>
          <div>
            <h1 className="h4 mb-0">BitBuy Investments</h1>
            <p className="tag small mb-0">Simple Bitcoin investing — demo</p>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="navbar-toggler d-lg-none" 
          type="button" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className="bx bx-menu-alt-right fs-3"></i>
        </button>

        {/* Nav links */}
        <nav className={`nav navbar-collapse ${menuOpen ? "show" : "collapse"} d-lg-flex`}>
          <Link href="/" className="nav-link">
            <button className="nav-btn">Home</button>
          </Link>
          <a href="#features" className="nav-link">
            <button className="nav-btn">Features</button>
          </a>
          <a href="#reviews" className="nav-link">
            <button className="nav-btn">Reviews</button>
          </a>

          {user ? (
            <>
              <Link href="/profile" className="nav-link">
                <button className="nav-btn">Profile</button>
              </Link>
              <button
                className="nav-btn ghost"
                onClick={() => {
                  logout();
                  showToast && showToast("success", "Logged out.");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-btn"
                onClick={() => {
                  setStartView("login");
                  setShowModal(true);
                }}
              >
                Login
              </button>
              <button
                className="nav-btn primary"
                onClick={() => {
                  setStartView("register");
                  setShowModal(true);
                }}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Auth Modal */}
      {showModal && (
        <AuthModal
          initialView={startView}
          onClose={() => setShowModal(false)}
          showToast={showToast}
        />
      )}
    </header>
  );
}
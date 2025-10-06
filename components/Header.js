import Link from "next/link";
import AuthModal from "./AuthModal";
import { useUser } from "../context/UserContext";
import { useState } from "react";

export default function Header({ showToast }) {
  const { user, logout } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [startView, setStartView] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile nav when clicking any nav link
  const handleNavClick = () => setMenuOpen(false);

  // Handle login/register modal open
  const openModal = (view) => {
    setStartView(view);
    setShowModal(true);
    handleNavClick();
  };

  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-lg navbar-dark bg-white shadow-sm px-4">
        <Link href="/" className="navbar-brand p-0 d-flex align-items-center" onClick={handleNavClick}>
          <h1 className="text-primary m-0" style={{fontWeight:700, fontSize:"2rem", letterSpacing:0.5}}>
            <i className="fas fa-donate me-3"></i>Bitbuy
          </h1>
        </Link>
        <button className="navbar-toggler" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`} id="navbarCollapse">
          <div className="navbar-nav ms-auto py-0">
            <Link href="/" className="nav-item nav-link active" onClick={handleNavClick}>Home</Link>
            
          
            {user && user.isAdmin && (
              <Link href="/admin" className="nav-item nav-link fw-bold" onClick={handleNavClick}>Admin</Link>
            )}
          </div>
          <div className="d-flex align-items-center flex-nowrap pt-xl-0">
            {user ? (
              <>
                <Link href="/profile" className="btn btn-outline-primary rounded-pill py-2 px-4 ms-2 flex-wrap flex-sm-shrink-0" onClick={handleNavClick}>
                  Dashboard
                </Link>
                <button
                  className="btn btn-dark rounded-pill py-2 px-4 ms-2 flex-wrap flex-sm-shrink-0"
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
                className="btn btn-primary rounded-pill text-white py-2 px-4 ms-2 flex-wrap flex-sm-shrink-0"
                onClick={() => openModal("login")}
              >
                Login
              </button>
            )}
            
          </div>
        </div>
      </nav>
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
import Link from "next/link";
import AuthModal from "./AuthModal";
import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";

export default function Header({ showToast }) {
  const { user, logout } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [startView, setStartView] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const handleNavClick = (sectionId) => {
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openModal = (view) => {
    setStartView(view);
    setShowModal(true);
    setMenuOpen(false);
  };

  const isAdmin = !!(user && (user.is_admin || user.profile?.is_admin));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["services", "investment-plans", "testimony", "faq"];
      let current = "";
      for (let id of sections) {
        const section = document.getElementById(id);
        if (section) {
          const offsetTop = section.offsetTop - 100;
          const offsetBottom = offsetTop + section.offsetHeight;
          if (window.scrollY >= offsetTop && window.scrollY < offsetBottom) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`site-header ${scrolled ? "scrolled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 50,
        transition: "all 0.3s ease",
        background: scrolled
          ? "linear-gradient(90deg, #0a1a3a, #001f52)"
          : "linear-gradient(90deg, rgba(10,26,58,0.85), rgba(0,31,82,0.85))",
        backdropFilter: "blur(10px)",
        boxShadow: scrolled ? "0 2px 14px 0 rgba(35,89,247,0.2)" : "none",
      }}
    >
      <nav
        className="navbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          onClick={() => handleNavClick("services")}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <h1
            style={{
              color: "#ffffff",
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
          {["services", "investment-plans", "testimony", "faq"].map((id) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`nav-btn ${activeSection === id ? "active" : ""}`}
            >
              {id.replace("-", " ").toUpperCase()}
            </button>
          ))}

          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              <button className="nav-btn">ADMIN</button>
            </Link>
          )}

          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                <button className="btn-outline">Dashboard</button>
              </Link>
              <button
                className="btn-dark"
                onClick={() => {
                  logout();
                  showToast && showToast("success", "Logged out!");
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => openModal("login")}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav className="mobile-nav">
          {["services", "investment-plans", "testimony", "faq"].map((id) => (
            <button
              key={id}
              className={`mobile-link ${activeSection === id ? "active" : ""}`}
              onClick={() => handleNavClick(id)}
            >
              {id.replace("-", " ").toUpperCase()}
            </button>
          ))}

          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              <button className="mobile-link">ADMIN</button>
            </Link>
          )}

          <div className="mobile-actions">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  <button className="btn-outline">Dashboard</button>
                </Link>
                <button
                  className="btn-dark"
                  onClick={() => {
                    logout();
                    showToast && showToast("success", "Logged out!");
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => openModal("login")}>
                Login
              </button>
            )}
          </div>
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

      <style jsx>{`
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Nav Buttons */
        .nav-btn {
          background: none;
          border: none;
          font-weight: 500;
          color: #f5f7ff;
          position: relative;
          padding: 0.3rem 0;
          margin: 0 0.8rem;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .nav-btn:hover {
          color: #9cc9ff;
        }
        .nav-btn.active {
          color: #ffffff;
        }
        .nav-btn.active::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #00b4d8);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Buttons */
        .btn-primary {
          background: linear-gradient(90deg, #2359f7, #00b4d8);
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

        /* Mobile Nav */
        .mobile-menu {
          position: fixed;
          top: 70px;
          left: 0;
          width: 100%;
          transform: translateY(-20px);
          height: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #0a1a3a, #001f52);
          transition: all 0.4s ease;
          opacity: 0;
          z-index: 40;
        }
        .mobile-menu.open {
          height: calc(100vh - 70px);
          opacity: 1;
          transform: translateY(0);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          gap: 1.2rem;
          color: #fff;
        }
        .mobile-link {
          background: none;
          border: none;
          color: #e4e8ff;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .mobile-link:hover {
          color: #5aa9ff;
          transform: translateX(5px);
        }
        .mobile-link.active {
          color: #00b4ff;
          border-left: 3px solid #00b4ff;
          padding-left: 0.5rem;
        }

        .mobile-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Hamburger */
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
          background: #ffffff;
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

import "../styles/globals.css";
import { useState } from "react";
import { UserProvider } from "../context/UserContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import toggle from "../components/toggle";

function MyApp({ Component, pageProps }) {
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  function showToast(type, message, duration = 3000) {
    setToast({ show: true, type, message, duration });
  }
  function hideToast() {
    setToast((t) => ({ ...t, show: false }));
  }

  // Pass showToast to Header and all pages as a prop
  return (
    <UserProvider>
      <Header showToast={showToast} />
      <main id="main">
        <Component {...pageProps} showToast={showToast} />
      </main>
      <Footer />
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
        duration={toast.duration}
      />
    </UserProvider>
  );
}






       

export default MyApp;
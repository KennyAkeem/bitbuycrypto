import "../styles/globals.css";
import { useState, useEffect } from "react";
import { UserProvider } from "../context/UserContext";
import Header from "../components/Header";
import InvestmentPlans from "../components/InvestmentPlans";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Head from "next/head";
import Script from "next/script";


function MyApp({ Component, pageProps }) {
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ✅ Load Bootstrap JS only on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  // ✅ Initialize AOS after it’s loaded
  useEffect(() => {
    const checkAOS = setInterval(() => {
      if (window.AOS) {
        window.AOS.init({
          offset: 120,
          duration: 1000,
          easing: "ease-in-out",
          once: true,
        });
        window.AOS.refresh();
        clearInterval(checkAOS);
      }
    }, 500);

    return () => clearInterval(checkAOS);
  }, []);

  function showToast(type, message, duration = 3000) {
    setToast({ show: true, type, message, duration });
  }

  function hideToast() {
    setToast((t) => ({ ...t, show: false }));
  }

  return (
    <>
      <Head>
        <title>BitBuy | Smart Investment Platform</title>
        <meta
          name="description"
          content="Invest in BitBuy with crypto — BTC, ETH, USDT — and grow your wealth securely."
        />

        {/* ✅ Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-ENjdO4Dr2bkBIFxQpeoA6uY9lZg9lF1Q6p6x9FqjLw1Ds4P5x5m5iZQ5j5Q5W5j5Q"
          crossOrigin="anonymous"
        />

      
      </Head>

      
    

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
    </>
  );
}

export default MyApp;

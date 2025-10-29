import "../styles/globals.css";
import { useState, useEffect } from "react";
import { UserProvider, useUser } from "../context/UserContext";
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

function InnerApp({ Component, pageProps, showToast, hideToast, toast }) {
  const { user } = useUser();

  return (
    <>
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

      {/* Tawk.to chat widget
          - Loads on the client only (strategy="afterInteractive")
          - Rendered only when a user exists (same condition you used for Dialogflow)
      */}
      {user && (
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6902459cb22c021953b66b6b/1j8odvrq4';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
          `,
          }}
        />
      )}
    </>
  );
}

function MyApp({ Component, pageProps }) {
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // ✅ Load Bootstrap bundle
      require("bootstrap/dist/js/bootstrap.bundle.min.js");

      // ✅ Register Service Worker (for PWA/offline support)
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
              console.log("Service Worker registered:", registration);
            })
            .catch((error) => {
              console.log("Service Worker registration failed:", error);
            });
        });
      }
    }
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
        <title>BitBuy | Smart Crypto Investment Platform</title>
        <meta
          name="description"
          content="Invest smarter with BitBuy — a secure crypto investment platform where you can grow your wealth with BTC, ETH, and USDT. Start earning daily profits with trusted blockchain technology."
        />
        <meta
          name="keywords"
          content="BitBuy, crypto investment, Bitcoin, Ethereum, USDT, crypto trading, blockchain, crypto returns, secure crypto platform, smart investment, digital assets"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="BitBuy" />
        <meta name="theme-color" content="#f8b400" />

        {/* Open Graph (Facebook, LinkedIn) */}
        <meta
          property="og:title"
          content="BitBuy | Smart Crypto Investment Platform"
        />
        <meta
          property="og:description"
          content="Join BitBuy — invest in crypto securely and grow your wealth with daily profits. BTC, ETH, and USDT supported."
        />
        <meta property="og:image" content="/images/favicon.png" />
        <meta property="og:url" content="https://bitbuy.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="BitBuy | Smart Crypto Investment Platform"
        />
        <meta
          name="twitter:description"
          content="Secure, reliable, and profitable crypto investments. Start earning daily with BitBuy today!"
        />
        <meta name="twitter:image" content="/images/favicon.png" />

        {/* Favicon */}
        <link rel="icon" href="/images/favicon.png" type="image/png" />

        {/* ✅ Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* ✅ Bootstrap CSS fallback */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-ENjdO4Dr2bkBIFxQpeoA6uY9lZg9lF1Q6p6x9FqjLw1Ds4P5x5m5iZQ5j5Q5W5j5Q"
          crossOrigin="anonymous"
        />
      </Head>

      <UserProvider>
        <InnerApp
          Component={Component}
          pageProps={pageProps}
          showToast={showToast}
          hideToast={hideToast}
          toast={toast}
        />
      </UserProvider>
    </>
  );
}

export default MyApp;
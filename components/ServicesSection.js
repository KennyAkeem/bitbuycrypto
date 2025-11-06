import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const images = [
  "/images/about-2.jpg",
  "/images/about-4.jpg",
  "/images/about-5.jpg",
  "/images/about-3.png",
];

const serviceIcons = [
  "fas fa-donate",
  "fas fa-user-tie",
  "fas fa-lightbulb",
  "fas fa-user-secret",
];

const SERVICES = [
  {
    id: "business_strategy",
    nameKey: "services.business_strategy.title",
    nameFallback: "Business Strategy Investments",
    descKey: "services.business_strategy.description",
    descFallback:
      "Unlock the full potential of your assets with our futuristic investment strategies. We blend AI with deep market insights.",
    imgIndex: 0,
    icon: serviceIcons[0],
  },
  {
    id: "consultancy",
    nameKey: "services.consultancy.title",
    nameFallback: "Consultancy & Advice",
    descKey: "services.consultancy.description",
    descFallback:
      "Our expert consultants provide tailored advice, helping you navigate the complex world of modern finance and tech.",
    imgIndex: 1,
    icon: serviceIcons[1],
  },
  {
    id: "investments_planning",
    nameKey: "services.investments_planning.title",
    nameFallback: "Investments Planning",
    descKey: "services.investments_planning.description",
    descFallback:
      "Plan your investments with confidence—smart analytics, risk assessment, and adaptive growth models at your fingertips.",
    imgIndex: 2,
    icon: serviceIcons[2],
  },
  {
    id: "private_client",
    nameKey: "services.private_client.title",
    nameFallback: "Private Client Investment",
    descKey: "services.private_client.description",
    descFallback:
      "Exclusive private client services for high-net-worth individuals. Secure, discrete, and designed for exponential growth.",
    imgIndex: 3,
    icon: serviceIcons[3],
  },
];

export default function ServicesSection() {
  const { t, i18n } = useTranslation();
  // hydration-safe: only use translations after client mount to avoid SSR hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const tSafe = (key, fallback) => (isMounted ? t(key, { defaultValue: fallback }) : fallback);

  return (
    <motion.section
      className="service-section-modern"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
      aria-labelledby="services-heading"
    >
      <div className="container">
        <motion.div
          className="section-title-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h4
            className="section-title"
            id="services-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            {tSafe("services.eyebrow", "Our Services")}
          </motion.h4>
          <motion.h1
            className="section-subtitle"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            {tSafe("services.heading", "Explore Sci-Fi Investing")}
          </motion.h1>
        </motion.div>

        <div className="service-grid">
          {SERVICES.map((svc, idx) => (
            <motion.div
              className="service-card"
              key={svc.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.20 }}
              transition={{ duration: 0.65, delay: idx * 0.12 }}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(35,89,247,0.13)" }}
            >
              <motion.div
                className="service-img"
                initial={{ opacity: 0, scale: 0.93 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <img
                  src={images[svc.imgIndex]}
                  alt={tSafe(svc.nameKey, svc.nameFallback)}
                />
              </motion.div>

              <div className="service-content">
                <div className="service-content-inner">
                  <motion.a
                    href="#"
                    className="h4 mb-4 d-inline-flex text-start"
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.6 }}
                    aria-label={tSafe(svc.nameKey, svc.nameFallback)}
                  >
                    <i className={svc.icon + " me-2"} aria-hidden />
                    {tSafe(svc.nameKey, svc.nameFallback)}
                  </motion.a>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    {tSafe(svc.descKey, svc.descFallback)}
                  </motion.p>

                  <motion.a
                    className="btn service-btn"
                    href="#"
                    whileHover={{ scale: 1.07, backgroundColor: "#2359f7" }}
                    transition={{ type: "spring", stiffness: 260 }}
                    aria-label={tSafe("services.cta", "Bitbuy")}
                  >
                    {tSafe("services.cta", "Bitbuy")}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.20 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        />
      </div>
    </motion.section>
  );
}
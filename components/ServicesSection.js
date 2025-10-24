import React from "react";
import { motion } from "framer-motion";


const images = [
  "/images/about-2.jpg",
   "/images/about-4.jpg",
    "/images/about-5.jpg",
  "/images/about-3.png",
  "/images/blog-1.jpg",
  "/images/blog-2.jpg"
];

const serviceTitles = [
  "Business Strategy Investments",
  "Consultancy & Advice",
  "Investments Planning",
  "Private Client Investment"
];

const serviceIcons = [
  "fas fa-donate",
  "fas fa-user-tie",
  "fas fa-lightbulb",
  "fas fa-user-secret"
];

// Different random text for each service
const serviceDescriptions = [
  "Unlock the full potential of your assets with our futuristic investment strategies. We blend AI with deep market insights.",
  "Our expert consultants provide tailored advice, helping you navigate the complex world of modern finance and tech.",
  "Plan your investments with confidence—smart analytics, risk assessment, and adaptive growth models at your fingertips.",
  "Exclusive private client services for high-net-worth individuals. Secure, discrete, and designed for exponential growth."
];

export default function ServicesSection() {
  return (
    <motion.section
      className="service-section-modern"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            Our Services
          </motion.h4>
          <motion.h1
            className="section-subtitle"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            Explore Sci-Fi Investing
          </motion.h1>
        </motion.div>
        <div className="service-grid">
          {[0, 1, 2, 3].map((idx) => (
            <motion.div
              className="service-card"
              key={idx}
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
                <img src={images[idx]} alt={serviceTitles[idx]} />
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
                  >
                    <i className={serviceIcons[idx] + " me-2"}></i>
                    {serviceTitles[idx]}
                  </motion.a>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    {serviceDescriptions[idx]}
                  </motion.p>
                  <motion.a
                    className="btn service-btn"
                    href="#"
                    whileHover={{ scale: 1.07, backgroundColor: "#2359f7" }}
                    transition={{ type: "spring", stiffness: 260 }}
                  >
                    Bitbuy
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
        >
          
        </motion.div>
      </div>
    </motion.section>
  );
}
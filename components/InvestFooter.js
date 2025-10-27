import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function InvestFooter() {
  const [activeSection, setActiveSection] = useState("");

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["services", "investment-plans", "testimony", "faq"];
      let current = "";

      for (let id of sections) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
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

  // Animation variants
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  // Sponsor data
  const sponsors = [
    { src: "/images/banner-coin1.png", alt: "Binance", color: "#F3BA2F" },
    { src: "/images/banner-coin2.png", alt: "Ripple", color: "#00AAE4" },
    { src: "/images/banner-coin3.png", alt: "Coinbase", color: "#1652F0" },
    { src: "/images/banner-coin4.png", alt: "Bitcoin", color: "#F7931A" },
  ];

  // Footer nav items
  const navItems = [
    { id: "services", label: "Services" },
    { id: "investment-plans", label: "Investment Plans" },
    { id: "testimony", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <motion.footer
      className="invest-footer"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-container">
        {/* Top Sponsors Section */}
        <motion.div
          className="footer-col footer-sponsors"
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.h4
            className="text-white mb-4"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Top Sponsors
          </motion.h4>

          <motion.div
            className="flex flex-wrap gap-6 justify-start items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {sponsors.map((sponsor, i) => (
              <motion.div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md p-3"
                whileHover={{
                  scale: 1.15,
                  boxShadow: `0 0 25px ${sponsor.color}`,
                }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.alt}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Explore Navigation */}
        <motion.div
          className="footer-col"
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          <motion.h4
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Explore
          </motion.h4>

          <motion.ul
            className="footer-link-group"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {navItems.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`footer-link transition-colors duration-300 ${
                    activeSection === section.id
                      ? "text-[#1bc6ff] font-semibold"
                      : "text-gray-300 hover:text-[#1bc6ff]"
                  }`}
                >
                  <i className="fas fa-angle-right mr-1"></i> {section.label}
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="footer-col"
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.26 }}
        >
          <motion.h4
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Contact Info
          </motion.h4>
          <motion.ul
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <li>
              <a href="#">
                <i className="fas fa-map-marker-alt"></i> 540 Street, New York, USA
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-envelope"></i> binance.net.inc@gmail.com
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-phone"></i> +1 5667 8756 467
              </a>
            </li>
          </motion.ul>

          <motion.div
            className="footer-socials"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {["facebook-f", "twitter", "instagram", "linkedin-in"].map((icon, i) => (
              <motion.a
                key={i}
                className="social-icon"
                href="#"
                whileHover={{
                  scale: 1.13,
                  backgroundColor: "#1bc6ff",
                }}
                transition={{ type: "spring", stiffness: 240 }}
              >
                <i className={`fab fa-${icon}`}></i>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Popular Posts */}
        <motion.div
          className="footer-col"
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.34 }}
        >
          <motion.h4
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Popular Posts
          </motion.h4>
          <motion.div
            className="footer-post-group"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div>
              <div className="footer-post-title">Investment</div>
              <a href="#">Revisiting Your Investment & Distribution Goals</a>
            </div>
            <div>
              <div className="footer-post-title">Business</div>
              <a href="#">Dimensional Fund Advisors Interview</a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span>
          © 2025 Bitbuy Invest. All rights reserved. | Designed by{" "}
          <a href="#">HRH</a>
        </span>
      </motion.div>
    </motion.footer>
  );
}

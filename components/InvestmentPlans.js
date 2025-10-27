import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const plans = [
  { id: "starter", name: "Starter Plan", range: "$100 - $9,999", duration: "30 days", yield: "5% daily", accent: "#00e0ff" },
  { id: "growth", name: "Growth Plan", range: "$10,000 - $49,999", duration: "45 days", yield: "8% daily", accent: "#00ff85" },
  { id: "premium", name: "Premium Plan", range: "$50,000 - $250,000", duration: "60 days", yield: "10% daily", accent: "#ffd500" },
  { id: "elite", name: "Elite Plan", range: "$251,000 - ∞", duration: "90 days", yield: "12% daily", accent: "#ff00ff" },
];

export default function InvestmentPlans() {
  const { user, openAuthModal } = useUser();
  const router = useRouter();
  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [0, window.innerHeight], [15, -15]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-15, 15]);

  useEffect(() => {
    const section = sectionRef.current;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    section?.addEventListener("mousemove", handleMouseMove);
    return () => section?.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  function handleInvestClick(plan) {
    if (user) router.push("/profile?invest=true");
    else openAuthModal && openAuthModal();
  }

  return (
    <motion.section
      ref={sectionRef}
      className="investment-section"
      style={{ rotateX, rotateY }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="neon-cursor"></div>
      <div className="container">
        <header className="section-head">
          <h2 className="title">🚀 Investment Plans</h2>
          <p className="subtitle">
            Choose from our futuristic high-yield investment tiers — built for the new era of finance.
          </p>
        </header>

        <div className="grid">
          {plans.map((plan, idx) => (
            <motion.article
              key={plan.id}
              className="card"
              style={{ "--accent": plan.accent }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="glow"></div>
              <div className="card-body">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="range">{plan.range}</p>
                <p className="duration">{plan.duration}</p>
                <p className="yield">{plan.yield}</p>
              </div>
              <button className="cta" onClick={() => handleInvestClick(plan)}>
                Invest Now <span className="arrow">→</span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .investment-section {
          position: relative;
          padding: clamp(60px, 10vw, 120px) 20px;
          background: radial-gradient(circle at 20% 20%, #05010f, #000);
          overflow: hidden;
          color: white;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .neon-cursor {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.2), transparent 70%);
          pointer-events: none;
          border-radius: 50%;
          filter: blur(60px);
          animation: moveTrail 6s infinite alternate ease-in-out;
        }

        @keyframes moveTrail {
          0% { top: 10%; left: 15%; background: radial-gradient(circle, #00e0ff44, transparent 70%); }
          50% { top: 60%; left: 60%; background: radial-gradient(circle, #ff00ff44, transparent 70%); }
          100% { top: 20%; left: 80%; background: radial-gradient(circle, #00ff8544, transparent 70%); }
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          background: linear-gradient(90deg, #00e0ff, #ff00ff);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 0 20px #00e0ff66;
          margin-bottom: 10px;
          animation: glowPulse 3s infinite ease-in-out;
        }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 15px #00e0ff66; }
          50% { text-shadow: 0 0 30px #ff00ffaa; }
        }

        .subtitle {
          color: #b3b3b3;
          margin-bottom: 50px;
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          line-height: 1.6;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 28px;
          justify-content: center;
          align-items: stretch;
        }

        .card {
          position: relative;
          border: 1px solid var(--accent);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.15);
          padding: 30px 20px 50px;
          backdrop-filter: blur(15px);
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, var(--accent), transparent);
          opacity: 0.5;
          transform: translateX(-100%);
          transition: all 0.6s ease;
        }

        .card:hover::before {
          transform: translateX(100%);
        }

        .card:hover {
          box-shadow: 0 0 45px var(--accent);
          transform: translateY(-5px);
        }

        .plan-name {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 800;
          color: var(--accent);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .range, .duration, .yield {
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          color: #551919ff;
          margin: 6px 0;
        }

        .yield {
          color: var(--accent);
          font-weight: 700;
          text-shadow: 0 0 12px var(--accent);
        }

        .cta {
          margin-top: 20px;
          background: linear-gradient(90deg, var(--accent), #ffffff);
          color: #000;
          border: none;
          font-weight: 800;
          padding: 12px 28px;
          border-radius: 999px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .cta::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, white 0%, transparent 70%);
          transform: scale(0);
          opacity: 0.3;
          transition: transform 0.3s ease;
        }

        .cta:hover::after {
          transform: scale(4);
        }

        .cta:hover {
          background: linear-gradient(90deg, #fff, var(--accent));
          transform: translateY(-3px);
          box-shadow: 0 0 20px var(--accent);
        }

        .arrow {
          margin-left: 8px;
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .cta:hover .arrow {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .investment-section {
            padding: 70px 15px;
          }
          .cta {
            width: 100%;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .grid {
            gap: 18px;
          }
          .card {
            padding: 24px 16px 40px;
          }
        }
      `}</style>
    </motion.section>
  );
}

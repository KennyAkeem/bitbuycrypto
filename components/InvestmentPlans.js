import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

/*
  Modern, responsive Investment Plans component (updated).
  - Expanded plans from $100 up to $100,000
  - Reasonable duration and yield progression (lower stake = shorter/safer-ish yield, higher tiers = longer/higher yield)
  - Same modern styling, icons and animations as before
*/

const plans = [
  { id: "micro", name: "Micro", amount: "$100", duration: "3 days", yield: "+15%", accent: "#06b6d4", icon: "spark" },
  { id: "starter", name: "Starter", amount: "$500", duration: "3 days", yield: "+18%", accent: "#0ea5a4", icon: "bolt" },
  { id: "basic", name: "Basic", amount: "$1,000", duration: "4 days", yield: "+30%", accent: "#06b6d4", icon: "shield" },
  { id: "bronze", name: "Bronze", amount: "$10,000", duration: "5 days", yield: "+35%", accent: "#c2410c", icon: "shield" },
  { id: "silver", name: "Silver", amount: "$25,000", duration: "6 days", yield: "+40%", accent: "#64748b", icon: "bolt" },
  { id: "gold", name: "Gold", amount: "$50,000", duration: "7 days", yield: "+45%", accent: "#f59e0b", icon: "star" },
  { id: "platinum", name: "Platinum", amount: "$100,000", duration: "10 days", yield: "+50%", accent: "#7c3aed", icon: "crown" },
];

function Icon({ name, color }) {
  const common = { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "spark":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 18v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9 4.9l2.8 2.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.3 16.3l2.8 2.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2l7 4v5c0 5-3.6 9.8-7 11-3.4-1.2-7-6-7-11V6l7-4z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="rgba(0,0,0,0.03)" />
          <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common} aria-hidden>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="rgba(0,0,0,0.03)" />
        </svg>
      );
    case "star":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2l2.6 5.9L21 9l-4.5 3.7L17.2 21 12 17.8 6.8 21l.7-8.3L3 9l6.4-1.1L12 2z" stroke={color} strokeWidth="1.0" strokeLinejoin="round" fill="rgba(0,0,0,0.03)" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 11l3-6 5 6 5-6 3 6v7H3v-7z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="rgba(0,0,0,0.02)" />
        </svg>
      );
    default:
      return null;
  }
}

export default function InvestmentPlans() {
  const { user, openAuthModal } = useUser();
  const router = useRouter();

  function handleInvestClick(plan) {
    if (user) {
      router.push("/profile?invest=true");
    } else {
      openAuthModal && openAuthModal();
    }
  }

  return (
    <motion.section
      className="investment-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Investment Plans</p>
          <h2 className="title">Choose the plan that suits your ambition</h2>
          <p className="subtitle">Short-term, high-yield crypto investment plans with transparent durations and payouts.</p>
        </header>

        <div className="grid">
          {plans.map((plan, idx) => {
            const featured = plan.id === "gold" || plan.id === "platinum";
            return (
              <motion.article
                key={plan.id}
                className={`card ${featured ? "card-featured" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ type: "spring", stiffness: 160, damping: 18, delay: idx * 0.08 }}
                whileHover={{ translateY: -8, boxShadow: "0 18px 40px rgba(16,24,40,0.12)" }}
                role="region"
                aria-labelledby={`plan-${plan.id}`}
              >
                <div className="card-top">
                  <div className="icon-wrap" style={{ background: `${plan.accent}22`, boxShadow: `inset 0 0 18px ${plan.accent}11` }}>
                    <Icon name={plan.icon} color={plan.accent} />
                  </div>
                  <div className="plan-meta">
                    <h3 id={`plan-${plan.id}`} className="plan-name">{plan.name}</h3>
                    <div className="plan-badge" style={{ background: `${plan.accent}1a`, color: plan.accent }}>
                      {featured ? "Popular" : "Standard"}
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="amount">{plan.amount}</div>
                  <ul className="features" aria-hidden>
                    <li>
                      <span className="feature-label">Duration</span>
                      <span className="feature-value">{plan.duration}</span>
                    </li>
                    <li>
                      <span className="feature-label">Yield</span>
                      <span className="feature-value">{plan.yield}</span>
                    </li>
                    <li>
                      <span className="feature-label">Min. Invest</span>
                      <span className="feature-value">{plan.amount}</span>
                    </li>
                  </ul>
                </div>

                <div className="card-footer">
                  <button
                    className="cta"
                    onClick={() => handleInvestClick(plan)}
                    aria-label={`Invest now in ${plan.name} plan`}
                  >
                    Invest Now
                    <svg className="cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M13 5l6 7-6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .investment-section {
          padding: 64px 0;
          background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
        }

        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 18px;
        }

        .section-head {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 36px;
        }
        .eyebrow {
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 0.4px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 1.9rem;
          margin: 0 0 8px;
          color: #0f172a;
        }
        .subtitle {
          margin: 0;
          color: #475569;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 18px;
          margin-top: 22px;
        }

        @media (min-width: 640px) {
          .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (min-width: 992px) {
          .grid { grid-template-columns: repeat(3, 1fr); gap: 22px; }
        }
        @media (min-width: 1200px) {
          .grid { grid-template-columns: repeat(4, 1fr); gap: 26px; }
        }

        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.7));
          border-radius: 14px;
          padding: 16px;
          border: 1px solid rgba(15,23,42,0.04);
          display: flex;
          flex-direction: column;
          min-height: 280px;
          transition: transform 180ms ease, box-shadow 220ms ease;
          position: relative;
          overflow: visible;
        }

        .card-featured {
          border: none;
          background: linear-gradient(180deg, rgba(124,58,237,0.06), rgba(124,58,237,0.03));
          outline: 1px solid rgba(124,58,237,0.06);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transform: translateZ(0);
        }

        .plan-meta {
          display: flex;
          flex-direction: column;
        }
        .plan-name {
          font-size: 1.05rem;
          margin: 0;
          color: #0f172a;
          font-weight: 700;
        }
        .plan-badge {
          font-size: 12px;
          margin-top: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          display: inline-block;
        }

        .card-body {
          margin-top: 8px;
          flex: 1;
        }

        .amount {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0b1220;
          margin-bottom: 12px;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 8px;
        }
        .features li {
          display: flex;
          justify-content: space-between;
          color: #334155;
          font-weight: 600;
          padding: 8px;
          border-radius: 8px;
          background: rgba(15,23,42,0.02);
        }
        .feature-label { opacity: 0.85; font-weight: 600; }
        .feature-value { font-weight: 800; color: #0f172a; }

        .card-footer {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          background: linear-gradient(90deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          border-radius: 999px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37,99,235,0.12);
          transition: transform 180ms ease, box-shadow 220ms ease, background 200ms ease;
        }
        .cta:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(16,24,40,0.12); }
        .cta:active { transform: translateY(-1px) scale(0.995); }

        .cta-arrow { opacity: 0.9; transform: translateX(0); transition: transform 220ms ease; }
        .cta:hover .cta-arrow { transform: translateX(4px); }

        .card-featured .plan-name { color: #5b21b6; }
        .card-featured .amount { color: #3b0764; }
        .card-featured .cta { background: linear-gradient(90deg,#7c3aed,#4c1d95); box-shadow: 0 18px 50px rgba(124,58,237,0.12); }

        @media (max-width: 480px) {
          .container { padding-left: 12px; padding-right: 12px; }
          .card { padding: 14px; min-height: 260px; }
          .icon-wrap { width: 56px; height: 56px; }
          .amount { font-size: 1.25rem; }
        }
      `}</style>
    </motion.section>
  );
}
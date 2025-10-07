import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

const plans = [
  { name: "Basic", amount: "$100", duration: "3 days", yield: "+30%" },
  { name: "Bronze", amount: "$500", duration: "3 days", yield: "+35%" },
  { name: "Silver", amount: "$1,000", duration: "5 days", yield: "+40%" },
  { name: "Gold", amount: "$5,000", duration: "7 days", yield: "+45%" },
  { name: "Platinum", amount: "$10,000", duration: "10 days", yield: "+50%" },
];

export default function InvestmentPlans() {
  const { user, openAuthModal } = useUser();
  const router = useRouter();

  function handleInvestClick(plan) {
    if (user) {
      // Go to profile page with invest modal open
      router.push("/profile?invest=true");
    } else {
      openAuthModal();
    }
  }

  return (
    <div className="container-fluid investment-section py-5 bg-light">
      <div className="container py-5">
        <div className="text-center mx-auto pb-5" style={{ maxWidth: 800 }}>
          <h4 className="text-primary">Investment Plans</h4>
          <h1 className="display-4">Choose the Plan That Suits You</h1>
        </div>
        <div className="row g-4 justify-content-center">
          {plans.map((plan, idx) => (
            <div className="col-md-6 col-lg-4 col-xl-3" key={idx}>
              <div className="investment-card">
                <h2 className="plan-title">{plan.name}</h2>
                <ul className="plan-features">
                  <li><strong>Amount:</strong> {plan.amount}</li>
                  <li><strong>Duration:</strong> {plan.duration}</li>
                  <li><strong>Total Yield:</strong> {plan.yield}</li>
                </ul>
                <button
                  className="btn btn-primary invest-btn"
                  onClick={() => handleInvestClick(plan)}
                >
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
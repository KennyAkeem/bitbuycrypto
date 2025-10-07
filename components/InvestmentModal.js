import { useUser } from "../context/UserContext";

export default function InvestmentModal({ show, onClose }) {
  const { selectedPlan } = useUser();

  if (!show) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>&times;</button>
        <h3 className="mb-3">Invest in {selectedPlan?.name || "Plan"}</h3>
        <div>
          <ul>
            <li><strong>Amount:</strong> {selectedPlan?.amount}</li>
            <li><strong>Duration:</strong> {selectedPlan?.duration}</li>
            <li><strong>Yield:</strong> {selectedPlan?.yield}</li>
          </ul>
          <button className="btn btn-success" onClick={onClose}>Proceed (stub)</button>
        </div>
      </div>
    </div>
  );
}
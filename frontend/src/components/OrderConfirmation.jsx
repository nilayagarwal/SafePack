import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentId, amount, packingPlan, address } = location.state || {};

  if (!orderId) {
    return (
      <div className="oc-empty">
        <h2>No order found</h2>
        <button onClick={() => navigate('/')} className="back-btn">← Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="oc-hero">
        <div className="success-check">
          <svg viewBox="0 0 52 52" className="checkmark">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h1 className="oc-title">Order Confirmed! 🎉</h1>
        <p className="oc-subtitle">Your groceries are being packed safely</p>
      </div>

      <div className="oc-content">
        <div className="oc-receipt glass-card">
          <h3>🧾 Payment Receipt</h3>
          <div className="receipt-rows">
            <div className="receipt-row">
              <span>Order ID</span>
              <span className="receipt-value">{orderId?.slice(0, 20)}...</span>
            </div>
            <div className="receipt-row">
              <span>Payment ID</span>
              <span className="receipt-value">{paymentId?.slice(0, 20)}...</span>
            </div>
            <div className="receipt-row">
              <span>Amount Paid</span>
              <span className="receipt-value amount">₹{amount}</span>
            </div>
            <div className="receipt-row">
              <span>Delivery To</span>
              <span className="receipt-value">{address?.fullName}</span>
            </div>
            <div className="receipt-row">
              <span>Address</span>
              <span className="receipt-value">{address?.street}, {address?.city} - {address?.pincode}</span>
            </div>
            <div className="receipt-row">
              <span>Date</span>
              <span className="receipt-value">{new Date().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {packingPlan && (
          <div className="oc-packing glass-card">
            <h3>📦 Packing Instructions</h3>
            <p className="packing-note">
              Your items will be packed in this order to prevent bruising:
            </p>
            <div className="packing-sequence">
              {packingPlan.packedStack.map((item, index) => (
                <div
                  key={index}
                  className={`seq-item status-${item.status.toLowerCase()}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="seq-number">{index + 1}</span>
                  <span className="seq-emoji">{item.image}</span>
                  <div className="seq-info">
                    <span className="seq-name">{item.name}</span>
                    <span className="seq-layer">{item.layer} · {item.weight}kg</span>
                  </div>
                  <span className={`seq-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <p className="packing-order-note">
              ↑ Pack from #1 (bottom) to #{packingPlan.packedStack.length} (top)
            </p>
          </div>
        )}
      </div>

      <button className="continue-btn" onClick={() => navigate('/')} id="continue-shopping-btn">
        🛒 Continue Shopping
      </button>
    </div>
  );
}

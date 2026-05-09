import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, packingPlan, totalPrice, totalWeight } = location.state || {};

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No items to checkout</h2>
        <button onClick={() => navigate('/')} className="back-btn">← Back to Shop</button>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    // Validate address
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.pincode) {
      setError('Please fill in all delivery details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SafePack',
        description: 'Smart Grocery Delivery',
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. Verify payment
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              navigate('/order-confirmation', {
                state: {
                  orderId: verifyData.orderId,
                  paymentId: verifyData.paymentId,
                  amount: totalPrice,
                  packingPlan,
                  address,
                },
              });
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Payment verification error. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <button className="back-link" onClick={() => navigate('/')}>
        ← Back to Shop
      </button>

      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-form-section">
          <div className="section-card glass-card">
            <h2>📍 Delivery Address</h2>

            {error && (
              <div className="checkout-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={address.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  id="street"
                  type="text"
                  value={address.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="123, Main Street, Apt 4B"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={address.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    type="text"
                    value={address.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-summary-section">
          <div className="section-card glass-card">
            <h2>🧾 Order Summary</h2>

            <div className="order-summary-stats">
              <div className="os-row">
                <span>Items</span>
                <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="os-row">
                <span>Total Weight</span>
                <span>{totalWeight?.toFixed(2)} kg</span>
              </div>
              <div className="os-row">
                <span>Delivery</span>
                <span className="free-delivery">FREE</span>
              </div>
              <div className="os-row total">
                <span>Total Amount</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            {packingPlan && (
              <div className="packing-preview">
                <h4>📦 Packing Plan</h4>
                <div className="mini-stack">
                  {[...packingPlan.packedStack].reverse().map((item, i) => (
                    <div key={i} className={`mini-item status-${item.status.toLowerCase()}`}>
                      {item.image && item.image.startsWith('/') ? (
                        <img src={item.image} alt={item.name} className="mini-item-thumb" />
                      ) : (
                        <span>{item.image}</span>
                      )}
                      <span>{item.name}</span>
                      <span className={`mini-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={loading}
              id="pay-with-razorpay-btn"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>💳 Pay ₹{totalPrice} with Razorpay</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

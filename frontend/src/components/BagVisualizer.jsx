import './BagVisualizer.css';

const STATUS_COLORS = {
  SAFE: 'var(--color-safe)',
  WARNING: 'var(--color-warning)',
  CRITICAL: 'var(--color-critical)',
};

const STATUS_BG = {
  SAFE: 'rgba(16, 185, 129, 0.08)',
  WARNING: 'rgba(245, 158, 11, 0.08)',
  CRITICAL: 'rgba(239, 68, 68, 0.08)',
};

export default function BagVisualizer({ packingPlan, roadCondition, onRoadChange, onCheckout }) {
  if (!packingPlan) return null;

  const { packedStack, summary, alerts } = packingPlan;

  // Reverse so TOP items appear at top of display
  const displayStack = [...packedStack].reverse();

  return (
    <section className="bag-visualizer glass-card" id="bag-visualizer">
      <div className="viz-header">
        <h3 className="viz-title">🛍️ Your Delivery Bag</h3>
        <p className="viz-subtitle">Optimized stacking order</p>
      </div>

      <div className="road-selector">
        <label className="road-label">Road Condition:</label>
        <div className="road-options">
          {['smooth', 'normal', 'bumpy'].map(cond => (
            <button
              key={cond}
              className={`road-btn ${roadCondition === cond ? 'active' : ''}`}
              onClick={() => onRoadChange(cond)}
              id={`road-${cond}`}
            >
              {cond === 'smooth' ? '🛣️' : cond === 'normal' ? '🛤️' : '🏔️'}
              {' '}{cond.charAt(0).toUpperCase() + cond.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="viz-stats">
        <div className="stat">
          <span className="stat-value">{summary.totalItems}</span>
          <span className="stat-label">Items</span>
        </div>
        <div className="stat">
          <span className="stat-value">{summary.totalWeight}kg</span>
          <span className="stat-label">Weight</span>
        </div>
        <div className="stat safe">
          <span className="stat-value">{summary.safe}</span>
          <span className="stat-label">Safe</span>
        </div>
        {summary.warnings > 0 && (
          <div className="stat warning">
            <span className="stat-value">{summary.warnings}</span>
            <span className="stat-label">Warning</span>
          </div>
        )}
        {summary.critical > 0 && (
          <div className="stat critical">
            <span className="stat-value">{summary.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="viz-alerts">
          {alerts.map((alert, i) => (
            <div key={i} className={`viz-alert ${alert.type}`}>
              <span>{alert.type === 'error' ? '🚨' : '⚠️'}</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bag-stack">
        <div className="bag-label top-label">← TOP (Fragile)</div>
        {displayStack.map((item, index) => (
          <div
            key={item.instanceId || `${item.id}-${index}`}
            className={`stack-item status-${item.status.toLowerCase()}`}
            style={{
              borderColor: STATUS_COLORS[item.status],
              background: STATUS_BG[item.status],
              animationDelay: `${index * 0.08}s`,
            }}
            id={`stack-item-${index}`}
          >
            <div className="stack-item-left">
              {item.image && item.image.startsWith('/') ? (
                <img src={item.image} alt={item.name} className="stack-img" />
              ) : (
                <span className="stack-emoji">{item.image}</span>
              )}
              <div>
                <span className="stack-name">{item.name}</span>
                <span className="stack-meta">{item.weight}kg · {item.layer}</span>
              </div>
            </div>
            <div className="stack-item-right">
              <div className="stack-pressure">
                <span className="pressure-label">Pressure</span>
                <span className="pressure-value">{item.weightAbove}kg</span>
              </div>
              <div className="stack-bruise">
                <span className="bruise-label">Bruise Risk</span>
                <span className={`bruise-value status-text-${item.status.toLowerCase()}`}>
                  {item.bruiseProbability}%
                </span>
              </div>
              <span className={`status-badge ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
        <div className="bag-label bottom-label">← BOTTOM (Sturdy)</div>
      </div>

      <div className="viz-actions" style={{ marginTop: '1.25rem' }}>
        <button
          className="checkout-btn"
          onClick={onCheckout}
          id="viz-checkout-btn"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.8rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          💳 Proceed to Payment
        </button>
      </div>
    </section>
  );
}

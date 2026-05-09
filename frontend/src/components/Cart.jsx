import './Cart.css';

const FRAGILITY_LABELS = ['', '🟢 Rock Solid', '🟢 Sturdy', '🟡 Moderate', '🟠 Delicate', '🔴 Ultra Fragile'];

function ProductImage({ image, name, className }) {
  if (image && image.startsWith('/')) {
    return <img src={image} alt={name} className={className} />;
  }
  return <span className={className}>{image}</span>;
}

export default function Cart({ cart, products, onUpdateQty, onRemove, isOpen, onClose, packingPlan, onPack, packLoading, onCheckout }) {

  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const getProduct = (id) => productMap[id];

  const totalPrice = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const totalWeight = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.weight * item.quantity : 0);
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);



  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose}></div>}
      <aside className={`cart-panel ${isOpen ? 'open' : ''}`} id="cart-panel">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={onClose} id="cart-close-btn">✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p>Your cart is empty</p>
            <p className="empty-hint">Add some groceries to get started</p>
          </div>
        ) : (
          <>
            <div className="cart-sort-note">
              <span>📦</span> Sorted by fragility — sturdy items at bottom, fragile on top
            </div>

            <div className="cart-items">
              {cart.map((item, index) => {
                const product = getProduct(item.id);
                if (!product) return null;
                return (
                  <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                    <span className="cart-item-pos">{index + 1}</span>
                    <ProductImage image={product.image} name={product.name} className="cart-item-thumb" />
                    <div className="cart-item-info">
                      <span className="cart-item-name">{product.name}</span>
                      <span className="cart-item-frag">{FRAGILITY_LABELS[product.fragility]}</span>
                      <span className="cart-item-price">₹{product.price} × {item.quantity}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        id={`qty-minus-${item.id}`}
                      >−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        id={`qty-plus-${item.id}`}
                      >+</button>
                      <button
                        className="remove-btn"
                        onClick={() => onRemove(item.id)}
                        id={`remove-${item.id}`}
                      >🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Total Weight</span>
                <span>{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button
                className="pack-btn"
                onClick={onPack}
                disabled={packLoading}
                id="pack-my-bag-btn"
              >
                {packLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>📦 Pack My Bag</>
                )}
              </button>

              {packingPlan && (
                <button
                  className="checkout-btn"
                  onClick={onCheckout}
                  id="checkout-btn"
                >
                  💳 Proceed to Checkout
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

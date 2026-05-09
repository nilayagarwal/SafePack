import { memo } from 'react';
import './ProductCard.css';

const FRAGILITY_LABELS = ['', 'Rock Solid', 'Sturdy', 'Moderate', 'Delicate', 'Ultra Fragile'];

const getFragilityColor = (level) => {
  if (level <= 2) return '#22c55e';
  if (level <= 3) return '#f59e0b';
  return '#ef4444';
};

const ProductCard = memo(function ProductCard({ product, onAdd, cartQuantity }) {
  const isImageUrl = product.image && product.image.startsWith('/');

  return (
    <div className="product-card" id={`product-${product.id}`}>
      <div className="product-image-area">
        {isImageUrl ? (
          <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <span className="product-emoji-large">{product.image}</span>
        )}
        {product.fragility >= 4 && (
          <span className="fragile-tag">Fragile</span>
        )}
      </div>

      <div className="product-details">
        <div className="product-brand">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-unit-info">{product.unit} · {product.weight}kg</p>
        
        <div className="product-fragility-bar">
          <div className="frag-bar-track">
            <div 
              className="frag-bar-fill"
              style={{ 
                width: `${(product.fragility / 5) * 100}%`,
                background: product.fragility <= 2 ? '#0c831f' : product.fragility <= 3 ? '#f5a623' : '#e23744'
              }}
            />
          </div>
          <span className="frag-label">
            <span
              className="frag-dot"
              style={{
                backgroundColor: getFragilityColor(product.fragility),
                boxShadow: `0 0 8px ${getFragilityColor(product.fragility)}`
              }}
            ></span>
            {FRAGILITY_LABELS[product.fragility]}
          </span>
        </div>
      </div>

      <div className="product-bottom">
        <div className="product-pricing">
          <span className="current-price">₹{product.price}</span>
        </div>

        {cartQuantity > 0 ? (
          <div className="qty-control-inline">
            <button className="qty-dec" onClick={(e) => { e.stopPropagation(); onAdd(product, -1); }}>−</button>
            <span className="qty-num">{cartQuantity}</span>
            <button className="qty-inc" onClick={(e) => { e.stopPropagation(); onAdd(product, 1); }}>+</button>
          </div>
        ) : (
          <button
            className="add-to-cart-btn"
            onClick={() => onAdd(product, 1)}
            id={`add-${product.id}`}
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
});

export default ProductCard;

import { useState } from 'react';
import ProductCard from './ProductCard';
import './ProductCatalog.css';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Beverages', 'Grains', 'Snacks', 'Canned', 'Condiments', 'Household'];

const CAT_ICONS = {
  'All': '🏠',
  'Produce': '🥬',
  'Dairy': '🥛',
  'Bakery': '🍞',
  'Beverages': '🥤',
  'Grains': '🌾',
  'Snacks': '🍿',
  'Canned': '🥫',
  'Condiments': '🫒',
  'Household': '🧹',
};

export default function ProductCatalog({ products, onAddToCart, cart }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartMap = cart.reduce((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {});

  const getCartQty = (productId) => cartMap[productId] || 0;

  return (
    <section className="catalog" id="product-catalog">
      <div className="catalog-search-bar">
        <span className="search-icon-lg">🔍</span>
        <input
          type="text"
          placeholder='Search for "eggs", "milk", "bread"...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-lg"
          id="product-search"
        />
      </div>

      <div className="category-strip">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            id={`cat-${cat.toLowerCase()}`}
          >
            <span className="cat-chip-icon">{CAT_ICONS[cat]}</span>
            <span className="cat-chip-label">{cat}</span>
          </button>
        ))}
      </div>

      <div className="catalog-section">
        <h2 className="section-title">
          {activeCategory === 'All' ? 'All Products' : activeCategory}
          <span className="item-count">{filteredProducts.length} items</span>
        </h2>
        
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAddToCart}
              cartQuantity={getCartQty(product.id)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="no-products">
              <span>🔍</span>
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

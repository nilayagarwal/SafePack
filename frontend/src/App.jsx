import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { usePacker } from './hooks/usePacker';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCatalog from './components/ProductCatalog';
import Cart from './components/Cart';
import BagVisualizer from './components/BagVisualizer';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import './App.css';

function ShopPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [roadCondition, setRoadCondition] = useState('normal');
  const { packingPlan, loading: packLoading, calculateStack, clearPlan } = usePacker();

  // Fetch products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  // Sort cart items by fragility (least fragile first = bottom of bag)
  const sortedCart = useMemo(() => {
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    return [...cart].sort((a, b) => {
      const prodA = productMap[a.id];
      const prodB = productMap[b.id];
      if (!prodA || !prodB) return 0;
      // Sort by fragility ascending (sturdy first), then weight descending
      if (prodA.fragility !== prodB.fragility) return prodA.fragility - prodB.fragility;
      return prodB.weight - prodA.weight;
    });
  }, [cart, products]);

  // Handle add/remove with delta (supports +1 / -1 from ProductCard inline controls)
  const addToCart = useCallback((product, delta = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== product.id);
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      if (delta > 0) {
        return [...prev, { id: product.id, quantity: delta }];
      }
      return prev;
    });
    clearPlan();
  }, [clearPlan]);

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
    clearPlan();
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    clearPlan();
  };

  const handlePack = async () => {
    await calculateStack(cart, roadCondition);
    setCartOpen(false);
  };

  const handleRoadChange = async (condition) => {
    setRoadCondition(condition);
    if (cart.length > 0) {
      await calculateStack(cart, condition);
    }
  };

  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    const totalPrice = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const totalWeight = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.weight * item.quantity : 0);
    }, 0);

    setCartOpen(false);
    navigate('/checkout', {
      state: { cart, packingPlan, totalPrice, totalWeight },
    });
  };

  return (
    <>
      <Header cartCount={totalCartItems} onCartToggle={() => setCartOpen(!cartOpen)} />

      <main className="shop-layout">
        <div className="shop-main">
          <ProductCatalog
            products={products}
            onAddToCart={addToCart}
            cart={cart}
          />
        </div>

        {packingPlan && (
          <aside className="shop-sidebar">
            <BagVisualizer
              packingPlan={packingPlan}
              roadCondition={roadCondition}
              onRoadChange={handleRoadChange}
              onCheckout={handleCheckout}
            />
          </aside>
        )}
      </main>

      <Cart
        cart={sortedCart}
        products={products}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        packingPlan={packingPlan}
        onPack={handlePack}
        packLoading={packLoading}
        onCheckout={handleCheckout}
      />
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader">
          <span className="loader-icon">📦</span>
          <p>Loading SafePack...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

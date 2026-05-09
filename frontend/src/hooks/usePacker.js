import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePacker() {
  const { token } = useAuth();
  const [packingPlan, setPackingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateStack = useCallback(async (cartItems, roadCondition = 'normal') => {
    if (!cartItems || cartItems.length === 0) {
      setPackingPlan(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const items = cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/calculate-stack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, roadCondition }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPackingPlan(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearPlan = useCallback(() => {
    setPackingPlan(null);
    setError(null);
  }, []);

  return { packingPlan, loading, error, calculateStack, clearPlan };
}

import { useCallback, useState } from 'react';

export function useCart() {
  const [quantities, setQuantities] = useState({});

  const add = useCallback((productId) => {
    setQuantities((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setQuantities((current) => ({ ...current, [productId]: quantity }));
  }, []);

  const remove = useCallback((productId) => {
    setQuantities(({ [productId]: _removed, ...rest }) => rest);
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  return { quantities, add, setQuantity, remove, clear };
}

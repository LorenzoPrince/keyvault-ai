import { useCallback, useEffect, useMemo, useState } from 'react';
import Catalog from './components/Catalog.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { useCart } from './hooks/useCart.js';
import { useChat } from './hooks/useChat.js';
import { fetchProducts } from './lib/api.js';

const TOAST_DURATION_MS = 2400;

function App() {
  const [products, setProducts] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState('loading');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const cart = useCart();
  const chat = useChat();

  const loadProducts = useCallback(
    () =>
      fetchProducts()
        .then((catalog) => {
          setProducts(catalog);
          setCatalogStatus('ready');
        })
        .catch(() => {
          setCatalogStatus((status) => (status === 'ready' ? status : 'error'));
        }),
    [],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const cartItems = useMemo(
    () =>
      products
        .filter(({ id }) => cart.quantities[id] > 0)
        .map((product) => ({ product, quantity: cart.quantities[product.id] })),
    [products, cart.quantities],
  );

  const cartCount = cartItems.reduce((sum, { quantity }) => sum + quantity, 0);
  const cartTotal =
    cartItems.reduce(
      (sum, { product, quantity }) => sum + Math.round(product.price * 100) * quantity,
      0,
    ) / 100;

  const handleAddToCart = (product) => {
    if ((cart.quantities[product.id] ?? 0) >= product.stockKeys) {
      setToast({ text: `No quedan más keys de ${product.name}` });
      return;
    }
    cart.add(product.id);
    setToast({ text: `${product.name} agregado al carrito` });
  };

  const handleAskAssistant = (product) => {
    setIsChatOpen(true);
    chat.send(`Contame de ${product.name}: ¿qué requisitos tiene y dónde se activa?`);
  };

  const retryCatalog = () => {
    setCatalogStatus('loading');
    loadProducts();
  };

  const handleOrderCompleted = () => {
    cart.clear();
    loadProducts();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Hero products={products} onOpenChat={() => setIsChatOpen(true)} />
        <Catalog
          products={products}
          status={catalogStatus}
          onRetry={retryCatalog}
          quantities={cart.quantities}
          onAdd={handleAddToCart}
          onAsk={handleAskAssistant}
        />
      </main>

      <footer className="border-t border-ink-700/70 px-4 py-6 pr-20 text-center text-xs text-ink-400 sm:pr-4">
        KeyVault AI · Proyecto de demostración con pagos y claves simuladas.
      </footer>

      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          total={cartTotal}
          onClose={() => setIsCartOpen(false)}
          onSetQuantity={cart.setQuantity}
          onRemove={cart.remove}
          onOrderCompleted={handleOrderCompleted}
          onOrderRejected={loadProducts}
        />
      )}

      <ChatWidget
        chat={chat}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((open) => !open)}
        products={products}
        onAddToCart={handleAddToCart}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
        {toast && (
          <p className="animate-fade-up rounded-lg border border-success/40 bg-ink-800 px-4 py-2 text-sm font-medium shadow-lg shadow-black/40">
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;

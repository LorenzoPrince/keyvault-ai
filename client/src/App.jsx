import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminDashboard from './components/AdminDashboard.jsx';
import Catalog from './components/Catalog.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import CompatibilityBanner from './components/CompatibilityBanner.jsx';
import CompatibilityModal from './components/CompatibilityModal.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import WhatsAppRescueModal from './components/WhatsAppRescueModal.jsx';
import { useCart } from './hooks/useCart.js';
import { useChat } from './hooks/useChat.js';
import { STORE_PATH, useRoute } from './hooks/useRoute.js';
import { fetchProducts } from './lib/api.js';

const TOAST_DURATION_MS = 2400;
const EMPTY_HARDWARE = { cpuId: '', gpuId: '', ramGb: '' };

function App() {
  const { view, navigate } = useRoute();
  const [compatibilityCheck, setCompatibilityCheck] = useState(null);
  const [hardware, setHardware] = useState(EMPTY_HARDWARE);
  const [isRescueOpen, setIsRescueOpen] = useState(false);
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
  }, [loadProducts, view]);

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

  const handleHeroQuery = (text) => {
    setIsChatOpen(true);
    chat.send(text);
  };

  const handleAddFromCompatibility = (product) => {
    setCompatibilityCheck(null);
    handleAddToCart(product);
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
      <Header
        view={view}
        onNavigate={navigate}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main key={view} className="flex-1 animate-fade-up">
        {view === 'admin' ? (
          <AdminDashboard onGoToStore={() => navigate(STORE_PATH)} />
        ) : (
          <>
            <Hero
              products={products}
              onAsk={handleHeroQuery}
              onOpenRescue={() => setIsRescueOpen(true)}
            />
            <CompatibilityBanner onOpen={() => setCompatibilityCheck({ productId: null })} />
            <Catalog
              products={products}
              status={catalogStatus}
              onRetry={retryCatalog}
              quantities={cart.quantities}
              onAdd={handleAddToCart}
              onAsk={handleAskAssistant}
              onCheck={(product) => setCompatibilityCheck({ productId: product.id })}
            />
          </>
        )}
      </main>

      <footer className="border-t border-ink-700/70 px-4 py-6 pr-20 text-center text-xs text-ink-400 sm:pr-4">
        KeyVault - Tu tienda gamer local · Proyecto de demostración con pagos y claves simuladas.
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

      {compatibilityCheck && (
        <CompatibilityModal
          initialProductId={compatibilityCheck.productId}
          products={products}
          selection={hardware}
          onSelectionChange={setHardware}
          onClose={() => setCompatibilityCheck(null)}
          onAddToCart={handleAddFromCompatibility}
        />
      )}

      {isRescueOpen && (
        <WhatsAppRescueModal
          onClose={() => setIsRescueOpen(false)}
          onOrderCompleted={loadProducts}
        />
      )}

      {view === 'store' && (
        <ChatWidget
          chat={chat}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((open) => !open)}
          products={products}
          onAddToCart={handleAddToCart}
          onOrderCompleted={loadProducts}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-28 z-50 flex justify-center px-4">
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

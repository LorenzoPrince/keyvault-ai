import { useRef, useState } from 'react';
import { sendChatMessage } from '../lib/api.js';

const WELCOME_MESSAGE = {
  id: 0,
  role: 'assistant',
  content:
    '¡Buenas, gamer! 🎮 Soy el asesor de KeyVault, tu tienda gamer local. Contame qué PC tenés o qué te gusta jugar y te digo qué llevarte.',
};

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(1);

  const append = (message) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { ...message, id }]);
  };

  const send = async (text) => {
    const message = text.trim();
    if (!message || isLoading) return;

    const history = messages
      .filter(({ id, isError }) => id !== WELCOME_MESSAGE.id && !isError)
      .map(({ role, content }) => ({ role, content }));

    append({ role: 'user', content: message });
    setIsLoading(true);
    try {
      const { reply, source, suggestedProducts, compatibility, action, item } =
        await sendChatMessage({ message, history });
      append({
        role: 'assistant',
        content: reply,
        source,
        suggestedProducts,
        compatibility,
        action,
        item,
      });
    } catch (error) {
      append({ role: 'assistant', content: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Guarda el pedido en el mensaje: la key sigue visible aunque se cierre el chat.
  const attachOrder = (messageId, order) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, order } : message)),
    );
  };

  return { messages, isLoading, send, attachOrder };
}

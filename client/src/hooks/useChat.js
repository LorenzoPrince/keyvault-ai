import { useRef, useState } from 'react';
import { sendChatMessage } from '../lib/api.js';

const WELCOME_MESSAGE = {
  id: 0,
  role: 'assistant',
  content:
    '¡Buenas, gamer! 🎮 Soy el asesor de KeyVault AI. Contame qué PC tenés o qué te gusta jugar y te digo qué llevarte.',
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
      const { reply, source, suggestedProducts } = await sendChatMessage({ message, history });
      append({ role: 'assistant', content: reply, source, suggestedProducts });
    } catch (error) {
      append({ role: 'assistant', content: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, send };
}

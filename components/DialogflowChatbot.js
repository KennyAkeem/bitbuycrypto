// components/DialogflowChatbot.js
import Script from 'next/script';
import { useEffect, useRef } from 'react';

export default function DialogflowChatbot() {
  const ref = useRef(null);

  useEffect(() => {
    // Ensure the element is only rendered on the client
    if (typeof window !== 'undefined' && ref.current && !document.querySelector('df-messenger')) {
      const dfMessenger = document.createElement('df-messenger');
      dfMessenger.setAttribute('intent', 'WELCOME');
      dfMessenger.setAttribute('chat-title', 'Bitbuy-care');
      dfMessenger.setAttribute('agent-id', '0b09a831-db35-4940-95c4-b7e3bd6bb319');
      dfMessenger.setAttribute('language-code', 'en');
      dfMessenger.setAttribute('chat-icon', '/images/bot.jpeg'); // Make sure this image exists in /public/images!
      ref.current.appendChild(dfMessenger);
    }
  }, []);

  return (
    <>
      <Script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1" strategy="afterInteractive" />
      <div ref={ref}></div>
    </>
  );
}
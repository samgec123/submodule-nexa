import {getMetadata} from "../commons/scripts/aem.js";

// Create a function to load a script and return a promise
const loadScript = (src, type = 'text/javascript') => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = type;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

// Create a function to load a stylesheet
const loadStylesheet = (href) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  });
};

// Function to initialize all chat resources
const initializeChatBot = async () => {
  try {
    // Load all required scripts in sequence
    await loadScript('https://cdn.botframework.com/botframework-webchat/latest/webchat.js', 'module');
    await loadScript('/scripts/microsoft.cognitiveservices.speech.sdk.bundle-min.js', 'module');
    await loadScript('/scripts/chatbot-nexa.js', 'module');

    // Load stylesheet
    await loadStylesheet('/styles/chatbot.css');

    // Wait a brief moment to ensure scripts are fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initialize the chat app
    if (window.chatApp && typeof window.chatApp.initializeWebChat === 'function') {
      await window.chatApp.initializeWebChat();
    } else {
      console.error('ChatApp not properly initialized');
    }
  } catch (error) {
    console.error('Failed to initialize chat bot:', error);
  }
};

let isIntialized = false;
const initScript = async () => {
  document.addEventListener('scroll', () => {
    if(!isIntialized) {
      isIntialized = true;
      initializeChatBot();
    }
  });

  setTimeout(() => {
    if(!isIntialized) {
      isIntialized = true;
      initializeChatBot();
    }
  }, 10000);
}

const isChatbotRequired = getMetadata("ischatbotrequired");
if (isChatbotRequired === 'true') {
    if (window.DELAYED_PHASE) {
      initScript();
    } else {
      document.addEventListener('delayed-phase', initScript);
    }
}
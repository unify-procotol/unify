(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    // Default URPC Studio URL - can be overridden via data-src attribute
    defaultStudioUrl: 'https://studio.uni-labs.org',
    // Chat endpoint path
    chatPath: '/embed-chat',
    // Button and iframe styling
    buttonSize: 60,
    iframeWidth: 400,
    iframeHeight: 600,
    zIndex: 9999,
  };

  // Global state
  let isInitialized = false;
  let isOpen = false;
  let chatButton = null;
  let chatIframe = null;
  let chatContainer = null;
  let studioUrl = CONFIG.defaultStudioUrl;

  // Get studio URL from script tag or use default
  function getStudioUrl() {
    const script = document.querySelector('script[src*="embed-chat.js"]');
    if (script) {
      const dataSrc = script.getAttribute('data-src');
      if (dataSrc) {
        return dataSrc.replace(/\/$/, ''); // Remove trailing slash
      }
    }
    return CONFIG.defaultStudioUrl;
  }

  // Create chat button styles
  function createButtonStyles() {
    const styles = `
      .urpc-chat-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: ${CONFIG.buttonSize}px;
        height: ${CONFIG.buttonSize}px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: ${CONFIG.zIndex};
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        outline: none;
      }
      
      .urpc-chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
      
      .urpc-chat-button:active {
        transform: scale(0.95);
      }
      
      .urpc-chat-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: ${CONFIG.iframeWidth}px;
        height: ${CONFIG.iframeHeight}px;
        z-index: ${CONFIG.zIndex - 1};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transform: translateY(20px) scale(0.95);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
      }
      
      .urpc-chat-container.open {
        transform: translateY(0) scale(1);
        opacity: 1;
        visibility: visible;
      }
      
      .urpc-chat-iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }
      
      .urpc-chat-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: ${CONFIG.zIndex - 2};
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .urpc-chat-backdrop.open {
        opacity: 1;
        visibility: visible;
      }
      
      /* Mobile responsive adjustments */
      @media (max-width: 480px) {
        .urpc-chat-container {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 90px;
          right: 20px;
          left: 20px;
        }
      }
      
      /* Animation keyframes */
      @keyframes urpc-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .urpc-chat-button.has-notification {
        animation: urpc-pulse 2s infinite;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Create chat button
  function createChatButton() {
    chatButton = document.createElement('button');
    chatButton.className = 'urpc-chat-button';
    chatButton.innerHTML = '💬';
    chatButton.title = 'Open AI Assistant Chat';
    
    chatButton.addEventListener('click', toggleChat);
    
    document.body.appendChild(chatButton);
  }

  // Create chat container and iframe
  function createChatContainer() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'urpc-chat-backdrop';
    backdrop.addEventListener('click', closeChat);
    document.body.appendChild(backdrop);
    
    // Create container
    chatContainer = document.createElement('div');
    chatContainer.className = 'urpc-chat-container';
    
    // Create iframe
    chatIframe = document.createElement('iframe');
    chatIframe.className = 'urpc-chat-iframe';
    chatIframe.src = studioUrl + CONFIG.chatPath + '?embedded=true';
    chatIframe.title = 'AI Assistant Chat';
    
    // Add loading placeholder
    chatIframe.addEventListener('load', function() {
      console.log('Chat iframe loaded successfully');
    });
    
    chatIframe.addEventListener('error', function() {
      console.error('Failed to load chat iframe');
      chatContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>Chat service temporarily unavailable</p>
          <p style="font-size: 12px;">Please try again later</p>
        </div>
      `;
    });
    
    chatContainer.appendChild(chatIframe);
    document.body.appendChild(chatContainer);
  }

  // Toggle chat visibility
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  // Open chat
  function openChat() {
    if (!chatContainer) {
      createChatContainer();
    }
    
    isOpen = true;
    chatContainer.classList.add('open');
    document.querySelector('.urpc-chat-backdrop').classList.add('open');
    chatButton.innerHTML = '✕';
    chatButton.title = 'Close Chat';
    
    // Focus iframe for better UX
    setTimeout(() => {
      if (chatIframe) {
        chatIframe.focus();
      }
    }, 300);
  }

  // Close chat
  function closeChat() {
    if (!isOpen) return;
    
    isOpen = false;
    chatContainer.classList.remove('open');
    document.querySelector('.urpc-chat-backdrop').classList.remove('open');
    chatButton.innerHTML = '💬';
    chatButton.title = 'Open AI Assistant Chat';
  }

  // Handle escape key
  function handleKeyDown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeChat();
    }
  }

  // Initialize the chat widget
  function init() {
    if (isInitialized) return;
    
    // Get studio URL from script tag
    studioUrl = getStudioUrl();
    
    console.log('Initializing URPC Chat Widget with studio URL:', studioUrl);
    
    // Create styles and button
    createButtonStyles();
    createChatButton();
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Handle window resize for mobile
    window.addEventListener('resize', function() {
      if (isOpen && window.innerWidth <= 480) {
        // Adjust mobile layout if needed
      }
    });
    
    isInitialized = true;
    console.log('URPC Chat Widget initialized successfully');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

  // Expose global API for manual control
  window.URPCChat = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    isOpen: function() { return isOpen; },
    setStudioUrl: function(url) {
      studioUrl = url.replace(/\/$/, '');
      if (chatIframe) {
        chatIframe.src = studioUrl + CONFIG.chatPath + '?embedded=true';
      }
    }
  };

})(); 
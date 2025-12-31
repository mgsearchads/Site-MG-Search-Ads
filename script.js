// ============================================
// MG Search Ads - Script principal
// ============================================

// Initialisation unique au chargement du DOM
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  // Année dynamique (safe check)
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Initialisation des modules
  initCalendlyModal();
  setupCtaListeners();
  // initChatbot(); // DÉSACTIVÉ
}

// ============================================
// Tracking CTA
// ============================================
function trackCta(ctaName) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "cta_click", {
      cta_name: ctaName,
      page: "mg-search-ads_onepage"
    });
  }
}

// ============================================
// Modal Calendly
// ============================================
let calendlyModal, calendlyCloseBtn, calendlyOverlay;

function initCalendlyModal() {
  calendlyModal = document.getElementById("calendly-modal");
  calendlyCloseBtn = document.querySelector(".calendly-modal-close");
  calendlyOverlay = document.querySelector(".calendly-modal-overlay");
  
  if (!calendlyModal) return;
  
  if (calendlyCloseBtn) {
    calendlyCloseBtn.addEventListener("click", closeCalendlyModal);
  }

  if (calendlyOverlay) {
    calendlyOverlay.addEventListener("click", closeCalendlyModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && calendlyModal && calendlyModal.classList.contains("active")) {
      closeCalendlyModal();
    }
  });
}

function openCalendlyModal() {
  if (calendlyModal) {
    calendlyModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCalendlyModal() {
  if (calendlyModal) {
    calendlyModal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ============================================
// CTA Listeners
// ============================================
function setupCtaListeners() {
  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const name = el.getAttribute("data-cta") || "unknown";
      trackCta(name);
      
      // Laisser les mailto fonctionner
      if (el.tagName === "A" && el.href && el.href.startsWith("mailto:")) {
        return;
      }
      
      // Ouvrir Calendly pour les autres CTA
      if (name !== "email" && name !== "email-hero" && name !== "website-email") {
        e.preventDefault();
        openCalendlyModal();
      }
    });
  });
}

// ============================================
// Chatbot
// ============================================
let requestCount = 0;
const MAX_REQUESTS = 3;

// URL absolue pour le backend (fonctionne depuis Live Server 5500 ou localhost 3000)
const CHAT_API_URL = "http://localhost:3000/api/chat";

function initChatbot() {
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotLimitMessage = document.getElementById("chatbot-limit-message");

  if (!chatbotContainer || !chatbotToggle) {
    console.warn("[Chatbot] Éléments non trouvés, chatbot désactivé");
    return;
  }

  // Appel API backend
  async function getChatbotResponse(userMessage) {
    try {
      console.log("[Chatbot] Envoi requête...");
      
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage })
      });

      // Log pour debug
      console.log("[Chatbot] Status:", response.status);

      // Lire le body une seule fois
      const data = await response.json();
      console.log("[Chatbot] Réponse:", data);

      if (!response.ok) {
        console.error("[Chatbot] Erreur API:", response.status, data);
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      // Parser réponse (renvoie { text, mock, topic, confidence, references })
      if (data.text) {
        if (data.mock) {
          console.log("[Chatbot] Réponse MOCK | Topic:", data.topic, "| Confidence:", data.confidence?.toFixed(2));
        }
        return {
          text: data.text,
          references: data.references || [],
          topic: data.topic,
          mock: data.mock
        };
      } else if (data.response) {
        return { text: data.response, references: [], topic: 'unknown', mock: false };
      } else {
        console.error("[Chatbot] Format inattendu:", data);
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("[Chatbot] Erreur:", error.message);
      return {
        text: "Désolé, je rencontre un problème technique. Pour des réponses détaillées, réservez un appel avec MG Search Ads.",
        references: [],
        topic: 'error',
        mock: true
      };
    }
  }

  function formatMessage(text) {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n•/g, '</p><p>•')
      .replace(/\n-/g, '</p><p>-')
      .replace(/\n(\d+\.)/g, '</p><p>$1')
      .replace(/❓/g, '<span class="question-icon">❓</span>');
  }

  function addMessage(content, isUser = false) {
    if (!chatbotMessages) return;
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${isUser ? "user" : "bot"}`;
    
    if (typeof content === 'string') {
      // Simple text message (user)
      const p = document.createElement("p");
      p.textContent = content;
      messageDiv.appendChild(p);
    } else {
      // Rich message with potential references (bot)
      const textDiv = document.createElement("div");
      textDiv.className = "message-text";
      textDiv.innerHTML = `<p>${formatMessage(content.text)}</p>`;
      messageDiv.appendChild(textDiv);
      
      // Add references if any
      if (content.references && content.references.length > 0) {
        const refsDiv = document.createElement("div");
        refsDiv.className = "message-refs";
        refsDiv.innerHTML = `<span class="refs-label">📚 Sources :</span> ${
          content.references.map(r => `<a href="${r.url}" target="_blank" rel="noopener">${r.title}</a>`).join(' • ')
        }`;
        messageDiv.appendChild(refsDiv);
      }
    }
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  async function handleChatbotSend() {
    if (!chatbotInput || !chatbotSend || !chatbotMessages) return;
    
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatbotInput.value = "";
    requestCount++;

    if (requestCount >= MAX_REQUESTS) {
      if (chatbotLimitMessage) chatbotLimitMessage.style.display = "block";
      chatbotInput.disabled = true;
      chatbotSend.disabled = true;
      addMessage("Pour approfondir votre situation et obtenir des conseils personnalisés, je vous recommande de réserver un appel avec MG Search Ads.");
      return;
    }

    // Message de chargement
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "chatbot-message bot";
    loadingMessage.innerHTML = "<p>Réflexion en cours...</p>";
    chatbotMessages.appendChild(loadingMessage);

    try {
      const response = await getChatbotResponse(message);
      if (chatbotMessages.contains(loadingMessage)) {
        chatbotMessages.removeChild(loadingMessage);
      }
      // Pass the full response object for rich rendering
      addMessage(response, false);
    } catch (error) {
      if (chatbotMessages.contains(loadingMessage)) {
        chatbotMessages.removeChild(loadingMessage);
      }
      addMessage({ text: "Désolé, une erreur s'est produite. Réservez un appel avec MG Search Ads.", references: [] }, false);
    }
  }

  // Toggle chatbot
  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.toggle("active");
    chatbotToggle.style.display = chatbotContainer.classList.contains("active") ? "none" : "flex";
  });

  // Assistant widget in hero opens chatbot
  const assistantWidget = document.querySelector(".assistant-widget");
  const assistantInput = document.querySelector(".assistant-input");
  const assistantClose = document.querySelector(".assistant-close");
  
  function openChatbotFromWidget() {
    chatbotContainer.classList.add("active");
    chatbotToggle.style.display = "none";
    if (chatbotInput) chatbotInput.focus();
  }

  if (assistantWidget) {
    assistantWidget.addEventListener("click", (e) => {
      // Don't trigger if clicking close button
      if (e.target.classList.contains("assistant-close")) return;
      openChatbotFromWidget();
    });
  }
  if (assistantInput) {
    assistantInput.addEventListener("click", openChatbotFromWidget);
  }
  if (assistantClose) {
    assistantClose.addEventListener("click", (e) => {
      e.stopPropagation();
      assistantWidget.style.display = "none";
    });
  }

  // Fermer
  if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
      chatbotContainer.classList.remove("active");
      chatbotToggle.style.display = "flex";
    });
  }

  // Bouton Envoyer
  if (chatbotSend) {
    chatbotSend.addEventListener("click", handleChatbotSend);
  }

  // Enter pour envoyer (avec preventDefault)
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleChatbotSend();
      }
    });
  }

  // CTA dans le message de limite
  document.addEventListener("click", (e) => {
    if (e.target && e.target.getAttribute("data-cta") === "chatbot-cta") {
      openCalendlyModal();
      chatbotContainer.classList.remove("active");
      chatbotToggle.style.display = "flex";
    }
  });

  console.log("[Chatbot] Initialisé ✅");
}

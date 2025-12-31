require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { buildMockAnswer, detectTopic } = require('./kb.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODE_MOCK = process.env.MODE_MOCK === 'true';

if (MODE_MOCK) {
  console.log('🎭 MODE MOCK activé - Assistant Google Ads intelligent');
} else if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY non définie - fallback mock automatique');
}

// Middleware CORS
const corsOptions = {
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};
app.use(cors(corsOptions));
app.options('/api/*', (req, res) => res.sendStatus(204));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Session storage (simple en mémoire)
const sessions = new Map();

// Système prompt pour OpenAI
const SYSTEM_PROMPT = `Tu es un expert Google Ads et GA4 chez MG Search Ads. 
Tu réponds de manière détaillée et professionnelle aux questions sur Google Ads, GA4, le tracking, les campagnes, l'optimisation, etc. 
Tu réponds toujours en français. Tu es amical mais professionnel.`;

// ============================================
// Endpoint /api/chat
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      console.warn('[API] Message invalide reçu:', req.body);
      return res.status(400).json({ error: 'Message requis (string)' });
    }

    // Récupérer ou créer la session
    const sid = sessionId || 'default';
    let session = sessions.get(sid) || {};

    console.log('[API] ─────────────────────────────────────');
    console.log('[API] Message:', message.substring(0, 60) + (message.length > 60 ? '...' : ''));
    console.log('[API] Session:', JSON.stringify(session));

    // Détecter le topic
    const detection = detectTopic(message);
    console.log('[API] Topic détecté:', detection.topic, '| Confidence:', detection.confidence.toFixed(2), '| Match:', detection.matched);

    // MODE MOCK forcé ou clé API manquante
    if (MODE_MOCK || !OPENAI_API_KEY) {
      const mockResult = buildMockAnswer(message, session);
      
      // Sauvegarder la session mise à jour
      sessions.set(sid, mockResult.session);
      
      console.log('[API] → Réponse MOCK (topic:', mockResult.topic, ')');
      
      return res.json({ 
        text: mockResult.text, 
        mock: true,
        topic: mockResult.topic,
        confidence: mockResult.confidence,
        references: mockResult.references
      });
    }

    // Appel à l'API OpenAI
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          input: `${SYSTEM_PROMPT}\n\nContexte session: ${JSON.stringify(session)}\n\nQuestion utilisateur: ${message}`
        })
      });

      const data = await openaiResponse.json();
      console.log('[API] Status OpenAI:', openaiResponse.status);

      // Erreur OpenAI → fallback mock
      if (!openaiResponse.ok) {
        const errorCode = data.error?.code || 'unknown';
        const errorMsg = data.error?.message || 'Erreur inconnue';
        console.error(`[API] Erreur OpenAI (${openaiResponse.status}):`, errorCode, errorMsg);
        
        const mockResult = buildMockAnswer(message, session);
        sessions.set(sid, mockResult.session);
        
        console.log('[API] → Fallback MOCK activé');
        
        return res.json({ 
          text: mockResult.text, 
          mock: true,
          topic: mockResult.topic,
          confidence: mockResult.confidence,
          references: mockResult.references
        });
      }

      // Parse réponse API
      let responseText = null;
      if (data.output_text) {
        responseText = data.output_text;
      } else if (data.output && Array.isArray(data.output)) {
        const textContent = data.output.find(item => item.type === 'message')?.content?.[0]?.text;
        if (textContent) responseText = textContent;
      }

      if (responseText) {
        console.log('[API] → Réponse OpenAI OK');
        return res.json({ 
          text: responseText, 
          mock: false,
          topic: detection.topic,
          confidence: detection.confidence,
          references: []
        });
      }

      // Format inattendu → fallback mock
      console.error('[API] Format inattendu, fallback MOCK');
      const mockResult = buildMockAnswer(message, session);
      sessions.set(sid, mockResult.session);
      
      return res.json({ 
        text: mockResult.text, 
        mock: true,
        topic: mockResult.topic,
        confidence: mockResult.confidence,
        references: mockResult.references
      });

    } catch (fetchError) {
      console.error('[API] Erreur réseau OpenAI:', fetchError.message);
      const mockResult = buildMockAnswer(message, session);
      sessions.set(sid, mockResult.session);
      
      return res.json({ 
        text: mockResult.text, 
        mock: true,
        topic: mockResult.topic,
        confidence: mockResult.confidence,
        references: mockResult.references
      });
    }

  } catch (error) {
    console.error('[API] Erreur serveur:', error.message);
    const mockResult = buildMockAnswer(req.body?.message || '', {});
    
    return res.json({ 
      text: mockResult.text, 
      mock: true,
      topic: mockResult.topic,
      confidence: mockResult.confidence,
      references: mockResult.references
    });
  }
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestion 404 pour les routes API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   API chatbot: POST http://localhost:${PORT}/api/chat`);
  if (MODE_MOCK) {
    console.log(`   🎭 Mode MOCK: Assistant Google Ads intelligent activé`);
  }
  console.log(`   📚 Knowledge base: ${require('./kb.js').knowledgeBase.length} cartes chargées`);
});

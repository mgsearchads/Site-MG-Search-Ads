# MG Search Ads - Site Web

Site vitrine avec chatbot IA intégré (OpenAI GPT-4o).

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env
echo "OPENAI_API_KEY=sk-..." > .env

# Lancer le serveur
npm start
```

Accéder au site : http://localhost:3000

## ⚠️ Sécurité - IMPORTANT

**Ne jamais exposer la clé API OpenAI dans le frontend (JS/HTML).**

- La clé doit être stockée dans le fichier `.env` (non versionné)
- Le frontend appelle `/api/chat` qui est géré côté serveur
- Le fichier `.env` est ignoré par git (voir `.gitignore`)

## 📁 Structure

```
├── index.html        # Page principale
├── style.css         # Styles
├── script.js         # Frontend (chatbot, modals, CTA)
├── server.js         # Backend Node.js (API /api/chat)
├── package.json      # Dépendances
├── .env              # Clé API (à créer, non versionné)
└── .gitignore        # Fichiers ignorés
```

## 🔧 Configuration

### Variables d'environnement (.env)

```env
OPENAI_API_KEY=sk-proj-...
PORT=3000
MODE_MOCK=false
```

### Mode MOCK (démo sans API)

Si vous n'avez pas de clé OpenAI valide ou si le quota est épuisé, le chatbot utilise automatiquement des **réponses simulées intelligentes**.

**Activer le mode MOCK manuellement :**
```env
MODE_MOCK=true
```

Le mode MOCK est activé automatiquement si :
- `insufficient_quota` (quota épuisé)
- Erreurs 401, 403, 429 (auth/rate-limit)
- Erreur réseau
- Clé API manquante

## ✅ Checklist de test

1. **Chatbot fonctionne** : Cliquer "Envoyer" → requête `/api/chat` → 200 → message bot affiché
2. **Mode MOCK** : Si `mock: true` dans la réponse, c'est une réponse simulée
3. **Calendly modal** : Tous les CTA (sauf mailto) ouvrent le modal
4. **Limite 3 requêtes** : Après 3 questions, invitation à réserver un appel

## 🧪 Test manuel API (PowerShell)

```powershell
# Test basique
Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method POST -ContentType "application/json" -Body '{"message":"Comment optimiser mes campagnes Google Ads?"}'

# Test avec formatage JSON
$body = @{ message = "Qu'est-ce que GA4 ?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json
```

**Réponse attendue (mode MOCK) :**
```json
{
  "text": "📊 **Checklist Tracking GA4** (MG Search Ads)...",
  "mock": true
}
```

**Réponse attendue (OpenAI OK) :**
```json
{
  "text": "Réponse générée par GPT-4o...",
  "mock": false
}
```

## 🐛 Debug

Ouvrir la console navigateur (F12) pour voir les logs `[Chatbot]`.
Côté serveur, les logs `[API]` montrent les requêtes et erreurs.

**Logs serveur :**
- `[API] Mode MOCK - réponse simulée` : réponse mock utilisée
- `[API] Réponse OpenAI OK` : réponse réelle de GPT-4o
- `[API] Fallback MOCK activé` : erreur OpenAI, fallback automatique

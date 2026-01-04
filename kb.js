// ============================================
// Knowledge Base - MG Search Ads Assistant
// Basé sur Google Ads Help Center
// ============================================

const knowledgeBase = [
  // ===================== TRACKING / CONVERSIONS / GA4 =====================
  {
    id: 'tracking-setup',
    topic: 'tracking',
    triggers: [/track/i, /conversion/i, /ga4/i, /gtm/i, /tag\s*manager/i, /pixel/i, /mesur/i],
    answer: (ctx) => {
      const base = `**Diagnostic tracking** : La majorité des comptes sous-performent à cause d'un tracking incomplet.

**Ce que je ferais** :
• Vérifier le lien GA4 ↔ Google Ads (Paramètres > Comptes associés)
• Importer les conversions GA4 dans Google Ads (pas juste les créer)
• Tester avec le mode debug GA4 + Tag Assistant

**Check rapide** : Dans Google Ads > Outils > Conversions, voyez-vous vos événements avec statut "Enregistrement" ?`;
      
      if (ctx.session?.trackingStatus === 'ok') {
        return base + `\n\n💡 Votre tracking semble OK. Travaillons sur l'optimisation des enchères.`;
      }
      return base;
    },
    followUp: () => ({ question: "Votre tracking GA4 est-il déjà en place ?", storeKey: "trackingStatus" }),
    references: [
      { title: "Configurer le suivi des conversions", url: "https://support.google.com/google-ads/answer/1722054" },
      { title: "Associer GA4 et Google Ads", url: "https://support.google.com/analytics/answer/9379420" }
    ]
  },
  {
    id: 'conversion-value',
    topic: 'tracking',
    triggers: [/valeur/i, /roas/i, /revenue/i, /chiffre/i, /panier/i],
    answer: (ctx) => {
      const isEcom = ctx.session?.platform === 'ecom';
      return `**Diagnostic valeurs de conversion** : ${isEcom ? 'En e-commerce, le ROAS dépend de la transmission des valeurs dynamiques.' : 'Pour la lead gen, attribuez des valeurs moyennes à chaque type de lead.'}

**Ce que je ferais** :
• ${isEcom ? 'Vérifier que le dataLayer envoie transaction_id et value' : 'Définir une valeur par conversion (ex: lead qualifié = 50€)'}
• Activer l'attribution data-driven dans GA4
• Importer ces valeurs dans Google Ads pour le smart bidding

**Check rapide** : Dans GA4 > Rapports > Monétisation, les revenus s'affichent-ils ?`;
    },
    followUp: () => ({ question: "Êtes-vous en e-commerce ou génération de leads ?", storeKey: "platform" }),
    references: [
      { title: "Valeurs de conversion", url: "https://support.google.com/google-ads/answer/6268637" }
    ]
  },
  {
    id: 'gtm-setup',
    topic: 'tracking',
    triggers: [/gtm/i, /tag\s*manager/i, /container/i, /balise/i, /declencheur/i],
    answer: () => `**Diagnostic GTM** : GTM est l'outil recommandé pour centraliser tous vos tags.

**Ce que je ferais** :
• Vérifier que le container GTM est installé sur toutes les pages (head + body)
• Créer des déclencheurs basés sur des événements GA4 (pas de triggers page view génériques)
• Utiliser le mode Aperçu pour tester avant publication

**Check rapide** : Installez l'extension Tag Assistant et naviguez sur votre site.`,
    followUp: () => ({ question: "Avez-vous déjà un container GTM en place ?", storeKey: "gtmStatus" }),
    references: [
      { title: "Premiers pas avec GTM", url: "https://support.google.com/tagmanager/answer/6103696" }
    ]
  },

  // ===================== QUALITY SCORE =====================
  {
    id: 'quality-score',
    topic: 'quality',
    triggers: [/qualit[ée]/i, /quality\s*score/i, /qs/i, /niveau\s*de\s*qualit/i, /ctr/i, /pertinence/i],
    answer: (ctx) => `**Diagnostic Quality Score** : Un QS < 6 signifie que vous payez trop cher pour chaque clic.

**Ce que je ferais** :
• Vérifier l'alignement mot-clé → annonce → landing page (même intention)
• Améliorer le CTR attendu en testant de nouveaux titres (le mot-clé dans le titre 1)
• Optimiser l'expérience landing page (vitesse, mobile, pertinence du contenu)

**Check rapide** : Ajoutez la colonne "Niveau de qualité" dans l'onglet Mots-clés.

Les 3 composantes : CTR attendu + Pertinence annonce + Exp. page de destination.`,
    followUp: () => ({ question: "Quel est votre Quality Score moyen actuellement ?", storeKey: "qsAverage" }),
    references: [
      { title: "À propos du niveau de qualité", url: "https://support.google.com/google-ads/answer/6167118" },
      { title: "Améliorer le QS", url: "https://support.google.com/google-ads/answer/2454010" }
    ]
  },
  {
    id: 'ctr-improvement',
    topic: 'quality',
    triggers: [/ctr/i, /taux\s*de\s*clic/i, /impressions/i, /clics/i],
    answer: () => `**Diagnostic CTR** : Un CTR Search < 3% indique un problème de pertinence ou de positionnement.

**Ce que je ferais** :
• Inclure le mot-clé exact dans le titre 1 de vos RSA
• Ajouter des chiffres/offres concrètes (ex: "-20%", "Livraison 24h")
• Exclure les requêtes non pertinentes qui diluent le CTR
• Tester les extensions d'appel, de prix, de promotion

**Check rapide** : Comparez le CTR par groupe d'annonces pour identifier les sous-performants.`,
    followUp: () => ({ question: "Quel est votre CTR moyen sur Search actuellement ?", storeKey: "ctrAverage" }),
    references: [
      { title: "CTR et performances", url: "https://support.google.com/google-ads/answer/2615875" }
    ]
  },

  // ===================== MATCH TYPES / MOTS-CLÉS =====================
  {
    id: 'match-types',
    topic: 'keywords',
    triggers: [/correspondance/i, /match\s*type/i, /broad/i, /exact/i, /phrase/i, /large/i, /mot[s]?\s*cl[ée]/i],
    answer: () => `**Diagnostic types de correspondance** : Le choix du match type impacte directement votre volume et votre qualité de trafic.

**Ce que je ferais** :
• **Exact** : pour vos mots-clés à fort volume et ROI prouvé (contrôle max)
• **Phrase** : pour capter les variations proches (bon équilibre)
• **Broad** : uniquement avec Smart Bidding et suffisamment de data conversion
• Ajouter des mots-clés négatifs régulièrement (rapport termes de recherche)

**Check rapide** : Analysez le rapport "Termes de recherche" chaque semaine.`,
    followUp: () => ({ question: "Utilisez-vous principalement Exact, Phrase ou Broad ?", storeKey: "matchType" }),
    references: [
      { title: "Types de correspondance", url: "https://support.google.com/google-ads/answer/7478529" }
    ]
  },
  {
    id: 'negative-keywords',
    topic: 'keywords',
    triggers: [/n[ée]gatif/i, /exclusion/i, /exclure/i, /non\s*pertinent/i, /gaspill/i],
    answer: () => `**Diagnostic mots-clés négatifs** : 20-40% du budget peut être gaspillé sur des requêtes non pertinentes.

**Ce que je ferais** :
• Créer des listes de négatifs partagées au niveau du compte
• Ajouter les requêtes non-intent (gratuit, emploi, avis, définition...)
• Exclure les concurrents si vous ne voulez pas apparaître dessus
• Réviser le rapport termes de recherche 1x/semaine minimum

**Check rapide** : Dans "Termes de recherche", triez par coût et identifiez les fuites.`,
    followUp: () => ({ question: "Avez-vous une liste de mots-clés négatifs en place ?", storeKey: "negativesStatus" }),
    references: [
      { title: "Mots-clés à exclure", url: "https://support.google.com/google-ads/answer/2453972" }
    ]
  },

  // ===================== PERFORMANCE MAX =====================
  {
    id: 'pmax-basics',
    topic: 'pmax',
    triggers: [/pmax/i, /performance\s*max/i, /p\.\s*max/i],
    answer: (ctx) => {
      const hasEcom = ctx.session?.platform === 'ecom';
      return `**Diagnostic Performance Max** : PMax fonctionne mieux avec beaucoup de données et d'assets.

**Ce que je ferais** :
• Fournir 20+ images, 5+ vidéos, 15 titres et 5 descriptions minimum
• Ajouter des signaux d'audience (remarketing, segments similaires, données first-party)
• ${hasEcom ? 'Connecter votre flux Merchant Center avec des produits optimisés' : 'Créer des groupes d\'assets par persona/offre'}
• Attendre 2-4 semaines avant d'évaluer (phase d'apprentissage)

**Check rapide** : L'indicateur "Force de l'annonce" doit être au moins "Bonne".`;
    },
    followUp: () => ({ question: "Avez-vous déjà une campagne PMax active ?", storeKey: "pmaxStatus" }),
    references: [
      { title: "Performance Max", url: "https://support.google.com/google-ads/answer/10724817" },
      { title: "Assets PMax", url: "https://support.google.com/google-ads/answer/11030108" }
    ]
  },
  {
    id: 'pmax-assets',
    topic: 'pmax',
    triggers: [/asset/i, /groupe\s*d'assets/i, /image/i, /vid[ée]o/i, /creative/i],
    answer: () => `**Diagnostic assets PMax** : La qualité et la quantité d'assets déterminent les performances.

**Ce que je ferais** :
• **Images** : 20 minimum (paysage, carré, portrait) avec visuels produit et lifestyle
• **Vidéos** : 5 minimum (YouTube). Sans vidéo, Google en génère une automatique (souvent médiocre)
• **Titres** : 15 variations (courts et longs, avec et sans CTA)
• **Descriptions** : 5 variations couvrant bénéfices, offres, urgence

**Check rapide** : Consultez les rapports d'assets pour voir ce qui performe.`,
    followUp: () => ({ question: "Combien d'assets avez-vous actuellement dans votre PMax ?", storeKey: "assetsCount" }),
    references: [
      { title: "Optimiser les assets", url: "https://support.google.com/google-ads/answer/11030108" }
    ]
  },
  {
    id: 'audience-signals',
    topic: 'pmax',
    triggers: [/audience/i, /signal/i, /remarketing/i, /ciblage/i, /segment/i],
    answer: () => `**Diagnostic signaux d'audience** : Les signaux guident l'algorithme, mais ne limitent pas la diffusion.

**Ce que je ferais** :
• Ajouter vos listes de remarketing (visiteurs site, clients existants)
• Créer des segments personnalisés (recherches, sites visités, apps)
• Importer des données first-party (Customer Match)
• Tester des intérêts/comportements en rapport avec votre cible

**Check rapide** : Dans votre groupe d'assets > Signaux d'audience, combien de signaux sont actifs ?`,
    followUp: () => ({ question: "Avez-vous des listes de remarketing à exploiter ?", storeKey: "remarketingStatus" }),
    references: [
      { title: "Signaux d'audience PMax", url: "https://support.google.com/google-ads/answer/11030597" }
    ]
  },

  // ===================== SMART BIDDING / ENCHÈRES =====================
  {
    id: 'smart-bidding',
    topic: 'bidding',
    triggers: [/ench[èe]re/i, /smart\s*bidding/i, /cpa\s*cible/i, /roas\s*cible/i, /maximiser/i, /strat[ée]gie\s*d'ench/i],
    answer: (ctx) => {
      const isEcom = ctx.session?.platform === 'ecom';
      return `**Diagnostic Smart Bidding** : Les stratégies automatiques nécessitent des données de conversion fiables.

**Ce que je ferais** :
• Vérifier que vous avez 30+ conversions/mois pour CPA/ROAS cible
• ${isEcom ? 'Utiliser ROAS cible si les valeurs de panier varient' : 'Utiliser CPA cible pour la lead gen'}
• Commencer avec "Maximiser les conversions" si data insuffisante
• Attendre 2 semaines après changement de stratégie avant d'évaluer

**Check rapide** : Dans l'historique des modifications, voyez-vous beaucoup de changements d'enchères ?`;
    },
    followUp: () => ({ question: "Quelle stratégie d'enchères utilisez-vous actuellement ?", storeKey: "biddingStrategy" }),
    references: [
      { title: "Stratégies d'enchères intelligentes", url: "https://support.google.com/google-ads/answer/7065882" }
    ]
  },
  {
    id: 'cpa-target',
    topic: 'bidding',
    triggers: [/cpa/i, /co[uû]t\s*par\s*acquisition/i, /co[uû]t\s*par\s*lead/i],
    answer: () => `**Diagnostic CPA** : Le CPA cible doit être réaliste par rapport à votre historique.

**Ce que je ferais** :
• Calculer le CPA moyen des 30 derniers jours comme baseline
• Définir un CPA cible 10-20% au-dessus au début (ne pas être trop agressif)
• S'assurer d'avoir 30+ conversions/mois pour que l'algo optimise bien
• Éviter de modifier le CPA cible trop souvent (1x toutes les 2 semaines max)

**Check rapide** : CPA cible réaliste = CPA historique × 1.1 à 1.2`,
    followUp: () => ({ question: "Quel est votre CPA cible actuel ?", storeKey: "cpaTarget" }),
    references: [
      { title: "CPA cible", url: "https://support.google.com/google-ads/answer/6268632" }
    ]
  },

  // ===================== BUDGET =====================
  {
    id: 'budget-planning',
    topic: 'budget',
    triggers: [/budget/i, /d[ée]pens/i, /investir/i, /combien/i, /€/i, /euro/i, /argent/i],
    answer: (ctx) => {
      let budgetAdvice = '';
      if (ctx.session?.budget) {
        const b = parseInt(ctx.session.budget);
        if (b < 500) budgetAdvice = '\n\n⚠️ Avec moins de 500€/mois, privilégiez Search sur vos meilleurs mots-clés uniquement.';
        else if (b < 2000) budgetAdvice = '\n\n💡 Budget correct pour du Search ciblé. PMax sera limité.';
        else budgetAdvice = '\n\n✅ Budget suffisant pour tester Search + PMax en parallèle.';
      }
      return `**Diagnostic budget** : Le budget optimal dépend de votre CPA cible et volume souhaité.

**Ce que je ferais** :
• Calculer : Budget = Nombre de leads souhaités × CPA cible × 1.3 (marge de test)
• Ne pas éparpiller sur trop de campagnes (focus > dispersion)
• Commencer par Search sur vos mots-clés à plus forte intention
• Allouer 70% Search / 30% PMax au début${budgetAdvice}

**Check rapide** : Vos campagnes sont-elles "Limitées par le budget" ?`;
    },
    followUp: () => ({ question: "Quel est votre budget mensuel Google Ads ?", storeKey: "budget" }),
    references: [
      { title: "Définir votre budget", url: "https://support.google.com/google-ads/answer/6385083" }
    ]
  },
  {
    id: 'budget-limited',
    topic: 'budget',
    triggers: [/limit[ée]\s*par\s*le\s*budget/i, /limited\s*by\s*budget/i, /manque\s*de\s*budget/i],
    answer: () => `**Diagnostic "Limité par le budget"** : Cela signifie que vous ratez des opportunités.

**Ce que je ferais** :
• Prioriser les campagnes/mots-clés avec le meilleur ROI
• Réduire les enchères sur les mots-clés secondaires plutôt qu'augmenter le budget
• Améliorer le Quality Score pour réduire le CPC
• Exclure les requêtes non pertinentes qui consomment du budget

**Check rapide** : Utilisez le simulateur de budget pour estimer l'impact d'une augmentation.`,
    followUp: () => ({ question: "Préférez-vous augmenter le budget ou optimiser les dépenses actuelles ?", storeKey: "budgetPreference" }),
    references: [
      { title: "Campagnes limitées par le budget", url: "https://support.google.com/google-ads/answer/2375420" }
    ]
  },

  // ===================== STRUCTURE COMPTE =====================
  {
    id: 'account-structure',
    topic: 'structure',
    triggers: [/structur/i, /organis/i, /campagne/i, /groupe\s*d'annonce/i, /ad\s*group/i, /compte/i],
    answer: () => `**Diagnostic structure de compte** : Une bonne structure = meilleur contrôle + meilleur Quality Score.

**Ce que je ferais** :
• 1 campagne = 1 thématique/objectif clair
• 1 groupe d'annonces = 1 intention de recherche homogène (5-15 mots-clés max)
• Séparer les campagnes par appareil/géo uniquement si performances très différentes
• Utiliser des conventions de nommage cohérentes

**Check rapide** : Si un groupe d'annonces a des mots-clés trop différents, scindez-le.`,
    followUp: () => ({ question: "Combien de campagnes actives avez-vous actuellement ?", storeKey: "campaignsCount" }),
    references: [
      { title: "Organiser votre compte", url: "https://support.google.com/google-ads/answer/1704395" }
    ]
  },
  {
    id: 'rsa-ads',
    topic: 'structure',
    triggers: [/rsa/i, /responsive/i, /annonce/i, /titre/i, /description/i, /cr[ée]er\s*une\s*annonce/i],
    answer: () => `**Diagnostic RSA** : Les Responsive Search Ads testent automatiquement vos combinaisons.

**Ce que je ferais** :
• Rédiger 15 titres (courts et longs, avec et sans mot-clé, avec et sans CTA)
• Rédiger 4 descriptions couvrant bénéfices, offres, réassurance, CTA
• Épingler le mot-clé principal en position titre 1 (optionnel)
• Viser "Bonne" ou "Excellente" pour la force de l'annonce

**Check rapide** : Consultez les rapports de combinaisons pour voir ce qui fonctionne.`,
    followUp: () => ({ question: "Combien de titres différents avez-vous dans vos RSA ?", storeKey: "rsaTitles" }),
    references: [
      { title: "Créer des RSA efficaces", url: "https://support.google.com/google-ads/answer/7684791" }
    ]
  },
  {
    id: 'extensions',
    topic: 'structure',
    triggers: [/extension/i, /asset/i, /sitelink/i, /callout/i, /appel/i, /prix/i, /lieu/i, /snippet/i],
    answer: () => `**Diagnostic extensions (assets)** : Les extensions augmentent le CTR de 10-15% en moyenne.

**Ce que je ferais** :
• Sitelinks : 4+ liens vers vos pages clés (produits, contact, à propos...)
• Callouts : 4+ arguments courts (Livraison gratuite, Devis en 24h...)
• Extensions d'appel : si vous prenez les appels (numéro vérifié)
• Extensions de prix : pour afficher vos offres directement
• Snippets structurés : types de services, marques, etc.

**Check rapide** : Toutes les extensions sont-elles en statut "Approuvé" ?`,
    followUp: () => ({ question: "Avez-vous configuré des extensions/assets au niveau compte ?", storeKey: "extensionsStatus" }),
    references: [
      { title: "Extensions d'annonces", url: "https://support.google.com/google-ads/answer/7332837" }
    ]
  },

  // ===================== POLICY / REFUS =====================
  {
    id: 'policy-disapproved',
    topic: 'policy',
    triggers: [/refus[ée]/i, /disapproved/i, /rejet[ée]/i, /policy/i, /violation/i, /non\s*approuv/i, /suspendu/i],
    answer: () => `**Diagnostic refus d'annonce** : Les refus sont souvent liés au contenu ou à la landing page.

**Ce que je ferais** :
• Lire le motif exact dans la colonne "État de l'annonce"
• Vérifier que la landing page correspond aux promesses de l'annonce
• Supprimer les termes interdits (superlatifs non prouvés, allégations santé...)
• Faire appel si le refus semble injustifié

**Check rapide** : Dans "Annonces" > filtrez par "Non approuvé" pour voir tous les refus.

⚠️ Récidives = risque de suspension de compte.`,
    followUp: () => ({ question: "Quel est le motif du refus indiqué par Google ?", storeKey: "policyReason" }),
    references: [
      { title: "Règles Google Ads", url: "https://support.google.com/adspolicy/answer/6008942" },
      { title: "Faire appel d'un refus", url: "https://support.google.com/google-ads/answer/1704381" }
    ]
  },

  // ===================== OBJECTIFS / QUALIFICATION =====================
  {
    id: 'objective-leads',
    topic: 'objective',
    triggers: [/lead/i, /prospect/i, /formulaire/i, /contact/i, /devis/i, /appel/i, /rdv/i, /rendez-vous/i],
    answer: (ctx) => {
      ctx.session = ctx.session || {};
      ctx.session.platform = 'leads';
      return `**Diagnostic Lead Gen** : L'objectif est de maximiser les leads qualifiés, pas le volume.

**Ce que je ferais** :
• Tracker les conversions formulaire ET appel (avec durée minimum)
• Attribuer des valeurs différentes selon la qualité du lead
• Utiliser des formulaires avec questions de qualification
• Exclure les requêtes "emploi", "gratuit", "stage"...

**Check rapide** : Quel % de vos leads deviennent clients ? C'est votre vrai KPI.`;
    },
    followUp: () => ({ question: "Quel est votre coût par lead actuel ?", storeKey: "cpl" }),
    references: [
      { title: "Optimisation pour les leads", url: "https://support.google.com/google-ads/answer/6167130" }
    ]
  },
  {
    id: 'objective-ecom',
    topic: 'objective',
    triggers: [/e-?commerce/i, /vente/i, /boutique/i, /shop/i, /panier/i, /achat/i, /transaction/i, /shopify/i, /woocommerce/i],
    answer: (ctx) => {
      ctx.session = ctx.session || {};
      ctx.session.platform = 'ecom';
      return `**Diagnostic E-commerce** : Le ROAS est votre métrique clé.

**Ce que je ferais** :
• S'assurer que les transactions remontent avec valeur dynamique
• Connecter Google Merchant Center pour Shopping/PMax
• Optimiser le flux produit (titres, images, prix, disponibilité)
• Segmenter par marge/performance produit

**Check rapide** : Dans GA4 > E-commerce, les transactions s'affichent-elles avec le bon revenu ?`;
    },
    followUp: () => ({ question: "Quel est votre ROAS actuel ?", storeKey: "roas" }),
    references: [
      { title: "E-commerce avec Google Ads", url: "https://support.google.com/google-ads/answer/6032150" }
    ]
  },

  // ===================== GETTING STARTED =====================
  {
    id: 'getting-started',
    topic: 'general',
    triggers: [/commencer/i, /d[ée]buter/i, /nouveau/i, /lancer/i, /cr[ée]er\s*un\s*compte/i, /premier/i],
    answer: () => `**Conseil pour démarrer** : Commencez simple et mesurez tout.

**Ce que je ferais** :
1. Configurer le tracking (GA4 + conversions Google Ads)
2. Lancer 1 seule campagne Search sur vos meilleurs mots-clés
3. Budget test : 30-50€/jour pendant 2-3 semaines
4. Analyser les données avant d'élargir

**Check rapide** : Avez-vous vérifié que le pixel de conversion se déclenche correctement ?`,
    followUp: () => ({ question: "Avez-vous déjà un compte Google Ads créé ?", storeKey: "accountExists" }),
    references: [
      { title: "Créer votre première campagne", url: "https://support.google.com/google-ads/answer/6324971" }
    ]
  },

  // ===================== REPORTING =====================
  {
    id: 'reporting',
    topic: 'reporting',
    triggers: [/rapport/i, /report/i, /dashboard/i, /tableau\s*de\s*bord/i, /kpi/i, /m[ée]trique/i, /performance/i],
    answer: () => `**Diagnostic reporting** : Concentrez-vous sur les métriques actionnables.

**Ce que je ferais** :
• KPIs clés : Conversions, CPA/ROAS, CTR, Quality Score
• Fréquence : hebdo pour l'opérationnel, mensuel pour la stratégie
• Créer des segments (appareil, géo, audience) pour identifier les leviers
• Looker Studio (gratuit) pour un dashboard automatisé

**Check rapide** : Vos colonnes personnalisées sont-elles sauvegardées dans Google Ads ?`,
    followUp: () => ({ question: "Avez-vous déjà un dashboard de suivi en place ?", storeKey: "dashboardStatus" }),
    references: [
      { title: "Rapports Google Ads", url: "https://support.google.com/google-ads/answer/2454069" }
    ]
  },

  // ===================== COMPETITOR =====================
  {
    id: 'competitors',
    topic: 'competitive',
    triggers: [/concurrent/i, /comp[ée]tit/i, /benchmark/i, /part\s*de\s*march/i, /auction\s*insight/i],
    answer: () => `**Diagnostic concurrentiel** : Analysez vos concurrents mais optimisez votre propre compte d'abord.

**Ce que je ferais** :
• Consulter "Informations sur les enchères" (Auction Insights)
• Identifier les concurrents qui apparaissent plus souvent que vous
• Ne pas sur-enchérir par ego (ROI > visibilité)
• Tester des USPs différenciants dans vos annonces

**Check rapide** : Quel est votre "taux de surclassement" vs principaux concurrents ?`,
    followUp: () => ({ question: "Connaissez-vous vos principaux concurrents sur Google Ads ?", storeKey: "competitors" }),
    references: [
      { title: "Informations sur les enchères", url: "https://support.google.com/google-ads/answer/2579754" }
    ]
  },

  // ===================== DISPLAY / YOUTUBE =====================
  {
    id: 'display',
    topic: 'display',
    triggers: [/display/i, /banni[èe]re/i, /r[ée]seau\s*display/i, /remarketing/i, /retargeting/i],
    answer: () => `**Diagnostic Display** : Le Display est idéal pour le remarketing, moins pour l'acquisition froide.

**Ce que je ferais** :
• Prioriser le remarketing (visiteurs site, abandons panier)
• Créer des audiences personnalisées basées sur l'intention
• Exclure les placements non pertinents (apps, jeux, sites enfants...)
• Formats : privilégier les responsive display ads

**Check rapide** : Consultez le rapport "Où les annonces ont été diffusées" et excluez les mauvais sites.`,
    followUp: () => ({ question: "Utilisez-vous le Display en acquisition ou remarketing ?", storeKey: "displayUse" }),
    references: [
      { title: "Réseau Display", url: "https://support.google.com/google-ads/answer/2404190" }
    ]
  },
  {
    id: 'youtube',
    topic: 'youtube',
    triggers: [/youtube/i, /vid[ée]o/i, /trueview/i, /bumper/i, /discovery/i],
    answer: () => `**Diagnostic YouTube Ads** : YouTube est puissant pour la notoriété et le remarketing.

**Ce que je ferais** :
• Formats recommandés : In-stream skippable (notoriété), Discovery (considération)
• Ciblage : remarketing + audiences personnalisées > ciblage large
• Vidéos : accrocher dans les 5 premières secondes (avant le skip)
• Mesurer les "conversions après visionnage" (view-through)

**Check rapide** : Votre vidéo retient-elle l'attention au-delà des 5 secondes ?`,
    followUp: () => ({ question: "Avez-vous des vidéos YouTube prêtes pour la pub ?", storeKey: "youtubeAssets" }),
    references: [
      { title: "Campagnes YouTube", url: "https://support.google.com/google-ads/answer/2375497" }
    ]
  }
];

// ============================================
// Fonctions utilitaires
// ============================================

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime accents
    .replace(/[^\w\s]/g, ' ')
    .trim();
}

function detectTopic(message) {
  const normalized = normalizeText(message);
  
  let bestMatch = null;
  let bestScore = 0;

  for (const card of knowledgeBase) {
    for (const trigger of card.triggers) {
      if (trigger.test(normalized) || trigger.test(message)) {
        const score = trigger.toString().length; // Score basique : plus le pattern est long, plus il est spécifique
        if (score > bestScore) {
          bestScore = score;
          bestMatch = card;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      card: bestMatch,
      topic: bestMatch.topic,
      confidence: Math.min(0.9, 0.5 + bestScore / 100),
      matched: true
    };
  }

  return {
    card: null,
    topic: 'general',
    confidence: 0.3,
    matched: false
  };
}

function buildMockAnswer(message, session = {}) {
  const detection = detectTopic(message);
  
  // Update session from message
  const updatedSession = updateSessionFromMessage(message, session);

  const ctx = { session: updatedSession, message };

  let text, references = [], followUp = null;

  if (detection.matched && detection.card) {
    text = detection.card.answer(ctx);
    references = detection.card.references || [];
    if (detection.card.followUp) {
      followUp = detection.card.followUp(ctx);
    }
  } else {
    // Réponse générique mais utile
    text = `**Je peux vous aider sur Google Ads et GA4** 👋

Je suis spécialisé dans :
• **Tracking** : GA4, GTM, conversions
• **Campagnes** : Search, PMax, Display, YouTube
• **Optimisation** : Quality Score, enchères, structure
• **ROI** : CPA, ROAS, budget

Pour mieux vous conseiller, j'aurais besoin de comprendre votre situation.`;
    
    followUp = { question: "Quel est votre objectif principal : leads ou ventes e-commerce ?", storeKey: "platform" };
    references = [{ title: "Centre d'aide Google Ads", url: "https://support.google.com/google-ads" }];
  }

  // Ajouter la question de suivi si pas déjà répondue
  if (followUp && !updatedSession[followUp.storeKey]) {
    text += `\n\n❓ **${followUp.question}**`;
  }

  return {
    text,
    topic: detection.topic,
    confidence: detection.confidence,
    references,
    session: updatedSession
  };
}

function updateSessionFromMessage(message, session = {}) {
  const msgLower = message.toLowerCase();
  const updated = { ...session };

  // Détecter l'objectif
  if (/lead|prospect|formulaire|contact|devis|b2b/i.test(msgLower)) {
    updated.platform = 'leads';
  } else if (/e-?commerce|vente|boutique|shop|panier|achat|b2c/i.test(msgLower)) {
    updated.platform = 'ecom';
  }

  // Détecter le budget
  const budgetMatch = msgLower.match(/(\d+)\s*[€$]|[€$]\s*(\d+)|(\d+)\s*euro/);
  if (budgetMatch) {
    updated.budget = budgetMatch[1] || budgetMatch[2] || budgetMatch[3];
  }

  // Détecter le tracking status
  if (/tracking\s*(ok|fait|en place|configur)/i.test(msgLower)) {
    updated.trackingStatus = 'ok';
  } else if (/(pas de|sans|aucun)\s*tracking/i.test(msgLower)) {
    updated.trackingStatus = 'none';
  }

  // Détecter si compte existe
  if (/j'ai un compte|compte actif|compte google ads/i.test(msgLower)) {
    updated.accountExists = true;
  } else if (/pas de compte|nouveau compte|créer un compte/i.test(msgLower)) {
    updated.accountExists = false;
  }

  return updated;
}

module.exports = {
  knowledgeBase,
  detectTopic,
  buildMockAnswer,
  normalizeText,
  updateSessionFromMessage
};




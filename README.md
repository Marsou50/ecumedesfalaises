# L'Écume — Fin de soirée

Application de prévention : on photographie ses verres, l'application estime l'alcoolémie
à partir du gabarit, du sexe, du type de permis et du contexte du repas, puis donne
**l'heure à laquelle on repasse sous le seuil légal** avant de reprendre le volant.

> ⚠️ Estimation indicative, jamais une mesure. Ce projet ne remplace ni un éthylotest
> ni une prise de sang et ne doit jamais servir à décider de conduire.

---

## Ce que fait l'application

| Écran | Rôle |
| --- | --- |
| `Landing` | Présentation, création du profil en 30 s, accès à une soirée de démonstration. |
| `Ce soir` / `Results` | Jauge d'alcoolémie, verdict « conduite possible / pas encore », heure de retour sous le seuil, heure de retour à zéro, courbe prévisionnelle 48 h, conseils de récupération, étapes de la soirée, repère « le verre de trop » personnalisé. |
| `ScanSheet` | Prise de photo (caméra ou import), moteur de reconnaissance sélectionnable, 3 boissons candidates avec indice de confiance, aperçu des signaux mesurés, ajustement du volume et de l'heure (« c'était il y a… »), ajout au journal. |
| `EngineSheet` | Choix du moteur de reconnaissance, réglage de la clé API, tests de connexion réels (chargement MobileNet, appel API). |
| `Journal` | Liste horodatée des verres, décalage de ±15 min, suppression, contexte du dernier repas, bilan, clôture de soirée et historique des soirées précédentes. |
| `Comprendre` | Seuils légaux, verre standard, formule utilisée, mythes, plan B, FAQ. |
| `ProfileSheet` | Sexe biologique, poids, taille, âge, type de permis, vitesse d'élimination, aperçu immédiat du coefficient de diffusion. |

Tout est stocké dans `localStorage` : aucun compte, aucun réseau, aucune donnée envoyée.

## Moteurs de reconnaissance (`src/lib/recognition.ts`)

Trois moteurs interchangeables, normalisés dans une même structure `EngineOutput`
(`candidates`, `signals`, `warnings`, `elapsedMs`, `fellBack`). Le moteur actif est
mémorisé dans le `localStorage` et affiché partout dans l'interface.

| Moteur | Technologie | Coût | Précision |
| --- | --- | --- | --- |
| **Couleurs** (par défaut) | Analyse locale des pixels : teinte dominante, saturation, luminosité, niveau de remplissage | 0 ko, hors ligne | Famille de boisson approximative |
| **TensorFlow.js** | MobileNet v2 (ImageNet, 1 000 classes), exécuté en WebGL sur l'appareil | ~14 Mo au 1er chargement + 2 scripts CDN | Reconnaît verres, bouteilles, bars ; croisé avec la teinte |
| **API vision** | Gemini, OpenAI, Mistral ou tout endpoint compatible OpenAI, réponse JSON contrainte | Payant, clé requise | Meilleure reconnaissance des cocktails et verres réels |

### Fonctionnement

1. **Préparation** — l'image est redimensionnée à 1 024 px max (JPEG qualité 0,86) et les
   couleurs sont mesurées une seule fois (`sampleColors`), quel que soit le moteur.
2. **TensorFlow** — `loadTfScripts()` injecte `tf.min.js` puis `mobilenet.min.js` depuis
   jsDelivr (UMD, jamais bundlés), `mobilenet.load({ version: 2, alpha: 1.0 })` télécharge
   les poids depuis TFHub. `classify()` donne 6 classes ; les familles détectées
   (`beer glass`, `goblet`, `cocktail shaker`, `bar`…) sont croisées avec la teinte mesurée
   par `candidatesFromImagenet()`.
3. **API** — un prompt à **liste fermée** (30 identifiants du catalogue) impose un JSON
   `{"drinks":[{"id","confidence","volume_cl","abv"}]}`. `parseVisionResponse()` tolère le
   JSON brut, les backticks et le texte autour. Les identifiants inconnus sont ignorés, et
   une description libre est remappée sur le catalogue en dernier recours.
4. **Repli** — toute erreur (clé absente, CORS, 401/404/429, timeout de 25 s, CDN
   inaccessible) bascule automatiquement sur l'analyse locale, avec un message explicite.

### Sécurité de la clé API

La clé est stockée dans le `localStorage` **uniquement si l'utilisateur coche
« Mémoriser »**. Elle reste visible par quiconque a accès à l'appareil (et par les
extensions) : pour un déploiement public, il faut passer par un proxy serveur
(`/api/vision`) et ne jamais exposer la clé côté client. Ce point est signalé dans l'interface.

## Modèle de calcul (`src/lib/bac.ts`)

**Alcool pur** : `grammes = volume (cl) × 10 × degré (%) × 0,789`

**Formule de Widmark**

```
alcoolémie (g/L) = alcool absorbé (g) / (poids (kg) × r)
```

- `r = 0,70` (homme), `0,60` (femme), `0,65` (autre), ajusté de ±4 % selon l'IMC et l'âge.
- Phase d'absorption progressive : 20 min à jeun → 80 min après un repas copieux
  (réduite pour les boissons gazeuses et les spiritueux).
- Élimination linéaire : 0,12 / 0,15 / 0,18 g/L/h selon le réglage « lent / moyen / rapide ».
- Intégration par pas de 5 min : `niveau += Δabsorbé / V − β·Δt`, ce qui reproduit
  une montée pendant la consommation puis une descente linéaire après le pic.
- Marge de sécurité de **0,10 g/L** appliquée avant d'annoncer une conduite possible ;
  si l'absorption n'est pas terminée (`willRise`), l'application répond « pas encore ».
- Seuils : **0,5 g/L** (permis définitif) · **0,2 g/L** (permis probatoire) · **0,8 g/L** (délit).

## Stack

- React 19 + TypeScript + Vite 7
- TensorFlow.js 4.22 + MobileNet v2 (chargés à la demande depuis le CDN, types npm en dev)
- Tailwind CSS 4 (thème « marine / lagoon / gold » défini dans `src/index.css`)
- `lucide-react` pour les icônes
- `vite-plugin-singlefile` : le build tient dans un seul `index.html` (déployable sur GitHub Pages)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/index.html autonome
```

## Arborescence

```
src/
├─ App.tsx                  # coquille, navigation, toasts
├─ lib/
│  ├─ bac.ts                # modèle d'alcoolémie (Widmark + absorption + élimination)
│  ├─ drinks.ts             # 30 boissons, volumes, identification par couleurs
│  ├─ recognition.ts        # moteurs (couleurs / TensorFlow.js / API), parsing, repli
│  └─ store.tsx             # contexte global + persistance localStorage
├─ components/
│  ├─ charts.tsx            # jauge et courbe SVG
│  ├─ Glass.tsx             # verres vectoriels (9 formes)
│  ├─ Landing.tsx           # page d'accueil
│  ├─ StartSoiree.tsx       # état vide / démarrage
│  ├─ Results.tsx           # écran principal
│  ├─ ScanSheet.tsx         # scanner photo
│  ├─ EngineSheet.tsx       # choix du moteur + clé API + tests
│  ├─ Journal.tsx           # journal + historique
│  ├─ Comprendre.tsx        # pédagogie
│  ├─ ProfileSheet.tsx      # profil
│  ├─ chrome.tsx            # barre, onglets mobiles, footer, toast
│  └─ ui.tsx                # Reveal / Stagger
└─ assets/bar-glasses.jpg   # photo d'ambiance (inlinée au build)
```

## Limites assumées

1. **Aucun des moteurs n'est un classifieur de boissons entraîné spécifiquement.**
   ImageNet ne contient aucune classe « pinte » ou « mojito » ; un LLM vision identifie une
   famille de boisson, pas un degré. La validation humaine reste obligatoire.
   Pour aller plus loin : fine-tuner un modèle sur un jeu de photos de verres étiquetées.
2. **Aucun degré d'alcool n'est lisible sur une photo** : l'utilisateur confirme toujours la boisson.
3. **L'alcoolémie réelle varie** avec la génétique, le foie, la fatigue, les médicaments,
   le cycle hormonal… D'où la marge de sécurité et les avertissements répétés.
4. Le modèle ne connaît pas les repas horodatés : le contexte « repas » s'applique à la soirée
   entière et reste un choix manuel.

## Ressources de prévention

- Alcool Info Service : **0 980 980 930** — 7 j/7 de 8 h à 2 h, appel anonyme et non surtaxé.
- `alcool-info-service.fr`
- L'abus d'alcool est dangereux pour la santé, à consommer avec modération.

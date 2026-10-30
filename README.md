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
| `ScanSheet` | Prise de photo (caméra ou import), analyse réelle des pixels (teinte moyenne, saturation, luminosité, niveau de remplissage), 3 boissons candidates avec indice de confiance, ajustement du volume et de l'heure (« c'était il y a… »), ajout au journal. |
| `Journal` | Liste horodatée des verres, décalage de ±15 min, suppression, contexte du dernier repas, bilan, clôture de soirée et historique des soirées précédentes. |
| `Comprendre` | Seuils légaux, verre standard, formule utilisée, mythes, plan B, FAQ. |
| `ProfileSheet` | Sexe biologique, poids, taille, âge, type de permis, vitesse d'élimination, aperçu immédiat du coefficient de diffusion. |

Tout est stocké dans `localStorage` : aucun compte, aucun réseau, aucune donnée envoyée.

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
│  ├─ drinks.ts             # 30 boissons, volumes, reconnaissance photo
│  └─ store.tsx             # contexte global + persistance localStorage
├─ components/
│  ├─ charts.tsx            # jauge et courbe SVG
│  ├─ Glass.tsx             # verres vectoriels (9 formes)
│  ├─ Landing.tsx           # page d'accueil
│  ├─ StartSoiree.tsx       # état vide / démarrage
│  ├─ Results.tsx           # écran principal
│  ├─ ScanSheet.tsx         # scanner photo
│  ├─ Journal.tsx           # journal + historique
│  ├─ Comprendre.tsx        # pédagogie
│  ├─ ProfileSheet.tsx      # profil
│  ├─ chrome.tsx            # barre, onglets mobiles, footer, toast
│  └─ ui.tsx                # Reveal / Stagger
└─ assets/bar-glasses.jpg   # photo d'ambiance (inlinée au build)
```

## Limites assumées

1. **La reconnaissance photo est une heuristique**, pas un modèle de vision entraîné :
   elle exploite la forme du verre, la teinte et le niveau de remplissage réels de l'image,
   puis propose 3 candidats que l'utilisateur doit valider. Un vrai produit remplacerait
   `identifyFromPhoto()` par un modèle de détection (TensorFlow.js / API distante).
2. **Aucun degré d'alcool n'est lisible sur une photo** : l'utilisateur confirme toujours la boisson.
3. **L'alcoolémie réelle varie** avec la génétique, le foie, la fatigue, les médicaments,
   le cycle hormonal… D'où la marge de sécurité et les avertissements répétés.
4. Le modèle ne connaît pas les repas horodatés : le contexte « repas » s'applique à la soirée
   entière et reste un choix manuel.

## Ressources de prévention

- Alcool Info Service : **0 980 980 930** — 7 j/7 de 8 h à 2 h, appel anonyme et non surtaxé.
- `alcool-info-service.fr`
- L'abus d'alcool est dangereux pour la santé, à consommer avec modération.

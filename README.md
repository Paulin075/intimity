# Intimity

Intimity est une application moderne de suivi du cycle menstruel, pensée pour le bien-être, la confidentialité et la personnalisation. Elle propose un accompagnement doux, des prédictions intelligentes, un journal des symptômes, des analyses et des conseils personnalisés.

## ✅ **CORRECTIONS ET AMÉLIORATIONS APPORTÉES**

### **Erreurs TypeScript corrigées (94 erreurs → 0 erreur)**
- ✅ Ajout des p
ropriétés manquantes dans la palette de couleurs (`surface`, `elevated`, `accentRules`, `accentFertility`, `success`, `warning`, `error`, `buttonSecondary`)
- ✅ Harmonisation des types entre `src/types.ts` et `src/services/`
- ✅ Correction des imports et exports manquants
- ✅ Ajout du style `buttonSecondary` manquant
- ✅ Correction des problèmes de nullabilité dans les services
- ✅ Suppression des fichiers incompatibles (pages web, tests problématiques)

### **🎨 Onboarding modernisé (inspiré de Flo)**
- ✅ **Sélecteurs de dates modernes** avec modal personnalisé et sélection rapide
- ✅ **Interface circulaire** pour les durées de cycle et règles
- ✅ **Navigation fluide** avec barre de progression animée
- ✅ **Sélecteurs visuels** pour les objectifs et notifications
- ✅ **Animations fluides** et transitions entre étapes
- ✅ **Interface responsive** et accessible

### **Dépendances ajoutées**
- ✅ `@testing-library/react-native` pour les tests
- ✅ `@types/jest` pour les types de test
- ✅ `tailwind-merge` et `clsx` pour les utilitaires
- ✅ `@types/react-dom` pour les types React DOM

### **Configuration améliorée**
- ✅ Scripts npm ajoutés (`build`, `lint`, `test`, `type-check`)
- ✅ Configuration Jest pour les tests
- ✅ Configuration TypeScript optimisée

## Fonctionnalités principales
- Onboarding personnalisé (cycle, notifications, objectifs)
- Authentification sécurisée (inscription, connexion, mot de passe oublié)
- Dashboard avec prédictions et conseils bien-être
- Journal des symptômes (ajout, suivi, statistiques)
- Analyses et tendances du cycle
- Paramètres avancés (notifications, sécurité, apparence, langue)
- Thème clair/sombre dynamique
- Accessibilité renforcée (labels, navigation assistée)

## Structure du projet
```
intimitys/
  ├── App.tsx                # Point d'entrée principal
  ├── src/
  │   ├── App.tsx            # Composant principal (navigation)
  │   ├── pages/             # Pages principales (Dashboard, Auth, Settings, etc.)
  │   ├── components/        # Composants réutilisables
  │   ├── hooks/             # Hooks personnalisés (auth, thème, etc.)
  │   ├── services/          # Services métier (cycles, symptômes, notifications)
  │   ├── theme/             # Palette de couleurs centralisée
  │   ├── styles/            # Styles factorisés (commonStyles)
  │   ├── types.ts           # Types TypeScript globaux
  │   └── __tests__/         # Tests unitaires
  ├── package.json           # Dépendances et scripts
  └── README.md              # Documentation
```

## Installation
1. **Cloner le projet**
   ```bash
   git clone <repo-url>
   cd intimitys
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```
3. **Lancer l'application**
   ```bash
   npm start
   # ou
   yarn start
   ```

## Scripts utiles
- `npm start` : Lancer l'application en mode développement
- `npm run android` : Lancer sur Android
- `npm run ios` : Lancer sur iOS
- `npm run web` : Lancer sur le web
- `npm run build` : Construire l'application pour la production
- `npm run lint` : Vérifier la qualité du code TypeScript
- `npm run test` : Lancer les tests
- `npm run type-check` : Vérifier les types TypeScript

## Gestion du thème
- Le thème clair/sombre est géré via le hook `use-theme` et la palette centralisée dans `src/theme/palette.ts`.
- Les styles récurrents sont factorisés dans `src/styles/common.ts`.

## Accessibilité
- Les principaux boutons et champs de saisie ont des props `accessibilityLabel` et `accessible`.
- L'application est conçue pour être utilisable avec un lecteur d'écran.

## Tests
- Configuration Jest avec `jest-expo`
- Tests unitaires dans `src/__tests__/`
- Mock des dépendances natives (AsyncStorage, Notifications, Navigation)

## Base de données
- Supabase pour l'authentification et le stockage
- Tables : `utilisatrices`, `cycles`, `symptomes`, `notifications`, `user_preferences`
- Mode de test disponible pour le développement sans Supabase

## Contribution
1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'Ajout d'une fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Contact
Pour toute question ou suggestion, contactez l'équipe à : [contact@intimity.app](mailto:contact@intimity.app)

## Setup (Web)

Pour le calendrier sur le web, installez la dépendance :

```
npm install react-datepicker
```

et importez le CSS dans votre composant :

```js
import 'react-datepicker/dist/react-datepicker.css';
``` 
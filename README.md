# Fineltori - Wealth Management SaaS

Un SaaS de gestion de patrimoine similaire à Finary, permettant de connecter ses comptes bancaires via Powens et de visualiser son patrimoine.

## Technologies

- **Framework**: Next.js 15 (App Router) avec TypeScript
- **Base de données**: Supabase (PostgreSQL + Auth)
- **Intégration bancaire**: Powens API
- **UI**: Tailwind CSS + shadcn/ui
- **Graphiques**: Recharts
- **Déploiement**: Vercel

## Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Un compte Powens (API d'agrégation bancaire)

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com/dashboard)
2. Récupérer l'URL du projet et les clés API (Settings > API)
3. Mettre à jour `.env.local` avec vos credentials Supabase

### 3. Configuration Powens

1. Créer un compte développeur sur [Powens](https://www.powens.com/)
2. Récupérer vos credentials API (Client ID, Client Secret, Webhook Secret)
3. Mettre à jour `.env.local` avec vos credentials Powens

### 4. Initialiser la base de données

```bash
# Initialiser Supabase CLI
npx supabase init

# Se connecter à Supabase
npx supabase login

# Lier le projet (remplacer avec votre project-ref)
npx supabase link --project-ref your-project-ref

# Appliquer les migrations
npx supabase db push

# Générer les types TypeScript
npx supabase gen types typescript --local > types/database.ts
```

### 5. Configuration de l'authentification Supabase

Dans le dashboard Supabase (Authentication > URL Configuration):
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth-callback`

Activer les providers d'authentification:
- Email/Password (activé par défaut)
- Google OAuth (optionnel)

## Lancer le projet

### Mode développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
fineltori/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Routes d'authentification
│   ├── (dashboard)/            # Routes protégées du dashboard
│   └── api/                    # API Routes
├── components/                 # Composants React
│   ├── ui/                     # Composants UI (shadcn/ui)
│   ├── auth/                   # Composants d'authentification
│   ├── dashboard/              # Composants du dashboard
│   └── charts/                 # Composants de graphiques
├── lib/                        # Utilities et clients
│   ├── supabase/               # Clients Supabase
│   ├── powens/                 # Client et sync Powens
│   └── utils/                  # Utilities (formatters, etc.)
├── types/                      # Définitions TypeScript
├── hooks/                      # Custom React hooks
└── supabase/                   # Migrations SQL
```

## Fonctionnalités MVP

- ✅ Authentification utilisateur (email/password, OAuth)
- ✅ Dashboard avec métriques clés
- ✅ Connexion de comptes bancaires via Powens
- ✅ Synchronisation automatique des transactions
- ✅ Visualisation du patrimoine total (net worth)
- ✅ Graphiques de répartition des actifs
- ✅ Évolution du patrimoine dans le temps
- ✅ Liste des comptes et transactions

## Déploiement sur Vercel

### 1. Préparer la production

- Créer un projet Supabase production
- Configurer les variables d'environnement sur Vercel
- Configurer les credentials Powens production

### 2. Déployer

```bash
npm i -g vercel
vercel --prod
```

### 3. Configuration post-déploiement

- Mettre à jour les URL de redirection dans Supabase
- Configurer le webhook Powens avec votre URL de production
- Tester le flow complet d'authentification et de connexion bancaire

## Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm start` - Démarre le serveur de production
- `npm run lint` - Lint le code avec ESLint
- `npm run type-check` - Vérifie les types TypeScript

## Variables d'environnement

Voir `.env.example` pour la liste complète des variables nécessaires.

### Variables obligatoires:
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role (admin) Supabase
- `POWENS_CLIENT_ID` - ID client Powens
- `POWENS_CLIENT_SECRET` - Secret client Powens
- `NEXT_PUBLIC_APP_URL` - URL de l'application

## Sécurité

- Les données sont protégées par Row Level Security (RLS) dans Supabase
- Les clés secrètes ne sont jamais exposées au client
- Les webhooks Powens sont vérifiés avec HMAC
- Toutes les API routes nécessitent une authentification

## Support

Pour toute question ou problème, créer une issue sur le repository.

## Licence

MIT

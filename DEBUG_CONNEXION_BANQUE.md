# Guide de Débogage - Connexion Bancaire

## Problèmes Courants et Solutions

### 1. Vérifier les Variables d'Environnement sur Vercel

Assurez-vous que toutes ces variables sont configurées dans **Vercel Dashboard → Settings → Environment Variables** :

```
✅ NEXT_PUBLIC_APP_URL=https://fineltori.vercel.app
✅ POWENS_CLIENT_ID=votre_client_id
✅ POWENS_CLIENT_SECRET=votre_client_secret
✅ POWENS_API_URL=https://fineltori-sandbox.biapi.pro/2.0 (optionnel)
✅ NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
✅ SUPABASE_SERVICE_ROLE_KEY=votre_cle_service
```

**Important** : Après avoir ajouté/modifié des variables, **redéployez** votre application.

### 2. Vérifier les Logs Vercel

1. Allez sur **Vercel Dashboard** → Votre projet → **Deployments**
2. Cliquez sur le dernier déploiement
3. Ouvrez l'onglet **Runtime Logs**
4. Cherchez les erreurs liées à `/api/powens/connect`

### 3. Vérifier la Console du Navigateur

1. Ouvrez votre site sur Vercel
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Cliquez sur "Connecter une banque"
5. Regardez les erreurs affichées

### 4. Messages d'Erreur Courants

#### "Configuration manquante: Les identifiants Powens ne sont pas configurés"
**Solution** : Ajoutez `POWENS_CLIENT_ID` et `POWENS_CLIENT_SECRET` sur Vercel

#### "Configuration manquante: NEXT_PUBLIC_APP_URL n'est pas défini"
**Solution** : Ajoutez `NEXT_PUBLIC_APP_URL=https://fineltori.vercel.app` sur Vercel

#### "Erreur lors de la création de l'utilisateur Powens"
**Causes possibles** :
- Identifiants Powens incorrects
- API Powens indisponible
- Problème de réseau

**Solution** : Vérifiez vos identifiants Powens dans le dashboard Powens

#### "Non autorisé"
**Solution** : Vous devez être connecté à votre compte pour connecter une banque

#### La popup ne s'ouvre pas
**Causes possibles** :
- Bloqueur de popup activé
- Problème avec l'URL générée

**Solution** : Autorisez les popups pour votre site, ou vérifiez que l'URL Powens est correcte

### 5. Tester l'API Directement

Vous pouvez tester l'endpoint directement avec curl :

```bash
curl -X POST https://fineltori.vercel.app/api/powens/connect \
  -H "Content-Type: application/json" \
  -H "Cookie: votre_cookie_de_session"
```

### 6. Vérifier la Configuration Powens

1. Allez sur votre dashboard Powens
2. Vérifiez que votre application est active
3. Vérifiez que les **Redirect URLs** incluent :
   - `https://fineltori.vercel.app/api/powens/callback`

### 7. Vérifier les Logs Supabase

Si le problème vient de la base de données :
1. Allez sur **Supabase Dashboard** → **Logs**
2. Vérifiez les erreurs SQL

## Checklist de Débogage

- [ ] Toutes les variables d'environnement sont configurées sur Vercel
- [ ] L'application a été redéployée après l'ajout des variables
- [ ] Vous êtes connecté à votre compte
- [ ] Les identifiants Powens sont corrects
- [ ] L'URL de redirection est configurée dans Powens
- [ ] Aucun bloqueur de popup n'est actif
- [ ] Les logs Vercel ne montrent pas d'erreurs
- [ ] La console du navigateur ne montre pas d'erreurs

## Obtenir de l'Aide

Si le problème persiste :
1. Copiez le message d'erreur exact
2. Copiez les logs Vercel (Runtime Logs)
3. Copiez les erreurs de la console du navigateur
4. Vérifiez que toutes les variables d'environnement sont bien configurées

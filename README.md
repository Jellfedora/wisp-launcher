# Wisp Launcher

Application electron js facilitant la mise à jour des modpacks pour serveur valheim.
Mises à jour automatique et lanceur de jeu.
Actuellement en alpha test mais déjà validé par mes joueurs!

## Faire une copie de .env.copy.local et le renommer en .env.local

```bash
cp .env.copy.local .env.local
```

## Installation

```bash
npm install
```

## Start

```bash
npm run dev
```

## Build Windows Production

- Remplacer les valeurs du .env par celle l'environnement souhaité:

### Local

```bash
VITE_API_URL=http://localhost:8082/api/ # On garde le / à la fin
VITE_ENV=local
```

### Test

```bash
VITE_API_URL=https://wisp-forgetest.hopto.org/api/ # On garde le / à la fin
VITE_ENV=test
```

### Prod

```bash
VITE_API_URL=https://wisp-forge.hopto.org/api/ # On garde le / à la fin
VITE_ENV=prod
```

- Lancer la commande suivante pour build l'application pour windows

```bash
npm run build:win
```

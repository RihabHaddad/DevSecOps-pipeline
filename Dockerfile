# Utiliser une version de Node.js avec une version plus récente de Debian
FROM node:18-bullseye

# Répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances npm
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers du projet dans le conteneur
COPY . .

# Exposer le port de l'application
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]

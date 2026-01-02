# =============================
# BASE IMAGE WITH COMPILERS
# =============================
FROM ubuntu:22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------
# Install system dependencies
# -----------------------------
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    clang-format \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    curl \
    npm \
    nodejs \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Install Python formatter
# -----------------------------
RUN pip3 install --no-cache-dir black

# -----------------------------
# Install JavaScript formatter
# -----------------------------
RUN npm install -g prettier

# -----------------------------
# Install Java formatter
# -----------------------------
RUN curl -L https://github.com/google/google-java-format/releases/download/v1.17.0/google-java-format-1.17.0-all-deps.jar \
    -o /usr/local/bin/google-java-format.jar

# =============================
# FRONTEND BUILD
# =============================
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# =============================
# BACKEND SETUP
# =============================
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install

COPY backend .

# =============================
# NGINX CONFIG
# =============================
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-enabled/default

# =============================
# EXPOSE & START
# =============================
EXPOSE 8080

CMD ["sh", "-c", "node /backend/index.js & nginx -g 'daemon off;'"]

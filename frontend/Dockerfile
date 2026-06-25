
FROM node:20-alpine

WORKDIR /app


COPY package*.json ./


RUN npm ci

COPY . .

# Vite'ın dış dünyadan (3000 portundan) gelen istekleri dinleyebilmesi için 5173 portunu açıyoruz
EXPOSE 5173

# Vite sunucusunu '--host' parametresiyle başlatıyoruz (Docker ağı için KRİTİK!)
CMD ["npm", "run", "dev", "--", "--host"]
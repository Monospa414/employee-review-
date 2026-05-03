# Используем легкий образ Node.js
FROM node:20-alpine

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

# Открываем порт Vite
EXPOSE 5173

# Запускаем в режиме разработки с пробросом хоста
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
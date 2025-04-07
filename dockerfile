# Этап сборки
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./yarn.lock ./
RUN yarn install

COPY . ./
RUN yarn build

# Этап развёртывания
FROM nginx:stable-alpine

# Копируем основной конфиг Nginx
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/default.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Экспонируем порт 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

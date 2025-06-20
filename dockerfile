
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./yarn.lock ./
RUN yarn install

COPY . ./
RUN yarn build

FROM nginx:stable-alpine

COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

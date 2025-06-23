# HSE Coursework: Frontend

Этот репозиторий содержит фронтенд-часть проекта. Веб-приложение позволяет пользователям просматривать графики, получать ML-прогнозы, получать отчёты и выгружать данные из [мобильного приложения](https://github.com/HSE-COURSEWORK-2025/hse-coursework-android-app).

![](https://github.com/HSE-COURSEWORK-2025/hse-coursework-front/blob/master/frontend_demo.gif)

## Основные возможности
- Авторизация через Google и тестовые аккаунты
- Просмотр графиков исходных данных и данных с выбросами
- Получение ML-прогнозов по медицинским показателям
- Генерация PDF-отчётов
- Получение уведомлений о событиях
- Интеграция с мобильным приложением через QR-код

## Технологии
- React 19, TypeScript
- Material UI, Chart.js, notistack
- axios, react-router-dom
- Docker, Nginx

## Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/awesomecosmonaut/hse-coursework-front.git
cd hse-coursework-front
```

### 2. Установка зависимостей
```bash
yarn install
# или
npm install
```

### 3. Запуск в режиме разработки
```bash
yarn start
# или
npm start
```

### 4. Сборка для продакшена
```bash
yarn build
# или
npm run build
```

### 5. Переменные окружения
Создайте файл `.env` (или используйте `.env.development` для локального запуска) и укажите необходимые переменные:

```
REACT_APP_AUTH_API_URL=...
REACT_APP_DATA_COLLECTION_API_URL=...
REACT_APP_DATA_COLLECTION_WS_URL=...
REACT_APP_RATINGS_API_URL=...
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=...
REACT_APP_GOOGLE_REDIRECT_URI=...
PORT=3000
```

## Docker
Для сборки и запуска контейнера используйте:
```bash
docker build -t awesomecosmonaut/frontend-app .
docker run -p 3000:3000 awesomecosmonaut/frontend-app
```

## Развёртывание в Kubernetes
Для автоматического деплоя выполните в терминале:

```bash
./deploy.sh
```

## Структура проекта
- `src/components` — переиспользуемые компоненты (навигация, графики, авторизация)
- `src/pages` — страницы приложения
- `config/` — конфиги nginx для продакшена
- `dockerfile` — Dockerfile для сборки контейнера

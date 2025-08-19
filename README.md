# 💽 Конструктор бизнес-процессов (backend)

## 📌 Оглавление

- [Установка и сборка](##-установка-и-сборка)
- [Настройка](##-настройка)
- [Запуск](##-запуск)
- [Superuser](##-superuser)
- [Migrations](##-migrations)
- [API документация](##-api-документация)
- [Docker](##-docker)



## 🛠️ Установка и сборка
- npm install
- npm run build

------------------------------------------------------------------
## ДЛЯ ВЕТКИ DEVELOP

#### Запустить скрипт для создания пользователя:
- npm run create-superuser -- -e user1@example.com -p user1

При запуске в docker compose пользователь создастся автоматически
------------------------------------------------------------------

## ⚙️ Настройка
В файл .env добавить следующие значения:
- DB_USER - пользователь БД
- DB_HOST - хост, где расположена БД
- DB_NAME - имя БД
- DB_PASSWORD - пароль пользователя
- DB_PORT - порт сервера БД
- HOST - хост, где будет запущено приложение (для локальной разработки: http://localhost)
- PORT - порт приложения
- JWT_ACCESSTOKEN_KEY - ключ генерации access token
- JWT_REFRESHTOKEN_KEY - ключ генерации refresh token

Для всего окружения есть значения по умолчанию, кроме подключения к БД

## 🚀 Запуск
#### Для разработки без watcher:
- npm run start 

#### Для разработки c watcher:
- npm run dev 

#### Запуск сборки:
- npm run start:prod 

## 👨‍✈️ Superuser
В проекте предусмотрен скрипт для создания пользователя до запуска сервера

#### Команда для dev:
- npm run create-superuser -- -e youremail@example.com -p yourpassword

#### Команда для prod:
- npm create-superuser:prod -- -e youremail@example.com -p yourpassword

Параметры -e и -p являются обязательными!

## 🚚 Migrations
Создание миграций происходит в ручном режиме
#### Путь для создания миграций:
- src/db/migrations/<0000_00_00_00_00_example>.sql

#### Запуск миграций dev:
- npm run migrate

#### Запуск миграций prod:
- npm run migrate:prod

#### Путь для cхем первичного создания таблиц в БД:
- src/db/schemas

## 📜 API документация
Все эндпоинты задокументированы при помощи swagger

#### Swagger доступен по пути: 
- HOST:PORT/api-docs

## 🐳 Docker
#### Окружение:
- .env

#### Для запуска:
-  docker compose up -d --build

#### Для остановки:
-  docker compose down

#### Порт приложения:
- 8081

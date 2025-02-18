# Weather Parser Project

## 📌 Описание

Этот проект предназначен для парсинга данных о погоде с удалённого сервера, их сохранения в базу данных SQLite и предоставления API для доступа к ним через FastAPI. Также предусмотрен модуль фронтенда для отображения информации.

## 🏗 Структура проекта

```
/weather_parser        # Модуль парсера погоды
    ├── parser.py     # Логика парсинга данных
    ├── database.py   # Работа с SQLite
    ├── config.py     # Конфигурационные настройки
    ├── run_parser.py # Основной скрипт запуска парсера

/backend              # Веб-бэкенд (FastAPI)
    ├── main.py       # Основной файл API
    ├── models.py     # Описание моделей данных
    ├── database.py   # Подключение к БД

/frontend             # Фронтенд (например, React/Vue/Svelte)
    ├── src/         # Исходный код фронтенда
    ├── public/      # Статика

/scripts              # Скрипты для обслуживания
.gitignore            # Исключения для Git
requirements.txt      # Зависимости проекта
README.md             # Описание проекта
```

## 🚀 Установка и запуск

### 1️⃣ Установка зависимостей

```sh
python -m venv venv  # Создать виртуальное окружение
source venv/bin/activate  # Активировать окружение
pip install -r requirements.txt  # Установить зависимости
```

### 2️⃣ Инициализация базы данных

```sh
python weather_parser/database.py
```

### 3️⃣ Запуск парсера

```sh
python weather_parser/run_parser.py
```

### 4️⃣ Запуск бэкенда

```sh
cd backend
uvicorn main:app --reload
```

### 5️⃣ Запуск фронтенда (если есть)

```sh
cd frontend
npm install  # Установить зависимости
npm run dev  # Запустить фронтенд
```

## 🔍 API Бэкенда (FastAPI)

После запуска FastAPI API доступно по адресу: `http://127.0.0.1:8000/docs`

Примеры эндпоинтов:

- `GET /weather` — получить последние данные о погоде
- `GET /weather/{table_name}` — получить данные по конкретной группе сенсоров

## 🛠 Технологии

- **Python** (FastAPI, SQLite, BeautifulSoup)
- **Frontend** (React/Vue/Svelte, TailwindCSS)
- **Docker** (по желанию)

## 📜 Лицензия

Этот проект распространяется под лицензией MIT.


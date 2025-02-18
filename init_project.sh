#!/bin/bash

# Определение структуры проекта
PROJECT_NAME="weather_project"
DIRS=(
    "weather_parser"
    "backend"
    "frontend"
)
FILES=(
    "weather_parser/parser.py"
    "weather_parser/database.py"
    "weather_parser/config.py"
    "weather_parser/run_parser.py"
    "backend/main.py"
    "backend/database.py"
    "backend/models.py"
    "backend/routes.py"
    "frontend/index.html"
    "weather_data.db"
    ".gitignore"
    "README.md"
    "docker-compose.yml"
)

# Создание директорий
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME" || exit
for dir in "${DIRS[@]}"; do
    mkdir -p "$dir"
    echo "Создана директория: $dir"
done

# Создание файлов
for file in "${FILES[@]}"; do
    touch "$file"
    echo "Создан файл: $file"
done

# Инициализация виртуального окружения и установка зависимостей
python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4 fastapi uvicorn

echo "Проект успешно инициализирован!"

# database.py

import sqlite3
from config import DB_FILE

def get_db_connection():
    """Создает и возвращает соединение с БД"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    """Создает таблицу с показателями погоды"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_data (
            source TEXT,
            timestamp REAL,
            temperature REAL,
            humidity REAL,
            pressure REAL,
            illuminance REAL,
            uv_index REAL,
            ir_value REAL,
            wind_speed REAL,
            wind_dir INTEGER,
            wind_gust REAL,
            PRIMARY KEY (source, timestamp)
        )
    """)

    # Создаем таблицу для прогноза погоды, если её нет
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_forecast (
            source TEXT NOT NULL,
            timestamp REAL NOT NULL,
            temperature REAL,
            pressure REAL,
            humidity REAL,
            wind_speed REAL,
            wind_gust REAL,
            wind_dir INTEGER,
            PRIMARY KEY (source, timestamp)
        )
    """)
    
     # Создание индекса на поле timestamp
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON weather_data(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp_fc ON weather_forecast(source, timestamp)")

    conn.commit()
    conn.close()

def save_weather(dataList):
    """Сохраняет данные в БД одной строкой"""
    if not dataList:
        print("Нет данных для сохранения")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    for data in dataList:
        cursor.execute("""
            INSERT OR IGNORE INTO weather_data (source, timestamp, temperature, humidity, pressure, illuminance, uv_index, ir_value, wind_speed, wind_dir, wind_gust)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["source"],
            data["timestamp"],
            data.get("temperature"),
            data.get("humidity"),
            data.get("pressure"),
            data.get("illuminance"),
            data.get("uv_index"),
            data.get("ir_value"),
            data.get("wind_speed"),
            data.get("wind_dir"),
            data.get("wind_gust")
        ))
        conn.commit()

    conn.close()
    print(f"Данные сохранены в БД")

def save_forecast(data):
    """Сохраняет данные в БД одной строкой"""
    if not data:
        print("Нет данных для сохранения")
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    for row in data:
        cursor.execute("""
            INSERT OR IGNORE INTO weather_forecast (source, timestamp, temperature, pressure, humidity, wind_speed, wind_gust, wind_dir)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row["source"],
            row["timestamp"],
            row.get("temperature"),
            row.get("humidity"),
            row.get("pressure"),
            row.get("wind_speed"),
            row.get("wind_dir"),
            row.get("wind_gust")
        ))

    conn.commit()
    conn.close()
    print(f"Данные прогноза сохранены в БД")
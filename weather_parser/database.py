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
            table_name TEXT,
            row_key TEXT,
            timestamp TEXT,
            temperature REAL,
            humidity REAL,
            pressure REAL,
            illuminance REAL,
            uv_index REAL,
            ir_value REAL,
            PRIMARY KEY (table_name, row_key)
        )
    """)
    conn.commit()
    conn.close()

def save_to_db(data):
    """Сохраняет данные в БД одной строкой"""
    if not data:
        print("Нет данных для сохранения")
        return

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO weather_data (table_name, row_key, timestamp, temperature, humidity, pressure, illuminance, uv_index, ir_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["table_name"],
        data["row_key"],
        data["timestamp"],
        data.get("temperature"),
        data.get("humidity"),
        data.get("pressure"),
        data.get("illuminance"),
        data.get("uv_index"),
        data.get("ir_value")
    ))
    conn.commit()
    conn.close()
    print(f"Данные сохранены в БД: {data['table_name']} | {data['row_key']}")

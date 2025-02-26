import sqlite3

DB_PATH = "weather_data.db"

def get_db_connection():
    """Создаёт подключение к базе данных SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Доступ к данным через dict-like объект
    return conn

def fetch_weather_data(src=None, start_date=None, end_date=None, limit=None, dir='ASC'):
    """Получает данные о погоде из БД с учётом фильтров."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM weather_data WHERE 1=1"
    params = []
    
    if src and len(src) > 0:
        query += " AND source in ("
        for i in range(len(src)):
            query += "?,"
            params.append(src[i])
        query = query[:-1] + ")"
    
    if start_date:
        query += " AND timestamp >= ?"
        params.append(start_date)
    
    if end_date:
        query += " AND timestamp <= ?"
        params.append(end_date)
    
    query += " ORDER BY timestamp"
    
    if dir == 'DESC':
        query += " DESC"
    else:
        query += " ASC"

    if limit and limit > 0:
        query += " LIMIT ?"
        params.append(limit)
    
    cursor.execute(query, params)
    data = cursor.fetchall()
    
    conn.close()
    return [dict(row) for row in data]

def count_weather_data(src=None, start_date=None, end_date=None):
    """Возвращает количество записей в таблице weather_data с учётом фильтров."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT COUNT(*) FROM weather_data WHERE 1=1"
    params = []

    if src:
        query += " AND source = ?"
        params.append(src)

    if start_date:
        query += " AND timestamp >= ?"
        params.append(start_date)

    if end_date:
        query += " AND timestamp <= ?"
        params.append(end_date)

    cursor.execute(query, params)
    count = cursor.fetchone()[0]  # Получаем количество записей

    conn.close()
    return count

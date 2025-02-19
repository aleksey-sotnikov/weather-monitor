from fastapi import APIRouter, Query
from .database import fetch_weather_data, count_weather_data

router = APIRouter()

@router.get("/api/v1/weather")
def get_weather_data(
    table_name: str = Query(None, description="Название таблицы (группы сенсоров), необязательно"),
    start_date: str = Query(None, description="Начальная дата в формате DD-MMM-YYYY HH:MM"),
    end_date: str = Query(None, description="Конечная дата в формате DD-MMM-YYYY HH:MM"),
):
    data = fetch_weather_data(table_name, start_date, end_date)
    return {"data": data}

@router.get("/api/v1/weather/count")
def get_weather_data_count(
    table_name: str = Query(None, description="Название таблицы (группы сенсоров), необязательно"),
    start_date: str = Query(None, description="Начальная дата в формате DD-MMM-YYYY HH:MM"),
    end_date: str = Query(None, description="Конечная дата в формате DD-MMM-YYYY HH:MM"),
):
    count = count_weather_data(table_name, start_date, end_date)
    return {"count": count}

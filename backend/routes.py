from fastapi import APIRouter, Query
from .database import fetch_weather_data, fetch_forecast_data

router = APIRouter()

@router.get("/api/v1/weather")
def get_weather_data(
    src: list[str] = Query(None, description="Источники данных, необязательно"),
    start_date: str = Query(None, description="Начальная дата в формате DD-MMM-YYYY HH:MM"),
    end_date: str = Query(None, description="Конечная дата в формате DD-MMM-YYYY HH:MM"),
    limit: int = Query(None, description="Лимит"),
    dir: str = Query(None, description="Наравление сортировки"),
):
    data = fetch_weather_data(src, start_date, end_date, limit, dir)
    return {"data": data}

@router.get("/api/v1/weather/forecast")
def get_weather_data(
    src: list[str] = Query(None, description="Источники данных, необязательно"),
    start_date: str = Query(None, description="Начальная дата в формате DD-MMM-YYYY HH:MM"),
    end_date: str = Query(None, description="Конечная дата в формате DD-MMM-YYYY HH:MM"),
    limit: int = Query(None, description="Лимит"),
    dir: str = Query(None, description="Наравление сортировки"),
):
    data = fetch_forecast_data(src, start_date, end_date, limit, dir)
    return {"data": data}

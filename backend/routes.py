import subprocess
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
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

@router.get("/api/v1/health")
async def health_check():
    try:
        # Проверяем статус сервиса парсера
        result = subprocess.run(
            ["systemctl", "is-active", "weather-parser.service"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        parser_status = result.stdout.strip()

        return JSONResponse(
            content={"parser_status": parser_status},
            status_code=200 if parser_status == "active" else 503
        )

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
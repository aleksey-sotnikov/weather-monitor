from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Weather API", description="API для доступа к данным о погоде")

# Подключаем маршруты
app.include_router(router)

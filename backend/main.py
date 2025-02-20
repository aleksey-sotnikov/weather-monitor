from fastapi import FastAPI
from .routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Weather API", description="API для доступа к данным о погоде")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешает запросы со всех источников (лучше указать конкретные)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешает все HTTP-методы
    allow_headers=["*"],  # Разрешает все заголовки
)

# Подключаем маршруты
app.include_router(router)

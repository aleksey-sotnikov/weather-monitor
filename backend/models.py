from pydantic import BaseModel

class WeatherData(BaseModel):
    table_name: str
    row_key: str
    temperature: float
    humidity: float
    pressure: float
    uv_index: float
    ir_value: float
    illuminance: float

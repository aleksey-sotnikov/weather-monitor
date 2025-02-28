# parser.py

import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from config import URL
from datetime import datetime
from zoneinfo import ZoneInfo

timezone = ZoneInfo("Europe/Moscow")


def fetch_weather_data():
    """Загружает и парсит данные с веб-страницы"""
    headers = {
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    }
    response = requests.get(URL, headers=headers)
    response.encoding = 'utf-8'
    if response.status_code != 200:
        print("Ошибка загрузки страницы", response)
        return None
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    data_list = []

    for table in soup.find_all("table"):
        caption = table.find("caption")
        if caption:
            full_caption = caption.text.strip()
            parts = full_caption.split(":", 1)
            table_name = parts[0].strip() if len(parts) > 1 else full_caption
            row_key = parts[1].strip() if len(parts) > 1 else datetime.now().isoformat()

            if table_name in "The LATEST MEASURED DATA":
                table_name = "pro_main"
            elif table_name in "Second Weather Board":
                table_name = "pro_second"
            elif table_name in "Old Weather Board":
                table_name = "pro_old"

            data = {
                "source": table_name,
                "timestamp": convert_to_timestamp(row_key),
                "temperature": None,
                "humidity": None,
                "pressure": None,
                "illuminance": None,
                "uv_index": None,
                "ir_value": None,
                "wind_speed": None,
                "wind_dir": None,
                "wind_gust": None,
            }
            
            for row in table.find_all("tr"):
                columns = row.find_all("td")
                if len(columns) == 2:
                    key = columns[0].text.strip()
                    value = extract_number(columns[1].text.strip())
                    if value is not None:
                        if "Outdoor" in key:
                            data["temperature"] = value
                        elif "Humidity" in key:
                            data["humidity"] = value
                        elif "Atm.Pressure" in key:
                            data["pressure"] = value
                        elif "Illuminance" in key:
                            data["illuminance"] = value
                        elif "UV index" in key:
                            data["uv_index"] = value
                        elif "value of IR" in key:
                            data["ir_value"] = value
            
            data_list.append(data)
    
    return data_list

def extract_number(value):
    """Извлекает только число из строки"""
    match = re.search(r"([-+]?\d*\.\d+|\d+)", value)
    return float(match.group()) if match else None

def convert_to_timestamp(date_str):
    """Преобразует строку формата 'DD-MMM-YYYY HH:MM' в timestamp (секунды)."""
    try:
        return int(datetime.strptime(date_str, "%d-%b-%Y %H:%M").replace(tzinfo=timezone).timestamp())
    except ValueError:
        return None  # Если формат неправильный
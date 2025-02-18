# parser.py

import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from config import URL

def fetch_weather_data_old():
    """Загружает и парсит данные с веб-страницы"""
    response = requests.get(URL)
    response.encoding = 'utf-8'
    if response.status_code != 200:
        print("Ошибка загрузки страницы")
        return None
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    data = []
    
    for table in soup.find_all("table"):
        caption = table.find("caption")
        if caption:
            full_caption = caption.text.strip()
            
            # Разделяем caption
            match = re.match(r"(.+?):\s*(.+)", full_caption)
            if match:
                table_name = match.group(1).strip()
                row_key = match.group(2).strip()
            else:
                table_name = full_caption
                row_key = datetime.now().isoformat()

            for row in table.find_all("tr"):
                columns = row.find_all("td")
                if len(columns) == 2:
                    key = columns[0].text.strip()
                    value = extract_number(columns[1].text.strip())
                    if value is not None:
                        data.append((table_name, row_key, key, value, datetime.now().isoformat()))
    
    return data

def fetch_weather_data():
    """Загружает и парсит данные с веб-страницы"""
    response = requests.get(URL)
    response.encoding = 'utf-8'
    if response.status_code != 200:
        print("Ошибка загрузки страницы")
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

            data = {
                "table_name": table_name,
                "row_key": row_key,
                "timestamp": datetime.now().isoformat(),
                "temperature": None,
                "humidity": None,
                "pressure": None,
                "illuminance": None,
                "uv_index": None,
                "ir_value": None
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
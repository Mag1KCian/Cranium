import requests
from datetime import datetime, timedelta

API_KEY = "66a8dd253e65a64f334d9ccf16bba460"
CITY = "chandigarh"

url = f"http://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}&units=metric"
data = requests.get(url).json()

tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
pre_cool = False

for item in data['list']:
    dt = item['dt_txt']
    temp = item['main']['temp']
    hour = int(dt.split(' ')[1].split(':')[0])

    if tomorrow in dt and 8 <= hour <= 11 and temp > 35:
        pre_cool = True
        print(f"Pre-cooling triggered at {dt}, temp: {temp}°C")

print("Pre-Cooling:", pre_cool)

import requests

API_KEY = "66a8dd253e65a64f334d9ccf16bba460"
CITY = "chandigarh"

url = f"http://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}&units=metric"

response = requests.get(url)
data = response.json()

for item in data['list'][:8]:
    print(item['dt_txt'], item['main']['temp'], "°C")

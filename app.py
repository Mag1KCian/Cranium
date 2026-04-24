from flask import Flask, jsonify
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/precool', methods=['GET'])
def precool():
    API_KEY = "66a8dd253e65a64f334d9ccf16bba460"
    CITY = "Chandigarh"
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
             return jsonify({"status": "API key activating. Try again in 20 mins."})

        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        pre_cool = False
        
        for item in data['list']:
            dt = item['dt_txt']
            if tomorrow in dt:
                temp = item['main']['temp']
                hour = int(dt.split(' ')[1].split(':')[0])
                if 8 <= hour <= 11 and temp > 35:
                    pre_cool = True
                
        return jsonify({"pre_cooling": pre_cool, "city": CITY, "tomorrow": tomorrow})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

const API_KEY = 'KASY6E726RTLHKHNARSYZTST6';

const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
    "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
    "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
    "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
    "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore",
    "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
    "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur"
];

const cityInput = document.getElementById('city-input');
const citySelectContainer = document.getElementById('city-select-container');

function filterCityList() {
    const filter = cityInput.value.toLowerCase();
    citySelectContainer.innerHTML = '';

    const filteredCities = indianCities.filter(city =>
        city.toLowerCase().includes(filter)
    );

    if (filteredCities.length === 0) {
        citySelectContainer.style.display = 'none';
        return;
    }

    filteredCities.forEach(city => {
        const div = document.createElement('div');
        div.textContent = city;
        div.addEventListener('mousedown', () => {
            cityInput.value = city;
            citySelectContainer.style.display = 'none';
        });
        citySelectContainer.appendChild(div);
    });

    citySelectContainer.style.display = 'block';
}

// Show dropdown on input focus (only if input not empty)
function showCityList() {
    if (cityInput.value.trim() !== '') {
        filterCityList();
    }
}

// Hide dropdown after short delay (to allow click)
function hideCityList() {
    setTimeout(() => {
        citySelectContainer.style.display = 'none';
    }, 150);
}

function getIcon(condition) {
    const c = condition.toLowerCase();
    if (c.includes("cloud")) return "☁️";
    if (c.includes("rain")) return "🌧️";
    if (c.includes("snow")) return "❄️";
    if (c.includes("clear")) return "☀️";
    if (c.includes("fog")) return "🌫️";
    if (c.includes("storm") || c.includes("thunder")) return "⛈️";
    return "🌈";
}

function getWeather() {
    const city = cityInput.value.trim();
    const output = document.getElementById('weather-output');

    if (!city) {
        output.innerHTML = `<div class="alert alert-danger text-center">Please enter or select a city name.</div>`;
        return;
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}, India?unitGroup=metric&include=current,days,hours,alerts&key=${API_KEY}&contentType=json`;

    output.innerHTML = `<p class="text-center">Loading weather data...</p>`;

    fetch(url)
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t); });
            return res.json();
        })
        .then(data => {
            const cc = data.currentConditions;
            const alerts = data.alerts || [];
            const days = data.days || [];
            const hours = data.days[0]?.hours || [];

            let html = '';

            html += `<h2>${data.resolvedAddress}</h2>`;

            html += `
          <div class="card mb-4 shadow-sm">
            <div class="card-header bg-primary text-white d-flex align-items-center">
              <span class="weather-icon">${getIcon(cc.conditions)}</span>
              <h5 class="mb-0">Current Conditions</h5>
            </div>
            <div class="card-body fs-5">
              <p><strong>Temperature:</strong> ${cc.temp} °C</p>
              <p><strong>Feels Like:</strong> ${cc.feelslike} °C</p>
              <p><strong>Humidity:</strong> ${cc.humidity}%</p>
              <p><strong>Wind Speed:</strong> ${cc.windspeed} km/h</p>
              <p><strong>Conditions:</strong> ${cc.conditions}</p>
            </div>
          </div>
        `;

            if (alerts.length > 0) {
                html += `
            <div class="card mb-4 shadow-sm">
              <div class="card-header bg-danger text-white">⚠️ Weather Alerts</div>
              <div class="card-body">
          `;
                alerts.forEach(alert => {
                    html += `<div class="alert-custom">${alert.event}<br><small>${alert.description}</small></div>`;
                });
                html += `</div></div>`;
            }

            if (hours.length > 0) {
                html += `
            <div class="card mb-4 shadow-sm">
              <div class="card-header bg-info text-white">🕒 Hourly Forecast (Next 12 Hours)</div>
              <div class="card-body p-0">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">Temp (°C)</th>
                      <th scope="col">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
          `;
                hours.slice(0, 12).forEach(hour => {
                    html += `
              <tr>
                <td>${hour.datetime}</td>
                <td>${hour.temp}</td>
                <td>${getIcon(hour.conditions)} ${hour.conditions}</td>
              </tr>
            `;
                });
                html += `</tbody></table></div></div>`;
            }

            if (days.length > 0) {
                html += `
            <div class="card mb-4 shadow-sm">
              <div class="card-header bg-secondary text-white">📅 7-Day Forecast</div>
              <div class="card-body p-0">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Min (°C)</th>
                      <th>Max (°C)</th>
                      <th>Conditions</th>
                      <th>Sunrise</th>
                      <th>Sunset</th>
                    </tr>
                  </thead>
                  <tbody>
          `;
                days.slice(0, 7).forEach(day => {
                    html += `
              <tr>
                <td>${day.datetime}</td>
                <td>${day.tempmin}</td>
                <td>${day.tempmax}</td>
                <td>${getIcon(day.conditions)} ${day.conditions}</td>
                <td>${day.sunrise}</td>
                <td>${day.sunset}</td>
              </tr>
            `;
                });
                html += `</tbody></table></div></div>`;
            }

            output.innerHTML = html;
        })
        .catch(err => {
            output.innerHTML = `<div class="alert alert-danger text-center">Error: ${err.message}</div>`;
        });
}
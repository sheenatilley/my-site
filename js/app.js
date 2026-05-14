// Weather Widget Script
const weatherWidget = document.getElementById('weatherWidget');

// Get user's geolocation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchWeather(latitude, longitude);
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                showWeatherError('Enable location to see your weather.');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                showWeatherError('Location information unavailable.');
            } else if (error.code === error.TIMEOUT) {
                showWeatherError('Location request timed out.');
            } else {
                showWeatherError('Unable to access location');
            }
        }
    );
} else {
    showWeatherError('Geolocation not supported');
}

// Fetch weather data from open-meteo API
async function fetchWeather(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`
        );
        const data = await response.json();
        displayWeather(data, latitude, longitude);
    } catch (error) {
        showWeatherError('Could not fetch weather');
    }
}

// Get emoji based on weather code
function getWeatherEmoji(weatherCode) {
    const code = Math.floor(weatherCode);
    // WMO Weather interpretation codes
    if (code === 0) return '☀️'; // Clear sky
    if (code === 1 || code === 2) return '🌤️'; // Mainly clear
    if (code === 3) return '☁️'; // Overcast
    if (code === 45 || code === 48) return '🌫️'; // Foggy
    if (code === 51 || code === 53 || code === 55) return '🌦️'; // Drizzle
    if (code === 61 || code === 63 || code === 65) return '🌧️'; // Rain
    if (code === 71 || code === 73 || code === 75 || code === 77) return '❄️'; // Snow
    if (code === 80 || code === 81 || code === 82) return '🌧️'; // Rain showers
    if (code === 85 || code === 86) return '❄️'; // Snow showers
    if (code === 95 || code === 96 || code === 99) return '⛈️'; // Thunderstorm
    return '🌈';
}

// Get weather description
function getWeatherDescription(weatherCode) {
    const code = Math.floor(weatherCode);
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2) return 'Mostly Clear';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle';
    if (code === 61 || code === 63 || code === 65) return 'Rainy';
    if (code === 71 || code === 73 || code === 75 || code === 77) return 'Snowy';
    if (code === 80 || code === 81 || code === 82) return 'Rain Showers';
    if (code === 85 || code === 86) return 'Snow Showers';
    if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
    return 'Unknown';
}

// Get city name from coordinates (reverse geocoding)
async function getCityName(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        return data.address.city || data.address.town || data.address.county || 'Your Location';
    } catch (error) {
        return 'Your Location';
    }
}

// Display weather data
async function displayWeather(data, latitude, longitude) {
    const temp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const humidity = data.current.relative_humidity_2m;
    const emoji = getWeatherEmoji(weatherCode);
    const description = getWeatherDescription(weatherCode);
    const cityName = await getCityName(latitude, longitude);

    weatherWidget.innerHTML = `
        <div class="weather-card">
            <div class="weather-emoji">${emoji}</div>
            <div class="weather-info">
                <div class="weather-temp">${temp}°F</div>
                <div class="weather-description">${description}</div>
                <div class="weather-location">${cityName}</div>
                <div class="weather-humidity">💧 ${humidity}%</div>
            </div>
        </div>
    `;
}

// Show error message
function showWeatherError(message) {
    weatherWidget.innerHTML = `
        <div class="weather-card weather-error">
            <div class="weather-emoji">🌐</div>
            <div class="weather-info">
                <div class="weather-description">${message}</div>
            </div>
        </div>
    `;
}

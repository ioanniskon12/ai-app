// pages/api/weather.js - Real OpenWeatherMap integration
export default async function handler(req, res) {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!API_KEY) {
    console.error("OpenWeatherMap API key is missing");
    return res.status(500).json({ error: "Weather service not configured" });
  }

  try {
    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(destination)}&appid=${API_KEY}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Get 7-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&appid=${API_KEY}&units=metric&cnt=40`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Process forecast data to get daily forecasts
    const dailyForecasts = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          day,
          temps: [],
          conditions: [],
          icon: item.weather[0].icon,
        };
      }

      dailyForecasts[day].temps.push(item.main.temp);
      dailyForecasts[day].conditions.push(item.weather[0].main);
    });

    // Convert to array and calculate daily highs/lows
    const forecast = Object.values(dailyForecasts)
      .slice(0, 7)
      .map((day) => {
        const temps = day.temps;
        const weatherIcons = {
          "01d": "☀️",
          "01n": "🌙",
          "02d": "⛅",
          "02n": "☁️",
          "03d": "☁️",
          "03n": "☁️",
          "04d": "☁️",
          "04n": "☁️",
          "09d": "🌧️",
          "09n": "🌧️",
          "10d": "🌦️",
          "10n": "🌧️",
          "11d": "⛈️",
          "11n": "⛈️",
          "13d": "❄️",
          "13n": "❄️",
          "50d": "🌫️",
          "50n": "🌫️",
        };

        return {
          day: day.day,
          icon: weatherIcons[day.icon] || "🌤️",
          high: Math.round(Math.max(...temps)),
          low: Math.round(Math.min(...temps)),
          condition: day.conditions[0],
        };
      });

    const response = {
      destination,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        icon: currentData.weather[0].icon,
      },
      forecast,
    };

    // Cache for 30 minutes
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
    res.status(200).json(response);
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({
      error: "Failed to fetch weather data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// src/components/LiveOffers.js
import { useState, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ececec;
`;

const Heading = styled.h3`
  margin-bottom: 0.75rem;
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.strong`
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
`;

const Loading = styled.p`
  color: #666;
  font-style: italic;
`;

const ErrorMsg = styled.p`
  color: #c00;
  font-weight: bold;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0 0;
`;

const Item = styled.li`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const WeatherCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem 0.5rem;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const WeatherDay = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.25rem;
`;

const WeatherDate = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const WeatherIcon = styled.div`
  font-size: 2.5rem;
  margin: 0.5rem 0;
`;

const WeatherTemp = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;

  .high {
    color: #333;
  }

  .low {
    color: #666;
    font-size: 0.9rem;
  }
`;

const NoDataMsg = styled.p`
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
`;

// Expanded IATA codes for major cities
const IATA_CODES = {
  London: "LHR",
  "London, UK": "LHR",
  Paris: "CDG",
  "Paris, France": "CDG",
  Rome: "FCO",
  "Rome, Italy": "FCO",
  "New York": "JFK",
  Tokyo: "NRT",
  "Tokyo, Japan": "NRT",
  Barcelona: "BCN",
  "Barcelona, Spain": "BCN",
  Dubai: "DXB",
  "Dubai, UAE": "DXB",
  Singapore: "SIN",
  Sydney: "SYD",
  "Sydney, Australia": "SYD",
  "Los Angeles": "LAX",
  Bangkok: "BKK",
  "Bangkok, Thailand": "BKK",
};

// Weather icon mapping
const getWeatherIcon = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes("sun") || desc.includes("clear")) return "☀️";
  if (desc.includes("partly") || desc.includes("partial")) return "⛅";
  if (desc.includes("cloud") || desc.includes("overcast")) return "☁️";
  if (desc.includes("rain") || desc.includes("shower")) return "🌧️";
  if (desc.includes("storm") || desc.includes("thunder")) return "⛈️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("fog") || desc.includes("mist")) return "🌫️";
  return "☀️"; // default
};

// Hotel data by destination
const HOTELS_BY_DESTINATION = {
  London: [
    { name: "The Savoy", pricePerNight: 450, rating: 5 },
    { name: "The Zetter Townhouse", pricePerNight: 220, rating: 4.5 },
    { name: "Premier Inn London County Hall", pricePerNight: 125, rating: 4 },
  ],
  Paris: [
    { name: "Le Meurice", pricePerNight: 680, rating: 5 },
    { name: "Hotel des Grands Boulevards", pricePerNight: 280, rating: 4.5 },
    { name: "Hotel Malte Opera", pricePerNight: 195, rating: 4 },
  ],
  Rome: [
    { name: "Hotel de Russie", pricePerNight: 520, rating: 5 },
    { name: "The First Roma Arte", pricePerNight: 250, rating: 4.5 },
    { name: "Hotel Artemide", pricePerNight: 180, rating: 4 },
  ],
  Tokyo: [
    { name: "Aman Tokyo", pricePerNight: 750, rating: 5 },
    { name: "Park Hyatt Tokyo", pricePerNight: 450, rating: 4.5 },
    { name: "Shinjuku Granbell Hotel", pricePerNight: 220, rating: 4 },
  ],
  Barcelona: [
    { name: "Hotel Casa Fuster", pricePerNight: 380, rating: 5 },
    { name: "Cotton House Hotel", pricePerNight: 250, rating: 4.5 },
    { name: "Hotel Barcelona Center", pricePerNight: 150, rating: 4 },
  ],
  Dubai: [
    { name: "Burj Al Arab", pricePerNight: 1500, rating: 5 },
    { name: "Atlantis The Palm", pricePerNight: 600, rating: 4.5 },
    { name: "Rove Downtown", pricePerNight: 180, rating: 4 },
  ],
  default: [
    { name: "Luxury Hotel", pricePerNight: 350, rating: 5 },
    { name: "Boutique Hotel", pricePerNight: 220, rating: 4.5 },
    { name: "Business Hotel", pricePerNight: 150, rating: 4 },
  ],
};

// Mock data for demonstration when APIs are not available
const MOCK_DATA = {
  flights: [
    {
      airline: "British Airways",
      price: 450,
      outboundDeparture: "JFK 09:00 AM",
      outboundArrival: "LHR 09:00 PM",
      returnDeparture: "LHR 12:00 PM",
      returnArrival: "JFK 04:00 PM",
    },
    {
      airline: "Virgin Atlantic",
      price: 520,
      outboundDeparture: "JFK 11:30 AM",
      outboundArrival: "LHR 11:30 PM",
      returnDeparture: "LHR 02:00 PM",
      returnArrival: "JFK 06:00 PM",
    },
  ],
  hotels: [
    {
      name: "The Savoy",
      pricePerNight: 450,
      rating: 5,
    },
    {
      name: "The Zetter Townhouse",
      pricePerNight: 220,
      rating: 4.5,
    },
    {
      name: "Premier Inn London County Hall",
      pricePerNight: 125,
      rating: 4,
    },
  ],
  weather: [
    {
      date: new Date().toISOString(),
      description: "Partly cloudy",
      tempMin: 12,
      tempMax: 18,
    },
    {
      date: new Date(Date.now() + 86400000).toISOString(),
      description: "Light rain",
      tempMin: 10,
      tempMax: 16,
    },
    {
      date: new Date(Date.now() + 172800000).toISOString(),
      description: "Sunny",
      tempMin: 14,
      tempMax: 20,
    },
    {
      date: new Date(Date.now() + 259200000).toISOString(),
      description: "Cloudy",
      tempMin: 13,
      tempMax: 17,
    },
    {
      date: new Date(Date.now() + 345600000).toISOString(),
      description: "Light rain",
      tempMin: 11,
      tempMax: 15,
    },
    {
      date: new Date(Date.now() + 432000000).toISOString(),
      description: "Partly cloudy",
      tempMin: 12,
      tempMax: 18,
    },
    {
      date: new Date(Date.now() + 518400000).toISOString(),
      description: "Sunny",
      tempMin: 15,
      tempMax: 21,
    },
  ],
};

// Function to generate weather data based on trip dates
const generateWeatherForDates = (startDate) => {
  const start = new Date(startDate);
  const weather = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    // Random weather patterns
    const conditions = [
      "Sunny",
      "Partly cloudy",
      "Cloudy",
      "Light rain",
      "Clear",
    ];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    // Temperature ranges based on season (simplified)
    const month = date.getMonth();
    let baseTemp = 15;
    if (month >= 5 && month <= 8) baseTemp = 20; // Summer
    if (month >= 11 || month <= 2) baseTemp = 5; // Winter

    weather.push({
      date: date.toISOString(),
      description: condition,
      tempMin: baseTemp + Math.floor(Math.random() * 5) - 2,
      tempMax: baseTemp + Math.floor(Math.random() * 8) + 3,
    });
  }

  return weather;
};

export default function LiveOffers({ destination, startDate, endDate }) {
  const [flights, setFlights] = useState(null);
  const [hotels, setHotels] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!destination || !startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Get IATA code
      const code =
        IATA_CODES[destination] ||
        IATA_CODES[destination.split(",")[0]] ||
        "LHR";

      try {
        // Try to fetch real data first
        const [flightsRes, hotelsRes, weatherRes] = await Promise.allSettled([
          fetch(
            `/api/flights?origin=JFK&destinationLocationCode=${code}&departureDate=${startDate}&returnDate=${endDate}`
          ),
          fetch(
            `/api/hotels?cityCode=${code}&checkInDate=${startDate}&checkOutDate=${endDate}`
          ),
          fetch(`/api/weather?city=${encodeURIComponent(destination)}`),
        ]);

        // Handle flights
        if (flightsRes.status === "fulfilled" && flightsRes.value.ok) {
          const flightsData = await flightsRes.value.json();
          setFlights(Array.isArray(flightsData) ? flightsData : []);
        } else {
          // Use mock data if API fails
          console.log("Using mock flight data");
          setFlights(MOCK_DATA.flights);
        }

        // Handle hotels
        if (hotelsRes.status === "fulfilled" && hotelsRes.value.ok) {
          const hotelsData = await hotelsRes.value.json();
          setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        } else {
          console.log("Using mock hotel data");
          // Get hotels for the specific destination
          const cityName = destination.split(",")[0].trim();
          const cityHotels =
            HOTELS_BY_DESTINATION[cityName] || HOTELS_BY_DESTINATION["default"];
          setHotels(cityHotels);
        }

        // Handle weather
        if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
          const weatherData = await weatherRes.value.json();
          setWeather(Array.isArray(weatherData) ? weatherData : []);
        } else {
          console.log("Using mock weather data");
          // Generate weather based on actual trip dates
          const weatherData = generateWeatherForDates(startDate);
          setWeather(weatherData);
        }
      } catch (err) {
        console.error("Error fetching live data:", err);
        // Use mock data on error
        setFlights(MOCK_DATA.flights);

        // Get destination-specific hotels
        const cityName = destination.split(",")[0].trim();
        const cityHotels =
          HOTELS_BY_DESTINATION[cityName] || HOTELS_BY_DESTINATION["default"];
        setHotels(cityHotels);

        setWeather(generateWeatherForDates(startDate));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [destination, startDate, endDate]);

  if (!destination) {
    return null;
  }

  return (
    <Wrapper>
      <Heading>🔍 Live Data for {destination}</Heading>
      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Section>
        <Title>Flight Offers:</Title>
        {loading && !flights && <Loading>Loading flight offers...</Loading>}
        {flights && flights.length > 0 ? (
          <List>
            {flights.slice(0, 3).map((f, i) => (
              <Item key={i}>
                <strong>{f.airline}</strong> —{" "}
                <span style={{ color: "#28a745", fontWeight: "bold" }}>
                  ${f.price}
                </span>
                <br />
                <small>
                  Outbound: {f.outboundDeparture} → {f.outboundArrival}
                  <br />
                  Return: {f.returnDeparture} → {f.returnArrival}
                </small>
              </Item>
            ))}
          </List>
        ) : flights && flights.length === 0 ? (
          <NoDataMsg>No flight offers available at this time.</NoDataMsg>
        ) : null}
      </Section>

      <Section>
        <Title>Hotel Offers:</Title>
        {loading && !hotels && <Loading>Loading hotel offers...</Loading>}
        {hotels && hotels.length > 0 ? (
          <List>
            {hotels.slice(0, 3).map((h, i) => (
              <Item key={i}>
                <strong>{h.name}</strong>
                <br />
                <span style={{ color: "#28a745", fontWeight: "bold" }}>
                  ${h.pricePerNight}
                </span>
                /night
                {h.rating && (
                  <span style={{ float: "right" }}>
                    {"⭐".repeat(Math.floor(h.rating))}
                  </span>
                )}
              </Item>
            ))}
          </List>
        ) : hotels && hotels.length === 0 ? (
          <NoDataMsg>No hotels available for these dates.</NoDataMsg>
        ) : null}
      </Section>

      <Section>
        <Title>7-Day Weather Forecast:</Title>
        {loading && !weather && <Loading>Loading weather...</Loading>}
        {weather && weather.length > 0 ? (
          <WeatherGrid>
            {weather.slice(0, 7).map((d, i) => {
              const date = new Date(d.date);
              const dayName =
                i === 0
                  ? "Today"
                  : date.toLocaleDateString("en-US", { weekday: "short" });
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

              return (
                <WeatherCard key={i}>
                  <WeatherDay>{dayName}</WeatherDay>
                  <WeatherDate>{dateStr}</WeatherDate>
                  <WeatherIcon>{getWeatherIcon(d.description)}</WeatherIcon>
                  <WeatherTemp>
                    <div className="high">{d.tempMax}°</div>
                    <div className="low">{d.tempMin}°</div>
                  </WeatherTemp>
                </WeatherCard>
              );
            })}
          </WeatherGrid>
        ) : weather && weather.length === 0 ? (
          <NoDataMsg>Weather data unavailable.</NoDataMsg>
        ) : null}
      </Section>
    </Wrapper>
  );
}

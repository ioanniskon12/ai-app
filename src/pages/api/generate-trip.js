// pages/api/generate-trip.js - Enhanced Multi-Phase Trip Generator
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const PHASES = {
  BASIC: 1, // Basic booking
  ENHANCED: 2, // Detailed information
  ADVANCED: 3, // Full features
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { searchQuery, passengers, phase = PHASES.BASIC } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log(`🔥 Generating trip for phase ${phase}:`, searchQuery);

    // Generate trip data based on phase
    const tripData = await generateTripByPhase(searchQuery, passengers, phase);

    return res.status(200).json(tripData);
  } catch (error) {
    console.error("❌ Error generating trip:", error);
    return res.status(500).json({
      error: "Failed to generate trip",
      message: error.message,
    });
  }
}

async function generateTripByPhase(searchQuery, passengers, phase) {
  // Base trip data for all phases
  const baseTripData = {
    Destination: extractDestination(searchQuery),
    Month: extractMonth(searchQuery),
    Reason: extractReason(searchQuery),
    Duration: extractDuration(searchQuery),
    StartDate: generateStartDate(),
    EndDate: generateEndDate(),
    passengers: passengers || { adults: 2, children: 0, infants: 0 },
    basePrice: generateBasePrice(passengers),
  };

  // Phase 1: Basic Information
  if (phase === PHASES.BASIC) {
    return {
      ...baseTripData,
      Activities: generateBasicActivities(baseTripData.Destination, passengers),
      AvailableActivities: generateAvailableActivities(
        baseTripData.Destination,
        passengers
      ),
      Hotel: generateBasicHotel(baseTripData.Destination),
      Flight: generateBasicFlight(baseTripData.Destination),
    };
  }

  // Phase 2: Enhanced Details
  if (phase === PHASES.ENHANCED) {
    return {
      ...baseTripData,
      Activities: generateBasicActivities(baseTripData.Destination, passengers),
      AvailableActivities: generateDetailedActivities(
        baseTripData.Destination,
        passengers
      ),
      Hotel: generateDetailedHotel(baseTripData.Destination, passengers),
      Flight: generateDetailedFlight(baseTripData.Destination),
      FlightOptions: generateFlightOptions(baseTripData.Destination),
      HotelOptions: generateHotelOptions(baseTripData.Destination),
    };
  }

  // Phase 3: Advanced Features
  if (phase === PHASES.ADVANCED) {
    return {
      ...baseTripData,
      Activities: generateBasicActivities(baseTripData.Destination, passengers),
      AvailableActivities: generateDetailedActivities(
        baseTripData.Destination,
        passengers
      ),
      Hotel: generateDetailedHotel(baseTripData.Destination, passengers),
      Flight: generateDetailedFlight(baseTripData.Destination),
      Weather: generateDetailedWeather(
        baseTripData.StartDate,
        baseTripData.EndDate
      ),
      ClothingAdvice: generateClothingAdvice(
        baseTripData.Month,
        baseTripData.Destination
      ),
      LocalEvents: generateLocalEvents(
        baseTripData.Destination,
        baseTripData.StartDate
      ),
      TravelDocuments: generateTravelDocuments(baseTripData.Destination),
      LocalCurrency: generateCurrencyInfo(baseTripData.Destination),
      EmergencyContacts: generateEmergencyContacts(baseTripData.Destination),
      CulturalTips: generateCulturalTips(baseTripData.Destination),
    };
  }

  return baseTripData;
}

// Helper functions for extracting information
function extractDestination(query) {
  // Simple extraction - in real app, use NLP or predefined mapping
  const destinations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "London, UK",
    "Rome, Italy",
    "Barcelona, Spain",
    "Bangkok, Thailand",
    "Sydney, Australia",
    "Dubai, UAE",
    "Amsterdam, Netherlands",
    "Singapore",
    "Mumbai, India",
  ];

  const lowerQuery = query.toLowerCase();
  for (const dest of destinations) {
    if (lowerQuery.includes(dest.split(",")[0].toLowerCase())) {
      return dest;
    }
  }

  return "Paris, France"; // Default
}

function extractMonth(query) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const lowerQuery = query.toLowerCase();
  for (const month of months) {
    if (lowerQuery.includes(month.toLowerCase())) {
      return month;
    }
  }

  // Default to next month
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return months[nextMonth.getMonth()];
}

function extractReason(query) {
  const reasons = {
    honeymoon: "Honeymoon",
    anniversary: "Anniversary",
    family: "Family vacation",
    business: "Business trip",
    adventure: "Adventure travel",
    relaxation: "Relaxation",
    culture: "Cultural exploration",
    food: "Culinary experience",
  };

  const lowerQuery = query.toLowerCase();
  for (const [key, value] of Object.entries(reasons)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }

  return "Vacation";
}

function extractDuration(query) {
  const durations = ["3 days", "5 days", "1 week", "10 days", "2 weeks"];
  const lowerQuery = query.toLowerCase();

  for (const duration of durations) {
    if (lowerQuery.includes(duration)) {
      return duration;
    }
  }

  return "1 week";
}

function generateStartDate() {
  const start = new Date();
  start.setDate(start.getDate() + 30); // 30 days from now
  return start.toISOString();
}

function generateEndDate() {
  const end = new Date();
  end.setDate(end.getDate() + 37); // 7 days after start
  return end.toISOString();
}

function generateBasePrice(passengers) {
  const basePerPerson = 1200;
  const adults = passengers?.adults || 2;
  const children = passengers?.children || 0;
  const infants = passengers?.infants || 0;

  return (
    adults * basePerPerson + children * basePerPerson * 0.7 + infants * 200
  );
}

// Basic generators (Phase 1)
function generateBasicActivities(destination, passengers) {
  const activities = [
    "City Walking Tour",
    "Museum Visit",
    "Local Restaurant Experience",
    "Shopping District Exploration",
  ];

  if (passengers?.children > 0) {
    activities.push("Family-Friendly Park Visit", "Children's Museum");
  }

  return activities;
}

function generateAvailableActivities(destination, passengers) {
  const city = destination.split(",")[0];
  const hasChildren = passengers?.children > 0 || passengers?.infants > 0;

  const activities = [
    {
      name: `${city} Walking Tour`,
      description: `Explore the historic streets and landmarks of ${city}`,
      price: { total: 45 },
      duration: "3 hours",
      category: "sightseeing",
      childFriendly: true,
      difficultyLevel: "easy",
    },
    {
      name: "Local Cooking Class",
      description: "Learn to cook authentic local cuisine",
      price: { total: 85 },
      duration: "4 hours",
      category: "cultural",
      childFriendly: hasChildren,
      difficultyLevel: "easy",
    },
    {
      name: "Museum Tour",
      description: `Visit the most famous museums in ${city}`,
      price: { total: 35 },
      duration: "2 hours",
      category: "cultural",
      childFriendly: true,
      difficultyLevel: "easy",
    },
    {
      name: "Adventure Hiking",
      description: "Scenic hiking trail with beautiful views",
      price: { total: 65 },
      duration: "6 hours",
      category: "adventure",
      childFriendly: false,
      difficultyLevel: "moderate",
    },
    {
      name: "Boat Tour",
      description: "Relaxing boat tour of the local waterways",
      price: { total: 55 },
      duration: "2.5 hours",
      category: "sightseeing",
      childFriendly: true,
      difficultyLevel: "easy",
    },
  ];

  if (hasChildren) {
    activities.push(
      {
        name: "Family Theme Park",
        description: "Fun-filled day at the local theme park",
        price: { total: 95 },
        duration: "Full day",
        category: "family",
        childFriendly: true,
        difficultyLevel: "easy",
      },
      {
        name: "Interactive Science Museum",
        description: "Hands-on learning experience for kids",
        price: { total: 25 },
        duration: "3 hours",
        category: "educational",
        childFriendly: true,
        difficultyLevel: "easy",
      }
    );
  }

  return activities;
}

function generateBasicHotel(destination) {
  const city = destination.split(",")[0];
  return {
    name: `${city} Grand Hotel`,
    rating: 4,
    pricePerNight: "$180",
    amenities: ["Free WiFi", "Breakfast", "Pool", "Gym"],
    familyFriendly: true,
  };
}

function generateBasicFlight(destination) {
  const city = destination.split(",")[0];
  return {
    outbound: {
      airline: "International Airways",
      flightNumber: "IA" + Math.floor(Math.random() * 1000),
      departure: "JFK",
      arrival: getAirportCode(city),
      departureTime: "08:30",
      arrivalTime: "14:45",
      duration: "8h 15m",
    },
    return: {
      airline: "International Airways",
      flightNumber: "IA" + Math.floor(Math.random() * 1000),
      departure: getAirportCode(city),
      arrival: "JFK",
      departureTime: "16:20",
      arrivalTime: "19:35",
      duration: "8h 15m",
    },
  };
}

// Enhanced generators (Phase 2)
function generateDetailedActivities(destination, passengers) {
  const basic = generateAvailableActivities(destination, passengers);

  return basic.map((activity) => ({
    ...activity,
    location: {
      name: activity.name.includes("Museum")
        ? "City Center"
        : "Historic District",
      address: `123 Main Street, ${destination}`,
      coordinates: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
      },
    },
    provider: {
      name: "Local Tours Company",
      contact: "+1-555-0123",
      website: "www.localtours.com",
    },
    reviews: {
      rating: 4.2 + Math.random() * 0.8,
      count: Math.floor(Math.random() * 500) + 100,
    },
    included: ["Professional guide", "Entry fees", "Transportation"],
    excluded: ["Meals", "Personal expenses", "Tips"],
    requirements:
      activity.difficultyLevel === "moderate"
        ? ["Good physical condition"]
        : [],
    cancellationPolicy: "Free cancellation up to 24 hours before",
  }));
}

function generateDetailedHotel(destination, passengers) {
  const basic = generateBasicHotel(destination);
  const city = destination.split(",")[0];

  return {
    ...basic,
    address: {
      street: "123 Hotel Street",
      city: city,
      country: destination.split(",")[1]?.trim() || "Country",
      postalCode: "12345",
      coordinates: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.006 + (Math.random() - 0.5) * 0.01,
      },
    },
    checkIn: new Date(generateStartDate()).toISOString(),
    checkOut: new Date(generateEndDate()).toISOString(),
    roomType: "Deluxe Double Room",
    guests: {
      adults: passengers?.adults || 2,
      children: passengers?.children || 0,
      rooms: Math.ceil((passengers?.adults || 2) / 2),
    },
    price: {
      perNight: 180,
      total: 180 * 7, // 7 nights
      currency: "USD",
      taxes: 25,
      fees: 15,
    },
    cancellationPolicy: "Free cancellation up to 48 hours before check-in",
    description: `Luxurious accommodation in the heart of ${city} with modern amenities and excellent service.`,
    images: [
      `https://source.unsplash.com/600x400/?hotel,${city},room`,
      `https://source.unsplash.com/600x400/?hotel,${city},lobby`,
      `https://source.unsplash.com/600x400/?hotel,${city},pool`,
    ],
  };
}

function generateDetailedFlight(destination) {
  const basic = generateBasicFlight(destination);
  const city = destination.split(",")[0];

  return {
    outbound: {
      ...basic.outbound,
      class: "economy",
      price: 650,
      baggage: {
        carry: "1 carry-on bag (10kg)",
        checked: "1 checked bag (23kg)",
      },
      seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
    },
    return: {
      ...basic.return,
      class: "economy",
      price: 650,
      baggage: {
        carry: "1 carry-on bag (10kg)",
        checked: "1 checked bag (23kg)",
      },
      seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
    },
  };
}

// Advanced generators (Phase 3)
function generateDetailedWeather(startDate, endDate) {
  const start = new Date(startDate);
  const weather = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    const conditions = [
      "Sunny",
      "Partly Cloudy",
      "Cloudy",
      "Light Rain",
      "Clear",
    ];
    const icons = ["☀️", "⛅", "☁️", "🌧️", "🌤️"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    weather.push({
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toISOString(),
      condition: condition,
      temperature: {
        high: Math.floor(Math.random() * 15) + 20, // 20-35°C
        low: Math.floor(Math.random() * 10) + 15, // 15-25°C
        unit: "celsius",
      },
      humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      precipitation: {
        probability: condition.includes("Rain")
          ? 80
          : Math.floor(Math.random() * 30),
        amount: condition.includes("Rain")
          ? Math.floor(Math.random() * 10) + 5
          : 0,
      },
      icon: icons[conditions.indexOf(condition)],
      description: `${condition} with pleasant temperatures`,
      clothingAdvice: condition.includes("Rain")
        ? ["Waterproof jacket", "Umbrella", "Comfortable walking shoes"]
        : ["Light clothing", "Sunglasses", "Comfortable shoes"],
    });
  }

  return weather;
}

function generateClothingAdvice(month, destination) {
  const advice = [
    "Comfortable walking shoes",
    "Weather-appropriate clothing",
    "Light jacket for evenings",
  ];

  if (month && ["December", "January", "February"].includes(month)) {
    advice.push("Warm winter coat", "Gloves and hat", "Thermal layers");
  } else if (month && ["June", "July", "August"].includes(month)) {
    advice.push("Light, breathable fabrics", "Sun hat", "Sunscreen");
  }

  if (destination.includes("Dubai") || destination.includes("Thailand")) {
    advice.push("Light, modest clothing", "Sun protection");
  }

  return advice;
}

function generateLocalEvents(destination, startDate) {
  const city = destination.split(",")[0];
  const events = [
    {
      name: `${city} Food Festival`,
      date: new Date(startDate).toISOString(),
      description: "Sample local cuisine from the best restaurants",
      location: "City Center",
      price: "Free",
    },
    {
      name: "Art Gallery Opening",
      date: new Date(
        new Date(startDate).getTime() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      description: "Contemporary art exhibition opening",
      location: "Modern Art Museum",
      price: "$15",
    },
  ];

  return events;
}

function generateTravelDocuments(destination) {
  const country = destination.split(",")[1]?.trim() || "Country";

  return {
    passportRequired: true,
    visaRequired: !["UK", "France", "Germany", "Italy", "Spain"].includes(
      country
    ),
    vaccinations:
      country.includes("Thailand") || country.includes("India")
        ? ["Hepatitis A", "Typhoid"]
        : [],
    currency: getCurrencyInfo(destination),
    timeZone: getTimeZone(destination),
  };
}

function generateCurrencyInfo(destination) {
  const currencies = {
    France: { code: "EUR", symbol: "€", name: "Euro" },
    UK: { code: "GBP", symbol: "£", name: "British Pound" },
    Japan: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    USA: { code: "USD", symbol: "$", name: "US Dollar" },
    Thailand: { code: "THB", symbol: "฿", name: "Thai Baht" },
  };

  const country = destination.split(",")[1]?.trim() || "USA";
  return currencies[country] || currencies["USA"];
}

function generateEmergencyContacts(destination) {
  const city = destination.split(",")[0];

  return {
    police: "112",
    ambulance: "112",
    fire: "112",
    embassy: "+1-555-EMBASSY",
    localHospital: `${city} General Hospital: +1-555-HOSPITAL`,
    tourismHotline: "+1-555-TOURISM",
  };
}

function generateCulturalTips(destination) {
  const tips = [
    "Learn basic local greetings",
    "Respect local customs and traditions",
    "Tip according to local standards",
  ];

  if (destination.includes("Japan")) {
    tips.push(
      "Bow when greeting",
      "Remove shoes when entering homes",
      "Don't tip at restaurants"
    );
  } else if (destination.includes("Thailand")) {
    tips.push(
      "Dress modestly at temples",
      "Don't touch people's heads",
      "Show respect to Buddha images"
    );
  } else if (destination.includes("France")) {
    tips.push(
      "Greet with 'Bonjour'",
      "Dress stylishly",
      "Take time with meals"
    );
  }

  return tips;
}

// Utility functions
function getAirportCode(city) {
  const codes = {
    Paris: "CDG",
    Tokyo: "NRT",
    London: "LHR",
    Rome: "FCO",
    Barcelona: "BCN",
    Bangkok: "BKK",
    Sydney: "SYD",
    Dubai: "DXB",
    Amsterdam: "AMS",
    Singapore: "SIN",
    Mumbai: "BOM",
  };

  return codes[city] || "XXX";
}

function getTimeZone(destination) {
  const zones = {
    France: "CET",
    UK: "GMT",
    Japan: "JST",
    USA: "EST",
    Thailand: "ICT",
    Australia: "AEST",
    UAE: "GST",
  };

  const country = destination.split(",")[1]?.trim() || "USA";
  return zones[country] || "UTC";
}

// pages/api/generate.js - Updated Multi-Phase Trip Generation
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, passengers, phase = 1 } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt" });
  }

  // Check if user is traveling with children
  const hasChildren =
    passengers && (passengers.children > 0 || passengers.infants > 0);
  const totalChildren = hasChildren
    ? passengers.children + passengers.infants
    : 0;

  // Create phase-specific system messages
  const getSystemMessage = (phaseLevel) => {
    const baseMessage = `
You are a smart travel-planner AI. Given the user's request, generate *exactly* ONE perfect trip package in *valid JSON* only, formatted as an array with a single object.

${hasChildren ? `IMPORTANT: The user is traveling with ${totalChildren} child(ren). Include family-friendly activities, child-safe accommodations, and baby/kid-friendly options throughout.` : ""}

Focus on creating the BEST POSSIBLE match for their request. Consider:
- Their preferred destination or let the destination match their described experience
- The ideal time to visit based on weather and crowds
- A balance of popular attractions and hidden gems
- Comfortable but not excessive pricing
- Quality accommodations with good reviews
- Current weather patterns and seasonal considerations
${hasChildren ? "- Child-friendly activities and baby amenities" : ""}
`;

    if (phaseLevel === 1) {
      // Phase 1: Basic Booking
      return (
        baseMessage +
        `
Return ONLY this JSON structure (Phase 1 - Basic):
[
  {
    "Destination": "City, Country",
    "Month": "Best month to visit",
    "Reason": "Detailed explanation of why this destination and time perfectly matches their request${hasChildren ? " and is great for families with children" : ""}",
    "Duration": "X days",
    "Flight": {
      "Outbound": "DEP→ARR, 9:00 AM - 10:30 PM",
      "Return": "ARR→DEP, 12:00 PM - 4:00 PM"
    },
    "Hotel": "Specific Hotel Name${hasChildren ? " (Family-Friendly)" : ""}",
    "HotelImage": "https://source.unsplash.com/600x400/?hotel,destination${hasChildren ? ",family" : ""}",
    "DestinationImage": "https://source.unsplash.com/600x400/?destination",
    "Activities": [
      "Must-do activity 1${hasChildren ? " (child-friendly)" : ""}",
      "Must-do activity 2${hasChildren ? " (suitable for kids)" : ""}",
      "Must-do activity 3${hasChildren ? " (family activity)" : ""}"
    ],
    "AvailableActivities": [
      ${
        hasChildren
          ? `{ "name": "Children's Activity", "price": 35, "childFriendly": true },
         { "name": "Baby Care Experience", "price": 25, "childFriendly": true },
         { "name": "Family Adventure", "price": 80, "childFriendly": true },`
          : ""
      }
      { "name": "Specific Activity Name", "price": 50${hasChildren ? ', "childFriendly": false' : ""} },
      { "name": "Another Activity", "price": 75${hasChildren ? ', "childFriendly": true' : ""} },
      { "name": "Cultural Experience", "price": 60${hasChildren ? ', "childFriendly": true' : ""} }
    ],
    "Weather": {
      "general": "Brief weather description for the month",
      "forecast": [
        { "day": "Day 1", "temp": "22°C", "condition": "Sunny", "icon": "☀️" },
        { "day": "Day 2", "temp": "20°C", "condition": "Partly Cloudy", "icon": "⛅" },
        { "day": "Day 3", "temp": "24°C", "condition": "Clear", "icon": "☀️" }
      ],
      "clothingAdvice": "Pack light layers and comfortable walking shoes"
    },
    "Price": "$1800"${hasChildren ? ',\n    "ChildFriendlyFeatures": [\n      "Kid-friendly hotel amenities",\n      "Child meal options",\n      "Family activity recommendations",\n      "Baby equipment rental available"\n    ]' : ""}
  }
]`
      );
    } else if (phaseLevel === 2) {
      // Phase 2: Enhanced Details
      return (
        baseMessage +
        `
Return ONLY this JSON structure (Phase 2 - Enhanced Details):
[
  {
    "Destination": "City, Country",
    "Month": "Best month to visit",
    "Reason": "Detailed explanation of why this destination and time perfectly matches their request${hasChildren ? " and is great for families with children" : ""}",
    "Duration": "X days",
    "StartDate": "2025-07-15",
    "EndDate": "2025-07-20",
    "Flight": {
      "Outbound": {
        "route": "DEP→ARR",
        "departure": "9:00 AM",
        "arrival": "10:30 PM",
        "duration": "13h 30m",
        "airline": "Major Airline",
        "flightNumber": "XX123",
        "aircraft": "Boeing 777",
        "seatOptions": [
          { "class": "Economy", "price": 850, "features": ["Standard seat", "Meal included"] },
          { "class": "Premium Economy", "price": 1200, "features": ["Extra legroom", "Priority boarding"] },
          { "class": "Business", "price": 2500, "features": ["Lie-flat seat", "Lounge access"] }
        ]
      },
      "Return": {
        "route": "ARR→DEP",
        "departure": "12:00 PM",
        "arrival": "4:00 PM",
        "duration": "12h 0m",
        "airline": "Major Airline",
        "flightNumber": "XX456",
        "aircraft": "Boeing 777",
        "seatOptions": [
          { "class": "Economy", "price": 850, "features": ["Standard seat", "Meal included"] },
          { "class": "Premium Economy", "price": 1200, "features": ["Extra legroom", "Priority boarding"] },
          { "class": "Business", "price": 2500, "features": ["Lie-flat seat", "Lounge access"] }
        ]
      }
    },
    "Hotel": {
      "name": "Specific Hotel Name${hasChildren ? " (Family-Friendly)" : ""}",
      "rating": 4.5,
      "address": "123 Hotel Street, City Center",
      "description": "Luxury hotel with modern amenities and excellent service",
      "amenities": [
        "Free Wi-Fi",
        "Fitness Center",
        "Pool",
        "Restaurant",
        "Room Service"${hasChildren ? ',\n        "Kids Club",\n        "Baby Cots Available",\n        "Children\'s Pool"' : ""}
      ],
      "roomTypes": [
        {
          "type": "Standard Room",
          "price": 180,
          "features": ["King bed", "City view", "32m²"]
        },
        {
          "type": "Deluxe Room${hasChildren ? " (Family)" : ""}",
          "price": 250,
          "features": ["King bed${hasChildren ? " + Sofa bed" : ""}", "Balcony", "45m²"${hasChildren ? ', "Child-safe balcony"' : ""}]
        },
        {
          "type": "Suite",
          "price": 400,
          "features": ["Separate living area", "Premium view", "65m²"${hasChildren ? ', "Extra space for family"' : ""}]
        }
      ],
      "images": [
        "https://source.unsplash.com/600x400/?hotel,lobby",
        "https://source.unsplash.com/600x400/?hotel,room",
        "https://source.unsplash.com/600x400/?hotel,pool"
      ]
    },
    "DestinationImage": "https://source.unsplash.com/600x400/?destination",
    "Activities": [
      {
        "name": "Must-do activity 1${hasChildren ? " (child-friendly)" : ""}",
        "description": "Detailed description of the activity",
        "duration": "3 hours",
        "location": "Specific location in city",
        "price": 45,
        "provider": "Tour Company Name",
        "rating": 4.7,
        "reviews": 1250${hasChildren ? ',\n        "childFriendly": true,\n        "ageRange": "All ages"' : ""}
      },
      {
        "name": "Must-do activity 2${hasChildren ? " (suitable for kids)" : ""}",
        "description": "Another engaging activity description",
        "duration": "2 hours",
        "location": "Another location",
        "price": 35,
        "provider": "Local Guide Service",
        "rating": 4.5,
        "reviews": 890${hasChildren ? ',\n        "childFriendly": true,\n        "ageRange": "5+"' : ""}
      }
    ],
    "AvailableActivities": [
      ${
        hasChildren
          ? `{ "name": "Children's Activity", "price": 35, "childFriendly": true, "description": "Fun activity for kids", "duration": "2 hours" },
         { "name": "Family Adventure", "price": 80, "childFriendly": true, "description": "Adventure suitable for families", "duration": "4 hours" },`
          : ""
      }
      { "name": "Specific Activity Name", "price": 50, "description": "Activity description", "duration": "3 hours"${hasChildren ? ', "childFriendly": false' : ""} },
      { "name": "Cultural Experience", "price": 60, "description": "Cultural activity", "duration": "2.5 hours"${hasChildren ? ', "childFriendly": true' : ""} }
    ],
    "Weather": {
      "general": "Detailed weather description for the month with seasonal patterns",
      "forecast": [
        { "day": "Day 1", "date": "2025-07-15", "temp": "22°C", "condition": "Sunny", "icon": "☀️", "humidity": "60%", "wind": "10 km/h" },
        { "day": "Day 2", "date": "2025-07-16", "temp": "20°C", "condition": "Partly Cloudy", "icon": "⛅", "humidity": "65%", "wind": "12 km/h" },
        { "day": "Day 3", "date": "2025-07-17", "temp": "24°C", "condition": "Clear", "icon": "☀️", "humidity": "55%", "wind": "8 km/h" },
        { "day": "Day 4", "date": "2025-07-18", "temp": "23°C", "condition": "Sunny", "icon": "☀️", "humidity": "58%", "wind": "9 km/h" },
        { "day": "Day 5", "date": "2025-07-19", "temp": "21°C", "condition": "Light Rain", "icon": "🌦️", "humidity": "75%", "wind": "15 km/h" }
      ],
      "clothingAdvice": "Pack light layers, comfortable walking shoes, and a light rain jacket for occasional showers"
    },
    "PriceBreakdown": {
      "flights": 1700,
      "hotel": 900,
      "activities": 200,
      "total": 2800
    },
    "Price": "$2800"${hasChildren ? ',\n    "ChildFriendlyFeatures": [\n      "Kid-friendly hotel amenities",\n      "Child meal options available",\n      "Family activity recommendations",\n      "Baby equipment rental",\n      "Child-safe transportation",\n      "Pediatric services nearby"\n    ]' : ""}
  }
]`
      );
    } else if (phaseLevel === 3) {
      // Phase 3: Advanced Features
      return (
        baseMessage +
        `
Return ONLY this JSON structure (Phase 3 - Advanced Features):
[
  {
    "Destination": "City, Country",
    "Month": "Best month to visit",
    "Reason": "Detailed explanation of why this destination and time perfectly matches their request${hasChildren ? " and is great for families with children" : ""}",
    "Duration": "X days",
    "StartDate": "2025-07-15",
    "EndDate": "2025-07-20",
    "Flight": {
      "Outbound": {
        "route": "DEP→ARR",
        "departure": "9:00 AM",
        "arrival": "10:30 PM",
        "duration": "13h 30m",
        "airline": "Major Airline",
        "flightNumber": "XX123",
        "aircraft": "Boeing 777",
        "seatOptions": [
          { "class": "Economy", "price": 850, "features": ["Standard seat", "Meal included"] },
          { "class": "Premium Economy", "price": 1200, "features": ["Extra legroom", "Priority boarding"] },
          { "class": "Business", "price": 2500, "features": ["Lie-flat seat", "Lounge access"] }
        ]
      },
      "Return": {
        "route": "ARR→DEP",
        "departure": "12:00 PM",
        "arrival": "4:00 PM",
        "duration": "12h 0m",
        "airline": "Major Airline",
        "flightNumber": "XX456",
        "aircraft": "Boeing 777",
        "seatOptions": [
          { "class": "Economy", "price": 850, "features": ["Standard seat", "Meal included"] },
          { "class": "Premium Economy", "price": 1200, "features": ["Extra legroom", "Priority boarding"] },
          { "class": "Business", "price": 2500, "features": ["Lie-flat seat", "Lounge access"] }
        ]
      }
    },
    "Hotel": {
      "name": "Specific Hotel Name${hasChildren ? " (Family-Friendly)" : ""}",
      "rating": 4.5,
      "address": "123 Hotel Street, City Center",
      "description": "Luxury hotel with modern amenities and excellent service",
      "amenities": [
        "Free Wi-Fi",
        "Fitness Center",
        "Pool",
        "Restaurant",
        "Room Service"${hasChildren ? ',\n        "Kids Club",\n        "Baby Cots Available",\n        "Children\'s Pool",\n        "Babysitting Services"' : ""}
      ],
      "roomTypes": [
        {
          "type": "Standard Room",
          "price": 180,
          "features": ["King bed", "City view", "32m²"]
        },
        {
          "type": "Deluxe Room${hasChildren ? " (Family)" : ""}",
          "price": 250,
          "features": ["King bed${hasChildren ? " + Sofa bed" : ""}", "Balcony", "45m²"${hasChildren ? ', "Child-safe balcony"' : ""}]
        },
        {
          "type": "Suite",
          "price": 400,
          "features": ["Separate living area", "Premium view", "65m²"${hasChildren ? ', "Extra space for family"' : ""}]
        }
      ],
      "images": [
        "https://source.unsplash.com/600x400/?hotel,lobby",
        "https://source.unsplash.com/600x400/?hotel,room",
        "https://source.unsplash.com/600x400/?hotel,pool"
      ]
    },
    "DestinationImage": "https://source.unsplash.com/600x400/?destination",
    "Activities": [
      {
        "name": "Must-do activity 1${hasChildren ? " (child-friendly)" : ""}",
        "description": "Detailed description of the activity",
        "duration": "3 hours",
        "location": "Specific location in city",
        "price": 45,
        "provider": "Tour Company Name",
        "rating": 4.7,
        "reviews": 1250${hasChildren ? ',\n        "childFriendly": true,\n        "ageRange": "All ages"' : ""}
      },
      {
        "name": "Must-do activity 2${hasChildren ? " (suitable for kids)" : ""}",
        "description": "Another engaging activity description",
        "duration": "2 hours",
        "location": "Another location",
        "price": 35,
        "provider": "Local Guide Service",
        "rating": 4.5,
        "reviews": 890${hasChildren ? ',\n        "childFriendly": true,\n        "ageRange": "5+"' : ""}
      }
    ],
    "AvailableActivities": [
      ${
        hasChildren
          ? `{ "name": "Children's Activity", "price": 35, "childFriendly": true, "description": "Fun activity for kids", "duration": "2 hours" },
         { "name": "Family Adventure", "price": 80, "childFriendly": true, "description": "Adventure suitable for families", "duration": "4 hours" },`
          : ""
      }
      { "name": "Specific Activity Name", "price": 50, "description": "Activity description", "duration": "3 hours"${hasChildren ? ', "childFriendly": false' : ""} },
      { "name": "Cultural Experience", "price": 60, "description": "Cultural activity", "duration": "2.5 hours"${hasChildren ? ', "childFriendly": true' : ""} }
    ],
    "Weather": {
      "general": "Detailed weather description for the month with seasonal patterns",
      "forecast": [
        { "day": "Day 1", "date": "2025-07-15", "temp": "22°C", "condition": "Sunny", "icon": "☀️", "humidity": "60%", "wind": "10 km/h" },
        { "day": "Day 2", "date": "2025-07-16", "temp": "20°C", "condition": "Partly Cloudy", "icon": "⛅", "humidity": "65%", "wind": "12 km/h" },
        { "day": "Day 3", "date": "2025-07-17", "temp": "24°C", "condition": "Clear", "icon": "☀️", "humidity": "55%", "wind": "8 km/h" },
        { "day": "Day 4", "date": "2025-07-18", "temp": "23°C", "condition": "Sunny", "icon": "☀️", "humidity": "58%", "wind": "9 km/h" },
        { "day": "Day 5", "date": "2025-07-19", "temp": "21°C", "condition": "Light Rain", "icon": "🌦️", "humidity": "75%", "wind": "15 km/h" }
      ],
      "clothingAdvice": "Pack light layers, comfortable walking shoes, and a light rain jacket for occasional showers"
    },
    "PriceBreakdown": {
      "flights": 1700,
      "hotel": 900,
      "activities": 200,
      "total": 2800
    },
    "Price": "$2800",
    "TravelerRequirements": {
      "passportRequired": true,
      "visaRequired": false,
      "vaccinations": ["None required"],
      "travelInsurance": "Recommended",
      "currency": "EUR",
      "timeZone": "CET (UTC+1)"
    },
    "LocalEvents": [
      {
        "name": "Summer Music Festival",
        "date": "2025-07-16",
        "description": "Annual outdoor music festival featuring local artists",
        "location": "City Park",
        "price": "Free"
      },
      {
        "name": "Food Market",
        "date": "Daily",
        "description": "Traditional food market with local specialties",
        "location": "Central Square",
        "price": "Free entry"
      }
    ],
    "CulturalTips": [
      "Learn basic local greetings",
      "Tipping is 10-15% at restaurants",
      "Many shops close for lunch 1-3 PM",
      "Dress modestly when visiting religious sites"${hasChildren ? ',\n      "Children are welcome in most restaurants",\n      "Public transportation has family-friendly options"' : ""}
    ]${hasChildren ? ',\n    "ChildFriendlyFeatures": [\n      "Kid-friendly hotel amenities",\n      "Child meal options available",\n      "Family activity recommendations",\n      "Baby equipment rental",\n      "Child-safe transportation",\n      "Pediatric services nearby",\n      "Children\'s entertainment options",\n      "Family-friendly restaurants"\n    ]' : ""}
  }
]`
      );
    }
  };

  try {
    // For development, you can use a mock response or integrate with OpenAI
    // Replace this with your actual AI service call

    const systemMessage = getSystemMessage(phase);

    // Example with OpenAI (uncomment and configure):
    /*
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: phase === 3 ? 2000 : phase === 2 ? 1500 : 1200,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI error:", errorText);
      return res.status(500).json({ error: "AI service error" });
    }

    const { choices } = await openaiRes.json();
    const resultText = choices[0].message.content;

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\n<raw>", resultText);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }
    */

    // Mock response for development (replace with actual AI call above)
    const result = generateMockTrip(prompt, phase, hasChildren, totalChildren);

    // Add computed fields
    const today = new Date();
    const enhancedResult = result.map((trip) => {
      let year = today.getFullYear();
      let mStart = new Date(`${trip.Month} 1, ${year}`);
      if (mStart < today) {
        year++;
        mStart = new Date(`${trip.Month} 1, ${year}`);
      }
      const days = parseInt(trip.Duration, 10) || 5;
      const iso = (d) => d.toISOString().split("T")[0];
      const StartDate = iso(mStart);
      const end = new Date(mStart);
      end.setDate(mStart.getDate() + days - 1);
      const EndDate = iso(end);

      // Extract base price
      const basePrice =
        typeof trip.Price === "string"
          ? parseInt(trip.Price.replace(/[^0-9]/g, ""), 10)
          : trip.PriceBreakdown?.total || 1800;

      return {
        ...trip,
        StartDate: trip.StartDate || StartDate,
        EndDate: trip.EndDate || EndDate,
        basePrice,
        availableActivities: trip.AvailableActivities || [],
        passengers: passengers,
        phase: phase,
        generatedAt: new Date().toISOString(),
      };
    });

    return res.status(200).json({ result: enhancedResult });
  } catch (err) {
    console.error("Generate handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Mock trip generator for development
function generateMockTrip(prompt, phase, hasChildren, totalChildren) {
  const destinations = [
    "Paris, France",
    "Rome, Italy",
    "Barcelona, Spain",
    "Tokyo, Japan",
  ];
  const destination =
    destinations[Math.floor(Math.random() * destinations.length)];
  const cityName = destination.split(",")[0];

  const baseTrip = {
    Destination: destination,
    Month: "July",
    Reason: `Perfect summer destination with great weather and ${hasChildren ? "family-friendly" : "amazing"} activities. ${prompt}`,
    Duration: "5 days",
    Flight:
      phase === 1
        ? {
            Outbound: `NYC → ${cityName}, 9:00 AM - 10:30 PM`,
            Return: `${cityName} → NYC, 12:00 PM - 4:00 PM`,
          }
        : {
            Outbound: {
              route: `NYC → ${cityName}`,
              departure: "9:00 AM",
              arrival: "10:30 PM",
              duration: "13h 30m",
              airline: "Major Airlines",
              flightNumber: "MA123",
              aircraft: "Boeing 777",
              seatOptions: [
                {
                  class: "Economy",
                  price: 850,
                  features: ["Standard seat", "Meal included"],
                },
                {
                  class: "Premium Economy",
                  price: 1200,
                  features: ["Extra legroom", "Priority boarding"],
                },
                {
                  class: "Business",
                  price: 2500,
                  features: ["Lie-flat seat", "Lounge access"],
                },
              ],
            },
            Return: {
              route: `${cityName} → NYC`,
              departure: "12:00 PM",
              arrival: "4:00 PM",
              duration: "12h 0m",
              airline: "Major Airlines",
              flightNumber: "MA456",
              aircraft: "Boeing 777",
              seatOptions: [
                {
                  class: "Economy",
                  price: 850,
                  features: ["Standard seat", "Meal included"],
                },
                {
                  class: "Premium Economy",
                  price: 1200,
                  features: ["Extra legroom", "Priority boarding"],
                },
                {
                  class: "Business",
                  price: 2500,
                  features: ["Lie-flat seat", "Lounge access"],
                },
              ],
            },
          },
    Hotel:
      phase === 1
        ? `${cityName} Grand Hotel${hasChildren ? " (Family-Friendly)" : ""}`
        : {
            name: `${cityName} Grand Hotel${hasChildren ? " (Family-Friendly)" : ""}`,
            rating: 4.5,
            address: `123 Hotel Street, ${cityName} Center`,
            description:
              "Luxury hotel with modern amenities and excellent service",
            amenities: [
              "Free Wi-Fi",
              "Fitness Center",
              "Pool",
              "Restaurant",
              "Room Service",
              ...(hasChildren
                ? ["Kids Club", "Baby Cots Available", "Children's Pool"]
                : []),
            ],
            roomTypes: [
              {
                type: "Standard Room",
                price: 180,
                features: ["King bed", "City view", "32m²"],
              },
              {
                type: `Deluxe Room${hasChildren ? " (Family)" : ""}`,
                price: 250,
                features: [
                  `King bed${hasChildren ? " + Sofa bed" : ""}`,
                  "Balcony",
                  "45m²",
                ],
              },
              {
                type: "Suite",
                price: 400,
                features: ["Separate living area", "Premium view", "65m²"],
              },
            ],
            images: [
              "https://source.unsplash.com/600x400/?hotel,lobby",
              "https://source.unsplash.com/600x400/?hotel,room",
              "https://source.unsplash.com/600x400/?hotel,pool",
            ],
          },
    DestinationImage: `https://source.unsplash.com/600x400/?${cityName.toLowerCase()},travel`,
    HotelImage: `https://source.unsplash.com/600x400/?hotel,${cityName.toLowerCase()}${hasChildren ? ",family" : ""}`,
    Activities:
      phase <= 1
        ? [
            `${cityName} City Tour${hasChildren ? " (child-friendly)" : ""}`,
            `Local Food Experience${hasChildren ? " (suitable for kids)" : ""}`,
            `Cultural Museum Visit${hasChildren ? " (family activity)" : ""}`,
          ]
        : [
            {
              name: `${cityName} City Tour${hasChildren ? " (child-friendly)" : ""}`,
              description: "Comprehensive city tour covering major landmarks",
              duration: "3 hours",
              location: `${cityName} Center`,
              price: 45,
              provider: "City Tours Inc",
              rating: 4.7,
              reviews: 1250,
              ...(hasChildren && { childFriendly: true, ageRange: "All ages" }),
            },
            {
              name: `Local Food Experience${hasChildren ? " (suitable for kids)" : ""}`,
              description: "Taste authentic local cuisine with expert guide",
              duration: "2 hours",
              location: "Food District",
              price: 35,
              provider: "Foodie Tours",
              rating: 4.5,
              reviews: 890,
              ...(hasChildren && { childFriendly: true, ageRange: "5+" }),
            },
          ],
    AvailableActivities: [
      ...(hasChildren
        ? [
            {
              name: "Children's Adventure Park",
              price: 35,
              childFriendly: true,
              description: "Fun playground and activities for kids",
              duration: "2 hours",
            },
            {
              name: "Family Bike Tour",
              price: 80,
              childFriendly: true,
              description: "Easy bike tour suitable for families",
              duration: "4 hours",
            },
          ]
        : []),
      {
        name: "Art Gallery Visit",
        price: 50,
        description: "Visit famous local art gallery",
        duration: "3 hours",
        ...(hasChildren && { childFriendly: false }),
      },
      {
        name: "Cooking Class",
        price: 75,
        description: "Learn to cook local dishes",
        duration: "3 hours",
        ...(hasChildren && { childFriendly: true }),
      },
      {
        name: "Walking Tour",
        price: 60,
        description: "Historical walking tour",
        duration: "2.5 hours",
        ...(hasChildren && { childFriendly: true }),
      },
    ],
    Weather: {
      general: `${cityName} in July offers warm, pleasant weather perfect for sightseeing`,
      forecast: [
        {
          day: "Day 1",
          temp: "22°C",
          condition: "Sunny",
          icon: "☀️",
          ...(phase >= 2 && {
            date: "2025-07-15",
            humidity: "60%",
            wind: "10 km/h",
          }),
        },
        {
          day: "Day 2",
          temp: "20°C",
          condition: "Partly Cloudy",
          icon: "⛅",
          ...(phase >= 2 && {
            date: "2025-07-16",
            humidity: "65%",
            wind: "12 km/h",
          }),
        },
        {
          day: "Day 3",
          temp: "24°C",
          condition: "Clear",
          icon: "☀️",
          ...(phase >= 2 && {
            date: "2025-07-17",
            humidity: "55%",
            wind: "8 km/h",
          }),
        },
        {
          day: "Day 4",
          temp: "23°C",
          condition: "Sunny",
          icon: "☀️",
          ...(phase >= 2 && {
            date: "2025-07-18",
            humidity: "58%",
            wind: "9 km/h",
          }),
        },
        {
          day: "Day 5",
          temp: "21°C",
          condition: "Light Rain",
          icon: "🌦️",
          ...(phase >= 2 && {
            date: "2025-07-19",
            humidity: "75%",
            wind: "15 km/h",
          }),
        },
      ],
      clothingAdvice:
        "Pack light layers, comfortable walking shoes, and a light rain jacket for occasional showers",
    },
    Price: phase >= 2 ? "$2800" : "$1800",
  };

  // Add phase-specific features
  if (phase >= 2) {
    baseTrip.PriceBreakdown = {
      flights: 1700,
      hotel: 900,
      activities: 200,
      total: 2800,
    };
  }

  if (phase >= 3) {
    baseTrip.TravelerRequirements = {
      passportRequired: true,
      visaRequired: false,
      vaccinations: ["None required"],
      travelInsurance: "Recommended",
      currency: destination.includes("Japan") ? "JPY" : "EUR",
      timeZone: destination.includes("Japan") ? "JST (UTC+9)" : "CET (UTC+1)",
    };

    baseTrip.LocalEvents = [
      {
        name: "Summer Music Festival",
        date: "2025-07-16",
        description: "Annual outdoor music festival featuring local artists",
        location: "City Park",
        price: "Free",
      },
      {
        name: "Food Market",
        date: "Daily",
        description: "Traditional food market with local specialties",
        location: "Central Square",
        price: "Free entry",
      },
    ];

    baseTrip.CulturalTips = [
      "Learn basic local greetings",
      "Tipping is 10-15% at restaurants",
      "Many shops close for lunch 1-3 PM",
      "Dress modestly when visiting religious sites",
      ...(hasChildren
        ? [
            "Children are welcome in most restaurants",
            "Public transportation has family-friendly options",
          ]
        : []),
    ];
  }

  // Add child-friendly features if traveling with children
  if (hasChildren) {
    baseTrip.ChildFriendlyFeatures = [
      "Kid-friendly hotel amenities",
      "Child meal options available",
      "Family activity recommendations",
      "Baby equipment rental",
      ...(phase >= 2
        ? ["Child-safe transportation", "Pediatric services nearby"]
        : []),
      ...(phase >= 3
        ? ["Children's entertainment options", "Family-friendly restaurants"]
        : []),
    ];
  }

  return [baseTrip];
}

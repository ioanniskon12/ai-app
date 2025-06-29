// pages/api/refine.js - Updated with child features and weather

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { originalPrompt, refinementPrompt, selectedTrips, previousPrompts } =
    req.body;

  if (!refinementPrompt || !selectedTrips || selectedTrips.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Since we're now working with single trips, we'll always refine the one trip
  const currentTrip = selectedTrips[0];

  // Check if this is a family trip
  const hasChildren =
    currentTrip.passengers &&
    (currentTrip.passengers.children > 0 || currentTrip.passengers.infants > 0);
  const totalChildren = hasChildren
    ? currentTrip.passengers.children + currentTrip.passengers.infants
    : 0;

  // Create a context-aware system message that includes the current trip
  const systemMessage = `
You are a smart travel-planner AI that refines travel suggestions based on user feedback.

Here is the current trip:
- Destination: ${currentTrip.Destination}
- Time: ${currentTrip.Month}, ${currentTrip.Duration}
- Hotel: ${currentTrip.Hotel}
- Price: ${currentTrip.Price}
- Activities: ${currentTrip.Activities?.join(", ")}
${hasChildren ? `- FAMILY TRIP: Traveling with ${totalChildren} child(ren) - maintain all child-friendly features` : ""}

The user wants to refine this trip with the following requirements: "${refinementPrompt}"

${previousPrompts?.length > 0 ? `Previous refinements: ${previousPrompts.join(", ")}` : ""}

Generate *exactly* ONE refined trip package in *valid JSON* only, formatted as an array with a single object.
The trip should be based on the current trip but modified according to the refinement request.

Key refinement rules:
- If they want "lower budget", reduce prices by 20-40% and suggest more affordable options
- If they want "more luxury", upgrade hotels to 5-star and add premium experiences
- If they want "family-friendly", include activities suitable for children and family-oriented hotels
- If they want "different dates", change the Month while keeping the destination
- If they want a "different destination", suggest a similar but different location
- For any other request, thoughtfully modify the trip to match their needs
${hasChildren ? "- ALWAYS maintain child-friendly features and activities when refining family trips" : ""}
- Always include updated weather information for the destination and timeframe
- Generate specific dates for weather forecasts

Maintain the same JSON structure but adjust ALL relevant details based on the refinement.

[
  {
    "Destination": "City, Country",
    "Month": "Month",
    "Reason": "Updated reason explaining why this refined trip matches their requirements${hasChildren ? " and remains perfect for families" : ""}",
    "Duration": "X days",
    "Flight": {
      "Outbound": "XXX→YYY, 9:00 AM - 10:30 PM",
      "Return": "YYY→XXX, 12:00 PM - 4:00 PM"
    },
    "Hotel": "Hotel Name${hasChildren ? " (Family-Friendly)" : ""}",
    "HotelImage": "https://source.unsplash.com/600x400/?hotel,destination${hasChildren ? ",family" : ""}",
    "DestinationImage": "https://source.unsplash.com/600x400/?destination",
    "Activities": [
      "Activity 1${hasChildren ? " (child-friendly)" : ""}",
      "Activity 2${hasChildren ? " (suitable for kids)" : ""}",
      "Activity 3${hasChildren ? " (family activity)" : ""}"
    ],
    "AvailableActivities": [
      ${
        hasChildren
          ? `{ "name": "Children's Activity", "price": 35, "childFriendly": true },
         { "name": "Baby Care Experience", "price": 25, "childFriendly": true },
         { "name": "Family Adventure", "price": 80, "childFriendly": true },`
          : ""
      }
      { "name": "Activity Name", "price": 50${hasChildren ? ', "childFriendly": false' : ""} },
      { "name": "Activity Name", "price": 40${hasChildren ? ', "childFriendly": true' : ""} },
      { "name": "Activity Name", "price": 60${hasChildren ? ', "childFriendly": true' : ""} },
      { "name": "Activity Name", "price": 80${hasChildren ? ', "childFriendly": false' : ""} },
      { "name": "Activity Name", "price": 30${hasChildren ? ', "childFriendly": true' : ""} }
    ],
    "Weather": {
      "forecast": [
        { "date": "2025-XX-XX", "temp": "22°C", "condition": "Sunny", "icon": "☀️", "humidity": "65%" },
        { "date": "2025-XX-XX", "temp": "24°C", "condition": "Partly Cloudy", "icon": "⛅", "humidity": "70%" },
        { "date": "2025-XX-XX", "temp": "21°C", "condition": "Light Rain", "icon": "🌧️", "humidity": "80%" },
        { "date": "2025-XX-XX", "temp": "23°C", "condition": "Sunny", "icon": "☀️", "humidity": "60%" },
        { "date": "2025-XX-XX", "temp": "25°C", "condition": "Clear", "icon": "☀️", "humidity": "55%" }
      ],
      "averageTemp": "23°C",
      "bestConditions": "Mostly sunny with comfortable temperatures",
      "clothingAdvice": "Light layers recommended${hasChildren ? ", pack extra clothes for children" : ""}"
    },
    "ChildFriendlyFeatures": ${
      hasChildren
        ? `[
      "Baby changing facilities",
      "High chairs available",
      "Kids menu at restaurants",
      "Stroller-friendly paths",
      "Child safety locks",
      "Babysitting services"
    ]`
        : "null"
    },
    "Price": "$XXXX"
  }
]
`.trim();

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemMessage },
            {
              role: "user",
              content: `Original request: "${originalPrompt}". Refinement: "${refinementPrompt}"${hasChildren ? ` (Family trip with ${totalChildren} children)` : ""}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      }
    );

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI error:", errorText);
      return res.status(500).json({ error: "OpenAI request failed" });
    }

    const { choices } = await openaiRes.json();
    const resultText = choices[0].message.content;

    let refinedTrips;
    try {
      refinedTrips = JSON.parse(resultText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\n<raw>", resultText);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    // Add dates and base prices like in the original generate endpoint
    const today = new Date();
    const withExtras = refinedTrips.map((trip) => {
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
      const basePrice = parseInt(trip.Price.replace(/[^0-9]/g, ""), 10);

      // Generate specific dates for weather forecast
      const weatherDates = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(mStart);
        date.setDate(mStart.getDate() + i);
        weatherDates.push(date.toISOString().split("T")[0]);
      }

      // Update weather forecast with specific dates if available
      if (trip.Weather && trip.Weather.forecast) {
        trip.Weather.forecast = trip.Weather.forecast.map((day, index) => ({
          ...day,
          date: weatherDates[index] || day.date,
        }));
      }

      return {
        ...trip,
        StartDate,
        EndDate,
        basePrice,
        availableActivities: trip.AvailableActivities || [],
        passengers: currentTrip.passengers, // Preserve original passenger info
      };
    });

    return res.status(200).json({ refinedTrips: withExtras });
  } catch (err) {
    console.error("Refine handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}

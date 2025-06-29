// pages/api/flights.js - Real Amadeus flight search
import { getAmadeusToken, getCityCode } from "@/lib/amadeus";

export default async function handler(req, res) {
  const { destination, startDate, endDate, origin } = req.query;

  if (!destination || !startDate) {
    return res
      .status(400)
      .json({ error: "Destination and start date are required" });
  }

  try {
    const token = await getAmadeusToken();

    // Get IATA codes for cities
    const originCode = origin ? await getCityCode(origin) : "LON"; // Default to London
    const destCode = await getCityCode(destination);

    if (!destCode) {
      return res.status(400).json({ error: "Could not find destination city" });
    }

    // Search for flights
    const searchParams = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destCode,
      departureDate: startDate,
      returnDate: endDate || "",
      adults: "1",
      currencyCode: "USD",
      max: "5",
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Amadeus flight search error:", error);
      throw new Error(`Flight search failed: ${response.status}`);
    }

    const data = await response.json();

    // Process flight offers
    const offers =
      data.data?.slice(0, 5).map((offer) => {
        const outbound = offer.itineraries[0];
        const firstSegment = outbound.segments[0];
        const lastSegment = outbound.segments[outbound.segments.length - 1];

        // Calculate total duration
        const duration = outbound.duration.replace("PT", "").toLowerCase();

        // Get airline name from first segment
        const carrierCode = firstSegment.carrierCode;
        const airlines = {
          BA: "British Airways",
          AA: "American Airlines",
          LH: "Lufthansa",
          AF: "Air France",
          KL: "KLM",
          IB: "Iberia",
          EK: "Emirates",
          QR: "Qatar Airways",
          // Add more as needed
        };

        return {
          id: offer.id,
          airline: airlines[carrierCode] || carrierCode,
          departure: `${firstSegment.departure.iataCode} ${new Date(firstSegment.departure.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
          arrival: `${lastSegment.arrival.iataCode} ${new Date(lastSegment.arrival.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
          price: Math.round(parseFloat(offer.price.total)),
          currency: offer.price.currency,
          duration: duration.replace("h", "h ").replace("m", "m"),
          stops: outbound.segments.length - 1,
          flightNumber: `${carrierCode}${firstSegment.number}`,
          raw: offer, // Keep raw data for booking
        };
      }) || [];

    // Cache for 5 minutes (flight prices change frequently)
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json({
      origin: originCode,
      destination: destCode,
      startDate,
      endDate,
      offers,
    });
  } catch (error) {
    console.error("Flight search error:", error);

    // Fallback to mock data if API fails
    const mockFlights = [
      {
        airline: "Search unavailable",
        departure: "--- --:--",
        arrival: "--- --:--",
        price: 0,
        duration: "-- --",
        stops: 0,
        flightNumber: "---",
      },
    ];

    res.status(200).json({
      destination,
      startDate,
      endDate,
      offers: mockFlights,
      error: "Flight search temporarily unavailable",
    });
  }
}

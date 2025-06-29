// pages/api/hotels.js - Real Amadeus hotel search
import { getAmadeusToken, getCityCode } from "@/lib/amadeus";

export default async function handler(req, res) {
  const { destination, checkIn, checkOut } = req.query;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  try {
    const token = await getAmadeusToken();

    // Get city code
    const cityCode = await getCityCode(destination);

    if (!cityCode) {
      return res.status(400).json({ error: "Could not find destination city" });
    }

    // First, get hotels by city
    const hotelsResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!hotelsResponse.ok) {
      throw new Error(`Hotel search failed: ${hotelsResponse.status}`);
    }

    const hotelsData = await hotelsResponse.json();
    const hotelIds = hotelsData.data
      ?.slice(0, 10)
      .map((hotel) => hotel.hotelId)
      .join(",");

    if (!hotelIds) {
      return res.status(200).json({
        destination,
        hotels: [],
        message: "No hotels found in this city",
      });
    }

    // Get hotel offers
    const offersParams = new URLSearchParams({
      hotelIds: hotelIds,
      adults: "1",
    });

    if (checkIn) offersParams.append("checkInDate", checkIn);
    if (checkOut) offersParams.append("checkOutDate", checkOut);

    const offersResponse = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${offersParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let hotels = [];

    if (offersResponse.ok) {
      const offersData = await offersResponse.json();

      hotels =
        offersData.data?.slice(0, 5).map((hotelOffer) => {
          const hotel = hotelOffer.hotel;
          const offer = hotelOffer.offers?.[0];

          return {
            id: hotel.hotelId,
            name: hotel.name || "Hotel",
            location: `${hotel.address?.cityName || destination}`,
            rating: hotel.rating || 4,
            price: offer ? Math.round(parseFloat(offer.price.total)) : "N/A",
            currency: offer?.price.currency || "USD",
            amenities: hotel.amenities?.slice(0, 4) || ["WiFi"],
            description: hotel.description?.text || "",
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          };
        }) || [];
    } else {
      // If offers fail, at least return hotel info
      hotels =
        hotelsData.data?.slice(0, 5).map((hotel) => ({
          id: hotel.hotelId,
          name: hotel.name || "Hotel",
          location: destination,
          rating: 4,
          price: "Check availability",
          amenities: ["Contact for amenities"],
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        })) || [];
    }

    // Cache for 30 minutes
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
    res.status(200).json({
      destination,
      cityCode,
      hotels,
    });
  } catch (error) {
    console.error("Hotel search error:", error);

    // Fallback to basic response
    res.status(200).json({
      destination,
      hotels: [],
      error: "Hotel search temporarily unavailable",
    });
  }
}

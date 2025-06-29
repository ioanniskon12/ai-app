// lib/amadeus.js - Amadeus API authentication helper
let accessToken = null;
let tokenExpiry = null;

export async function getAmadeusToken() {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
  const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Amadeus API credentials not configured");
  }

  try {
    // Get new token
    const response = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Amadeus auth failed: ${response.status}`);
    }

    const data = await response.json();

    // Store token and calculate expiry
    accessToken = data.access_token;
    tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000); // Subtract 60 seconds for safety

    return accessToken;
  } catch (error) {
    console.error("Amadeus authentication error:", error);
    throw error;
  }
}

// Helper to get IATA code for a city
export async function getCityCode(cityName) {
  const token = await getAmadeusToken();

  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`City search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0]?.iataCode || null;
  } catch (error) {
    console.error("City code search error:", error);
    return null;
  }
}

// pages/api/user/dashboard.js - Dashboard API endpoint
import { getSession } from "next-auth/react";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession({ req });

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email } = req.query;

    if (email !== session.user.email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const client = await clientPromise;
    const db = client.db("travel-planner");

    // Fetch user's bookings/trips
    const trips = await db
      .collection("bookings")
      .find({
        $or: [{ email: email }, { userEmail: email }, { "user.email": email }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate stats
    const now = new Date();

    const upcomingTrips = trips.filter((trip) => {
      const startDate = new Date(trip.startDate || trip.StartDate);
      return startDate > now;
    }).length;

    const completedTrips = trips.filter((trip) => {
      const endDate = new Date(trip.endDate || trip.EndDate);
      return endDate < now;
    }).length;

    const totalSpent = trips.reduce((sum, trip) => {
      const price = parseInt(
        (trip.price || trip.Price || "0").replace(/[^0-9]/g, ""),
        10
      );
      return sum + price;
    }, 0);

    // Process trips for frontend
    const processedTrips = trips.map((trip) => ({
      _id: trip._id,
      destination: trip.destination || trip.Destination,
      startDate: trip.startDate || trip.StartDate,
      endDate: trip.endDate || trip.EndDate,
      duration: trip.duration || trip.Duration,
      price: trip.price || trip.Price,
      destinationImage: trip.destinationImage || trip.DestinationImage,
      passengers: trip.passengers || {
        adults: 1,
        children: 0,
        infants: 0,
      },
      activities: trip.activities || trip.Activities || [],
      hotel: trip.hotel || trip.Hotel,
      status: trip.status || "confirmed",
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }));

    const stats = {
      totalTrips: trips.length,
      upcomingTrips,
      completedTrips,
      totalSpent,
      averageTripCost:
        trips.length > 0 ? Math.round(totalSpent / trips.length) : 0,
      favoriteDestination: getMostVisitedDestination(trips),
      totalCountries: getUniqueCountries(trips).length,
      totalCities: getUniqueCities(trips).length,
    };

    res.status(200).json({
      trips: processedTrips,
      stats,
      recentActivity: generateRecentActivity(trips.slice(0, 5)),
      summary: {
        totalTrips: trips.length,
        nextTrip: getNextTrip(trips),
        lastTrip: getLastTrip(trips),
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}

// Helper functions
function getMostVisitedDestination(trips) {
  if (trips.length === 0) return null;

  const destinations = {};
  trips.forEach((trip) => {
    const dest = trip.destination || trip.Destination;
    if (dest) {
      const country = dest.split(",")[1]?.trim() || dest;
      destinations[country] = (destinations[country] || 0) + 1;
    }
  });

  return (
    Object.entries(destinations).sort(([, a], [, b]) => b - a)[0]?.[0] || null
  );
}

function getUniqueCountries(trips) {
  const countries = new Set();
  trips.forEach((trip) => {
    const dest = trip.destination || trip.Destination;
    if (dest) {
      const country = dest.split(",")[1]?.trim() || dest;
      countries.add(country);
    }
  });
  return Array.from(countries);
}

function getUniqueCities(trips) {
  const cities = new Set();
  trips.forEach((trip) => {
    const dest = trip.destination || trip.Destination;
    if (dest) {
      const city = dest.split(",")[0]?.trim();
      if (city) cities.add(city);
    }
  });
  return Array.from(cities);
}

function getNextTrip(trips) {
  const now = new Date();
  const upcomingTrips = trips
    .filter((trip) => {
      const startDate = new Date(trip.startDate || trip.StartDate);
      return startDate > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startDate || a.StartDate);
      const dateB = new Date(b.startDate || b.StartDate);
      return dateA - dateB;
    });

  return upcomingTrips[0] || null;
}

function getLastTrip(trips) {
  const now = new Date();
  const pastTrips = trips
    .filter((trip) => {
      const endDate = new Date(trip.endDate || trip.EndDate);
      return endDate < now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.endDate || a.EndDate);
      const dateB = new Date(b.endDate || b.EndDate);
      return dateB - dateA;
    });

  return pastTrips[0] || null;
}

function generateRecentActivity(recentTrips) {
  const activities = [];

  recentTrips.forEach((trip) => {
    const createdDate = new Date(trip.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeText;
    if (diffDays === 0) {
      timeText = "Today";
    } else if (diffDays === 1) {
      timeText = "Yesterday";
    } else if (diffDays < 7) {
      timeText = `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      timeText = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      timeText = `${months} month${months > 1 ? "s" : ""} ago`;
    }

    activities.push({
      type: "booking",
      title: `Trip to ${trip.destination || trip.Destination} booked`,
      time: timeText,
      icon: "plane",
      color: "blue",
    });
  });

  // Add some sample activities if no recent trips
  if (activities.length === 0) {
    activities.push({
      type: "profile",
      title: "Profile created",
      time: "Welcome to AI Travel!",
      icon: "user",
      color: "green",
    });
  }

  return activities.slice(0, 5);
}

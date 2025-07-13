// pages/api/share/trip/[id].js - API endpoint for public trip data
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();

    // Fetch trip with limited public information
    const trip = await db.collection("bookings").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          destination: 1,
          startDate: 1,
          endDate: 1,
          duration: 1,
          month: 1,
          hotel: 1,
          activities: 1,
          weather: 1,
          // Exclude sensitive information
          userEmail: 0,
          userId: 0,
          paymentId: 0,
          totalPrice: 0,
        },
      }
    );

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching shared trip:", error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
}

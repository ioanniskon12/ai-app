// pages/checkout.jsx
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { tripId } = router.query;
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) return;
    // fetch your trip from state or API…
    // setTrip(...)
  }, [tripId]);

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("strapi_jwt");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination: trip.Destination,
            startDate: trip.StartDate,
            endDate: trip.EndDate,
            user: user.id,
            activities: trip.selectedActivities.map((a) => a.name),
            price: trip.totalPrice,
          }),
        }
      );
      if (!res.ok) throw await res.json();
      router.push("/my-trips");
    } catch (err) {
      setError(err.error || "Booking failed");
    }
  };

  if (!trip) return <p>Loading…</p>;
  return (
    <div>
      <h1>Confirm your booking</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* summary of trip */}
      <button onClick={handleConfirm}>Confirm & Pay</button>
    </div>
  );
}

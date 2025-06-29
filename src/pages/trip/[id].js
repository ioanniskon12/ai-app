// pages/trip/[id].js - Enhanced Trip Details View with All Phases
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: ${(props) =>
    props.status === "confirmed"
      ? "#10b981"
      : props.status === "pending_payment"
        ? "#f59e0b"
        : "#ef4444"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  text-align: center;

  .info-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.5rem;
  }

  .info-label {
    color: #6b7280;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};
  animation-fill-mode: both;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }
`;

const FlightCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 11px
    );
    border-radius: 12px;
  }

  .flight-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .flight-details {
    position: relative;
    z-index: 1;
  }
`;

const HotelCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
`;

const HotelImage = styled.div`
  height: 200px;
  background: ${(props) =>
    props.image
      ? `url(${props.image}) center/cover`
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
`;

const HotelContent = styled.div`
  padding: 1.5rem;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ActivityCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .activity-title {
    font-weight: 600;
    color: #1f2937;
  }

  .activity-price {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const WeatherCard = styled.div`
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;

  .weather-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .weather-temp {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .weather-condition {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const TravelerCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;

  .traveler-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .traveler-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #1f2937;
  }

  .traveler-type {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    text-transform: uppercase;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #6b7280;
    font-weight: 500;
  }

  .value {
    color: #1f2937;
    font-weight: 600;
  }
`;

const PriceBreakdown = styled.div`
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;

  &:hover {
    background: #5a67d8;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function TripDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id, session?.user?.email]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching booking details for:", id);

      // Try to get from API first
      const res = await fetch(
        `/api/bookings?email=${session?.user?.email || ""}`
      );

      if (res.ok) {
        const data = await res.json();
        console.log("📦 API Response:", data);

        let bookings = [];
        if (Array.isArray(data)) {
          bookings = data;
        } else if (data.bookings && Array.isArray(data.bookings)) {
          bookings = data.bookings;
        }

        if (bookings.length > 0) {
          const foundBooking = bookings.find(
            (b) => b._id === id || b.id === id
          );

          if (foundBooking) {
            setBooking(foundBooking);
            console.log("✅ Booking found via API");
            return;
          }
        }
      }

      // Fallback: try localStorage
      console.log("🔄 Trying localStorage fallback...");
      const stored =
        localStorage.getItem("lastBooking") ||
        localStorage.getItem("selectedTrip");

      if (stored) {
        const parsedBooking = JSON.parse(stored);
        if (parsedBooking.id === id || parsedBooking._id === id) {
          setBooking(parsedBooking);
          console.log("✅ Booking found in localStorage");
          return;
        }
      }

      // If no booking found
      setError("Trip not found");
    } catch (err) {
      console.error("❌ Error fetching booking:", err);
      setError("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrip = () => {
    if (booking) {
      localStorage.setItem("editingTrip", JSON.stringify(booking));
      router.push("/trip-builder");
    }
  };

  const handleCancelTrip = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this trip? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "User requested cancellation",
        }),
      });

      if (res.ok) {
        alert("Trip cancelled successfully");
        router.push("/my-trips");
      } else {
        throw new Error("Failed to cancel trip");
      }
    } catch (error) {
      console.error("Error cancelling trip:", error);
      alert("Failed to cancel trip. Please contact support.");
    }
  };

  const handleDownloadItinerary = () => {
    // Implementation for downloading PDF itinerary
    alert("PDF download feature coming soon!");
  };

  const handleShareTrip = async () => {
    const shareData = {
      title: `Trip to ${booking.destination}`,
      text: `Check out my trip to ${booking.destination}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <SectionCard>
            <LoadingSpinner />
            <p style={{ textAlign: "center" }}>Loading trip details...</p>
          </SectionCard>
        </Container>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <Container>
          <SectionCard>
            <h2>Trip Not Found</h2>
            <p>{error || "The requested trip could not be found."}</p>
            <ActionButtons>
              <PrimaryButton onClick={() => router.push("/my-trips")}>
                Back to My Trips
              </PrimaryButton>
            </ActionButtons>
          </SectionCard>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        {/* Header */}
        <Header>
          <StatusBadge status={booking.status || booking.paymentStatus}>
            {booking.status === "confirmed" || booking.paymentStatus === "paid"
              ? "Confirmed"
              : booking.status || "Pending"}
          </StatusBadge>

          <Title>Trip to {booking.destination}</Title>
          <Subtitle>
            {booking.duration} • {booking.month}
            {booking.bookingReference && ` • Ref: ${booking.bookingReference}`}
          </Subtitle>

          <InfoGrid>
            <InfoCard>
              <div className="info-value">
                {booking.totalPassengers ||
                  booking.passengers?.adults +
                    booking.passengers?.children +
                    booking.passengers?.infants ||
                  "N/A"}
              </div>
              <div className="info-label">Passengers</div>
            </InfoCard>

            <InfoCard>
              <div className="info-value">
                $
                {booking.totalPrice ||
                  booking.price?.replace(/[^0-9]/g, "") ||
                  "TBD"}
              </div>
              <div className="info-label">Total Cost</div>
            </InfoCard>

            {booking.startDate && (
              <InfoCard>
                <div className="info-value">
                  {new Date(booking.startDate).toLocaleDateString()}
                </div>
                <div className="info-label">Departure</div>
              </InfoCard>
            )}

            {booking.endDate && (
              <InfoCard>
                <div className="info-value">
                  {new Date(booking.endDate).toLocaleDateString()}
                </div>
                <div className="info-label">Return</div>
              </InfoCard>
            )}
          </InfoGrid>
        </Header>

        {/* Flight Information */}
        {booking.flight && (
          <SectionCard delay="0.1s">
            <SectionTitle>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27a2 2 0 0 0 1-1.73z" />
              </svg>
              Flight Details
            </SectionTitle>

            {booking.flight.outbound && (
              <FlightCard>
                <div className="flight-header">
                  <h3>🛫 Outbound Flight</h3>
                  <span>{booking.flight.outbound.airline}</span>
                </div>
                <div className="flight-details">
                  <DetailRow>
                    <span className="label">Flight Number</span>
                    <span className="value">
                      {booking.flight.outbound.flightNumber}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Route</span>
                    <span className="value">
                      {booking.flight.outbound.departure} →{" "}
                      {booking.flight.outbound.arrival}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Time</span>
                    <span className="value">
                      {booking.flight.outbound.departureTime} -{" "}
                      {booking.flight.outbound.arrivalTime}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Duration</span>
                    <span className="value">
                      {booking.flight.outbound.duration}
                    </span>
                  </DetailRow>
                  {booking.flight.outbound.seatNumber && (
                    <DetailRow>
                      <span className="label">Seat</span>
                      <span className="value">
                        {booking.flight.outbound.seatNumber}
                      </span>
                    </DetailRow>
                  )}
                </div>
              </FlightCard>
            )}

            {booking.flight.return && (
              <FlightCard>
                <div className="flight-header">
                  <h3>🛬 Return Flight</h3>
                  <span>{booking.flight.return.airline}</span>
                </div>
                <div className="flight-details">
                  <DetailRow>
                    <span className="label">Flight Number</span>
                    <span className="value">
                      {booking.flight.return.flightNumber}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Route</span>
                    <span className="value">
                      {booking.flight.return.departure} →{" "}
                      {booking.flight.return.arrival}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Time</span>
                    <span className="value">
                      {booking.flight.return.departureTime} -{" "}
                      {booking.flight.return.arrivalTime}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Duration</span>
                    <span className="value">
                      {booking.flight.return.duration}
                    </span>
                  </DetailRow>
                  {booking.flight.return.seatNumber && (
                    <DetailRow>
                      <span className="label">Seat</span>
                      <span className="value">
                        {booking.flight.return.seatNumber}
                      </span>
                    </DetailRow>
                  )}
                </div>
              </FlightCard>
            )}
          </SectionCard>
        )}

        {/* Hotel Information */}
        {booking.hotel && (
          <SectionCard delay="0.2s">
            <SectionTitle>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Hotel Accommodation
            </SectionTitle>

            <HotelCard>
              <HotelImage
                image={`https://source.unsplash.com/600x300/?hotel,${booking.destination.split(",")[0]}`}
              />
              <HotelContent>
                <h3>{booking.hotel.name}</h3>
                {booking.hotel.rating && (
                  <p>⭐ {booking.hotel.rating}/5 stars</p>
                )}

                {booking.hotel.address && (
                  <p>
                    📍 {booking.hotel.address.street},{" "}
                    {booking.hotel.address.city}
                  </p>
                )}

                <DetailRow>
                  <span className="label">Check-in</span>
                  <span className="value">
                    {booking.hotel.checkIn
                      ? new Date(booking.hotel.checkIn).toLocaleDateString()
                      : booking.startDate
                        ? new Date(booking.startDate).toLocaleDateString()
                        : "TBD"}
                  </span>
                </DetailRow>

                <DetailRow>
                  <span className="label">Check-out</span>
                  <span className="value">
                    {booking.hotel.checkOut
                      ? new Date(booking.hotel.checkOut).toLocaleDateString()
                      : booking.endDate
                        ? new Date(booking.endDate).toLocaleDateString()
                        : "TBD"}
                  </span>
                </DetailRow>

                {booking.hotel.roomType && (
                  <DetailRow>
                    <span className="label">Room Type</span>
                    <span className="value">{booking.hotel.roomType}</span>
                  </DetailRow>
                )}

                {booking.hotel.price && (
                  <DetailRow>
                    <span className="label">Price per Night</span>
                    <span className="value">
                      $
                      {booking.hotel.price.perNight ||
                        booking.hotel.pricePerNight}
                    </span>
                  </DetailRow>
                )}

                {booking.hotel.amenities &&
                  booking.hotel.amenities.length > 0 && (
                    <div>
                      <h4>Amenities:</h4>
                      <p>{booking.hotel.amenities.join(", ")}</p>
                    </div>
                  )}

                {booking.hotel.familyFriendly && (
                  <p>👨‍👩‍👧‍👦 Family-friendly accommodation</p>
                )}
              </HotelContent>
            </HotelCard>
          </SectionCard>
        )}

        {/* Activities */}
        {booking.selectedActivities &&
          booking.selectedActivities.length > 0 && (
            <SectionCard delay="0.3s">
              <SectionTitle>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Selected Activities
              </SectionTitle>

              <ActivityGrid>
                {booking.selectedActivities.map((activity, index) => (
                  <ActivityCard key={index}>
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.name}</h4>
                      <div className="activity-price">
                        ${activity.price?.total || activity.price || 0}
                      </div>
                    </div>

                    {activity.description && <p>{activity.description}</p>}

                    {activity.duration && (
                      <DetailRow>
                        <span className="label">Duration</span>
                        <span className="value">{activity.duration}</span>
                      </DetailRow>
                    )}

                    {activity.category && (
                      <DetailRow>
                        <span className="label">Category</span>
                        <span className="value">{activity.category}</span>
                      </DetailRow>
                    )}

                    {activity.difficultyLevel && (
                      <DetailRow>
                        <span className="label">Difficulty</span>
                        <span className="value">
                          {activity.difficultyLevel}
                        </span>
                      </DetailRow>
                    )}

                    {activity.location && (
                      <DetailRow>
                        <span className="label">Location</span>
                        <span className="value">
                          {activity.location.name || activity.location.address}
                        </span>
                      </DetailRow>
                    )}

                    {activity.childFriendly && (
                      <p>👶 Child-friendly activity</p>
                    )}
                  </ActivityCard>
                ))}
              </ActivityGrid>
            </SectionCard>
          )}

        {/* Weather Forecast */}
        {booking.weather && booking.weather.length > 0 && (
          <SectionCard delay="0.4s">
            <SectionTitle>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
              Weather Forecast
            </SectionTitle>

            <WeatherGrid>
              {booking.weather.map((day, index) => (
                <WeatherCard key={index}>
                  <div className="weather-icon">{day.icon}</div>
                  <div className="weather-temp">
                    {typeof day.temperature === "object"
                      ? `${day.temperature.high}°/${day.temperature.low}°`
                      : day.temperature}
                  </div>
                  <div className="weather-condition">{day.condition}</div>
                  <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    {day.day}
                  </div>
                </WeatherCard>
              ))}
            </WeatherGrid>

            {booking.clothingAdvice && booking.clothingAdvice.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4>Clothing Advice:</h4>
                <ul>
                  {booking.clothingAdvice.map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        )}

        {/* Traveler Information */}
        {booking.travelers && booking.travelers.length > 0 && (
          <SectionCard delay="0.5s">
            <SectionTitle>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Traveler Information
            </SectionTitle>

            {booking.travelers.map((traveler, index) => (
              <TravelerCard key={index}>
                <div className="traveler-header">
                  <div className="traveler-name">
                    {traveler.firstName} {traveler.lastName}
                  </div>
                  <div className="traveler-type">{traveler.type}</div>
                </div>

                {traveler.dateOfBirth && (
                  <DetailRow>
                    <span className="label">Date of Birth</span>
                    <span className="value">
                      {new Date(traveler.dateOfBirth).toLocaleDateString()}
                    </span>
                  </DetailRow>
                )}

                {traveler.passportNumber && (
                  <DetailRow>
                    <span className="label">Passport Number</span>
                    <span className="value">{traveler.passportNumber}</span>
                  </DetailRow>
                )}

                {traveler.nationality && (
                  <DetailRow>
                    <span className="label">Nationality</span>
                    <span className="value">{traveler.nationality}</span>
                  </DetailRow>
                )}

                {traveler.specialRequests && (
                  <DetailRow>
                    <span className="label">Special Requests</span>
                    <span className="value">{traveler.specialRequests}</span>
                  </DetailRow>
                )}
              </TravelerCard>
            ))}
          </SectionCard>
        )}

        {/* Price Breakdown */}
        {booking.priceBreakdown && (
          <SectionCard delay="0.6s">
            <SectionTitle>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Price Breakdown
            </SectionTitle>

            <PriceBreakdown>
              {booking.priceBreakdown.basePrice && (
                <DetailRow>
                  <span className="label">Base Price</span>
                  <span className="value">
                    ${booking.priceBreakdown.basePrice}
                  </span>
                </DetailRow>
              )}

              {booking.priceBreakdown.flights > 0 && (
                <DetailRow>
                  <span className="label">Flights</span>
                  <span className="value">
                    ${booking.priceBreakdown.flights}
                  </span>
                </DetailRow>
              )}

              {booking.priceBreakdown.hotel > 0 && (
                <DetailRow>
                  <span className="label">Hotel</span>
                  <span className="value">${booking.priceBreakdown.hotel}</span>
                </DetailRow>
              )}

              {booking.priceBreakdown.activities > 0 && (
                <DetailRow>
                  <span className="label">Activities</span>
                  <span className="value">
                    ${booking.priceBreakdown.activities}
                  </span>
                </DetailRow>
              )}

              {booking.priceBreakdown.taxes > 0 && (
                <DetailRow>
                  <span className="label">Taxes & Fees</span>
                  <span className="value">
                    $
                    {booking.priceBreakdown.taxes +
                      (booking.priceBreakdown.fees || 0)}
                  </span>
                </DetailRow>
              )}

              <DetailRow
                style={{
                  borderTop: "2px solid #0ea5e9",
                  paddingTop: "0.75rem",
                  marginTop: "0.75rem",
                }}
              >
                <span
                  className="label"
                  style={{ fontSize: "1.1rem", fontWeight: "700" }}
                >
                  Total
                </span>
                <span
                  className="value"
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#0c4a6e",
                  }}
                >
                  ${booking.totalPrice || booking.price?.replace(/[^0-9]/g, "")}
                </span>
              </DetailRow>
            </PriceBreakdown>
          </SectionCard>
        )}

        {/* Action Buttons */}
        <SectionCard delay="0.7s">
          <ActionButtons>
            <PrimaryButton onClick={handleEditTrip}>Edit Trip</PrimaryButton>
            <SecondaryButton onClick={handleDownloadItinerary}>
              Download PDF
            </SecondaryButton>
            <SecondaryButton onClick={handleShareTrip}>
              Share Trip
            </SecondaryButton>
            {booking.canCancel && (
              <SecondaryButton
                onClick={handleCancelTrip}
                style={{ borderColor: "#ef4444", color: "#ef4444" }}
              >
                Cancel Trip
              </SecondaryButton>
            )}
          </ActionButtons>
        </SectionCard>
      </Container>
    </PageContainer>
  );
}

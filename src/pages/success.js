// pages/success.js - Fixed success page with proper booking handling
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const checkmark = keyframes`
  0% { transform: scale(0) rotate(45deg); }
  50% { transform: scale(1.2) rotate(45deg); }
  100% { transform: scale(1) rotate(45deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const SuccessCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const CheckmarkCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #10b981;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;

  svg {
    width: 40px;
    height: 40px;
    color: white;
    stroke-width: 3;
    animation: ${checkmark} 0.6s ease-out 0.3s both;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const BookingDetails = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  svg {
    color: #667eea;
    flex-shrink: 0;
  }

  div {
    flex: 1;
  }

  strong {
    color: #1f2937;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
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
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

export default function Success() {
  const router = useRouter();
  const { data: session } = useSession();
  const { session_id, booking_id } = router.query;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookingDetails = async () => {
    if (!booking_id) return;

    try {
      setLoading(true);
      console.log("🔍 Fetching booking details for:", booking_id);

      // First try to get from API
      const res = await fetch(
        `/api/bookings?email=${session?.user?.email || ""}`
      );

      if (res.ok) {
        const data = await res.json();
        console.log("📦 API Response:", data);

        // Handle different response formats
        let bookings = [];
        if (Array.isArray(data)) {
          bookings = data;
        } else if (data.bookings && Array.isArray(data.bookings)) {
          bookings = data.bookings;
        } else {
          console.warn("⚠️ Unexpected API response format:", data);
        }

        if (bookings.length > 0) {
          const foundBooking = bookings.find(
            (b) => b._id === booking_id || b.id === booking_id
          );

          if (foundBooking) {
            setBooking(foundBooking);
            console.log("✅ Booking found via API");
            return;
          }
        }
      }

      // Fallback: try to get from localStorage
      console.log("🔄 Trying localStorage fallback...");
      const stored =
        localStorage.getItem("lastBooking") ||
        localStorage.getItem("selectedTrip");

      if (stored) {
        const parsedBooking = JSON.parse(stored);
        if (
          parsedBooking.id === booking_id ||
          parsedBooking._id === booking_id
        ) {
          setBooking(parsedBooking);
          console.log("✅ Booking found in localStorage");
          return;
        }
      }

      // If no booking found, create a minimal one for display
      console.log("⚠️ No booking found, creating minimal booking data");
      setBooking({
        id: booking_id,
        destination: "Your Destination",
        status: "confirmed",
        totalPrice: "TBD",
        email: session?.user?.email || "your-email@example.com",
      });
    } catch (err) {
      console.error("❌ Error fetching booking:", err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (booking_id) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [booking_id, session?.user?.email]);

  const handleViewTrips = () => {
    router.push("/my-trips");
  };

  const handlePlanAnother = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <PageWrapper>
        <SuccessCard>
          <LoadingSpinner />
          <p>Loading your booking details...</p>
        </SuccessCard>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <SuccessCard>
          <ErrorMessage>{error}</ErrorMessage>
          <ButtonGroup>
            <PrimaryButton onClick={handleViewTrips}>
              View My Trips
            </PrimaryButton>
            <SecondaryButton onClick={handlePlanAnother}>
              Plan Another Trip
            </SecondaryButton>
          </ButtonGroup>
        </SuccessCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SuccessCard>
        <CheckmarkCircle>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </CheckmarkCircle>

        <Title>Booking Confirmed!</Title>
        <Subtitle>
          {session_id
            ? "Your payment was successful and your trip is confirmed!"
            : "Your trip booking has been created successfully!"}
        </Subtitle>

        {booking && (
          <BookingDetails>
            <DetailRow>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <strong>Destination:</strong>{" "}
                {booking.destination || "Your Destination"}
              </div>
            </DetailRow>

            {booking.duration && (
              <DetailRow>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <div>
                  <strong>Duration:</strong> {booking.duration}
                </div>
              </DetailRow>
            )}

            {booking.startDate && booking.endDate && (
              <DetailRow>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <div>
                  <strong>Dates:</strong>{" "}
                  {new Date(booking.startDate).toLocaleDateString()} -{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </div>
              </DetailRow>
            )}

            <DetailRow>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <strong>Confirmation sent to:</strong> {booking.email}
              </div>
            </DetailRow>

            {booking.totalPrice && (
              <DetailRow>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <div>
                  <strong>Total Amount:</strong> ${booking.totalPrice}
                </div>
              </DetailRow>
            )}

            <DetailRow>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <div>
                <strong>Status:</strong>{" "}
                <span style={{ color: "#10b981" }}>✅ Confirmed</span>
              </div>
            </DetailRow>
          </BookingDetails>
        )}

        <ButtonGroup>
          <PrimaryButton onClick={handleViewTrips}>
            View My Trips Dashboard
          </PrimaryButton>
          <SecondaryButton onClick={handlePlanAnother}>
            Plan Another Trip
          </SecondaryButton>
        </ButtonGroup>

        {session_id && (
          <p
            style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#6b7280" }}
          >
            Session ID: {session_id}
          </p>
        )}
      </SuccessCard>
    </PageWrapper>
  );
}

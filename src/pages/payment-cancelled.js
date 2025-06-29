// pages/payment-cancelled.js - Payment cancelled/error page
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ErrorCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ef4444;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${shake} 0.5s ease-out;

  svg {
    width: 40px;
    height: 40px;
    color: white;
    stroke-width: 3;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #dc2626;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  background: #f9fafb;
  border: 2px solid #fee2e2;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
`;

const ErrorCode = styled.div`
  font-family: "Monaco", "Menlo", monospace;
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
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
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #ef4444;
  border: 2px solid #ef4444;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const InfoBox = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  color: #9a3412;

  .info-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

export default function PaymentCancelled() {
  const router = useRouter();
  const { booking_id, error, session_id } = router.query;
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Try to get booking data from localStorage
    const lastBooking = localStorage.getItem("lastBooking");
    if (lastBooking) {
      try {
        setBookingData(JSON.parse(lastBooking));
      } catch (e) {
        console.warn("Failed to parse booking data from localStorage");
      }
    }
  }, []);

  const handleTryAgain = () => {
    if (bookingData) {
      // Store the booking data for retry
      localStorage.setItem("retryBooking", JSON.stringify(bookingData));
    }
    router.push("/trip-builder");
  };

  const handleContactSupport = () => {
    window.location.href =
      "mailto:support@aitravelplanner.com?subject=Payment Issue - Booking " +
      booking_id;
  };

  return (
    <PageWrapper>
      <ErrorCard>
        <ErrorIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </ErrorIcon>

        <Title>Payment Cancelled</Title>
        <Subtitle>
          {error
            ? "We encountered an issue processing your payment."
            : "Your payment was cancelled. Don't worry, no charges were made to your account."}
        </Subtitle>

        {booking_id && (
          <ErrorDetails>
            <h4>Booking Information</h4>
            <p>
              <strong>Booking ID:</strong> {booking_id}
            </p>
            {session_id && (
              <p>
                <strong>Session ID:</strong> {session_id}
              </p>
            )}
            {bookingData && (
              <>
                <p>
                  <strong>Destination:</strong> {bookingData.destination}
                </p>
                <p>
                  <strong>Total Amount:</strong> ${bookingData.totalPrice}
                </p>
              </>
            )}
          </ErrorDetails>
        )}

        {error && <ErrorCode>Error Details: {error}</ErrorCode>}

        <InfoBox>
          <div className="info-title">What happened?</div>
          <ul>
            <li>Payment was cancelled or failed to process</li>
            <li>No money has been charged to your account</li>
            <li>Your booking is still saved and can be completed</li>
            <li>You can try again with the same or different payment method</li>
          </ul>
        </InfoBox>

        <InfoBox>
          <div className="info-title">Next Steps:</div>
          <ul>
            <li>Click "Try Again" to retry your booking</li>
            <li>Check your payment method details</li>
            <li>Contact your bank if the issue persists</li>
            <li>Reach out to our support team for assistance</li>
          </ul>
        </InfoBox>

        <ButtonGroup>
          <PrimaryButton onClick={handleTryAgain}>Try Again</PrimaryButton>
          <SecondaryButton onClick={handleStartOver}>
            Start Over
          </SecondaryButton>
          <SecondaryButton onClick={handleContactSupport}>
            Contact Support
          </SecondaryButton>
        </ButtonGroup>

        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.9rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Need immediate assistance? Email us at{" "}
          <a
            href="mailto:support@aitravelplanner.com"
            style={{ color: "#ef4444" }}
          >
            support@aitravelplanner.com
          </a>{" "}
          or call +1-800-TRAVEL-AI
        </p>
      </ErrorCard>
    </PageWrapper>
  );
}

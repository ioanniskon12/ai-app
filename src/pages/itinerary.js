// src/pages/itinerary.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import Head from "next/head";
import { generateItineraryPDF } from "../utils/generateItineraryPDF";
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiArrowLeft,
  FiShare2,
  FiPrinter,
  FiMail,
  FiCheckCircle,
  FiInfo,
  FiSun,
  FiCloud,
  FiCloudRain,
  FiUsers,
  FiLoader,
} from "react-icons/fi";
import {
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaMountain,
  FaCity,
  FaCamera,
  FaUtensils,
  FaTheaterMasks,
  FaShoppingBag,
  FaHiking,
  FaWifi,
  FaSwimmingPool,
  FaDumbbell,
  FaCoffee,
  FaParking,
  FaSpa,
  FaConciergeBell,
  FaBaby,
  FaChild,
} from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand, MdChildCare } from "react-icons/md";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Page Wrapper
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 4rem;
`;

// Hero Section
const HeroSection = styled.div`
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  padding: 4rem 0 8rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 3rem 0 6rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

// Booking Reference
const BookingReference = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.05em;
`;

// Main Container
const Container = styled.div`
  max-width: 900px;
  margin: -4rem auto 0;
  position: relative;
  z-index: 10;
  padding: 0 2rem;

  @media (max-width: 768px) {
    margin-top: -3rem;
    padding: 0 1rem;
  }
`;

// Loading State
const LoadingCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 5rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;

  svg {
    font-size: 4rem;
    color: #667eea;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 2rem;
  }

  p {
    font-size: 1.25rem;
    color: #6b7280;
    margin: 0;
  }
`;

// Itinerary Card
const ItineraryCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 2.5rem;
  border-bottom: 2px solid #e5e7eb;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #667eea 100%
    );
    background-size: 200% 200%;
    animation: ${gradient} 3s ease infinite;
  }
`;

const DestinationTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  svg {
    font-size: 2rem;
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TripMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 1rem;

  svg {
    color: #667eea;
    font-size: 1.25rem;
  }
`;

const CardBody = styled.div`
  padding: 2.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

// Section Styles
const Section = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #e5e7eb;
  animation: ${slideIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 1.5rem;
    color: #667eea;
  }
`;

const Label = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const Content = styled.div`
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.8;
  padding-left: 3.75rem;

  @media (max-width: 640px) {
    padding-left: 0;
    margin-top: 1rem;
  }
`;

// Weather Section
const WeatherContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  margin-top: 1rem;
  margin-left: 3.75rem;

  @media (max-width: 640px) {
    margin-left: 0;
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const WeatherDay = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .date {
    font-size: 0.75rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }

  .icon {
    font-size: 2rem;
    margin: 0.5rem 0;
  }

  .temp {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .condition {
    font-size: 0.75rem;
    opacity: 0.9;
    margin-top: 0.25rem;
  }
`;

// Flight Details
const FlightContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  padding-left: 3.75rem;

  @media (max-width: 640px) {
    padding-left: 0;
    margin-top: 1rem;
  }
`;

const FlightCard = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }
`;

const FlightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1f2937;

  svg {
    color: #667eea;
  }
`;

const FlightDetail = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
`;

// Hotel Section
const HotelContainer = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-left: 3.75rem;
  border: 2px solid #e5e7eb;

  @media (max-width: 640px) {
    margin-left: 0;
    margin-top: 1rem;
  }
`;

const HotelName = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Amenities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Amenity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  color: #4b5563;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  svg {
    color: #667eea;
  }
`;

// Activities
const ActivitiesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 3.75rem;
  display: grid;
  gap: 1rem;

  @media (max-width: 640px) {
    padding-left: 0;
    margin-top: 1rem;
  }
`;

const ActivityItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    transform: translateX(5px);
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%
    );
  }

  .activity-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    svg {
      font-size: 1.25rem;
      color: #667eea;
    }
  }

  .activity-price {
    font-weight: 700;
    color: #667eea;
  }
`;

// Passenger Info
const PassengerInfo = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-left: 3.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;

  @media (max-width: 640px) {
    margin-left: 0;
    margin-top: 1rem;
    gap: 1rem;
  }
`;

const PassengerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;

  svg {
    color: #667eea;
    font-size: 1.25rem;
  }

  .count {
    font-weight: 700;
    color: #1f2937;
    margin-right: 0.25rem;
  }
`;

// Price Section
const PriceSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  text-align: center;
  margin-top: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

const PriceBreakdown = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const PriceLabel = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const PriceAmount = styled.p`
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

// Actions Section
const ActionsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  background: ${(props) =>
    props.primary
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "white"};
  color: ${(props) => (props.primary ? "white" : "#6b7280")};
  border: 2px solid ${(props) => (props.primary ? "transparent" : "#e5e7eb")};
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-decoration: none;
  animation: ${(props) => (props.primary ? pulse : "none")} 2s ease-in-out
    infinite;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px
      ${(props) =>
        props.primary ? "rgba(102, 126, 234, 0.3)" : "rgba(0, 0, 0, 0.1)"};
    ${(props) =>
      !props.primary &&
      `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    `}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }
`;

const BackLink = styled(Link)`
  text-decoration: none;
  flex: 1;
`;

// Helpful Tips
const TipsSection = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 2px solid #fbbf24;
`;

const TipsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #92400e;

  svg {
    font-size: 1.5rem;
    color: #f59e0b;
  }
`;

const TipsList = styled.ul`
  margin: 0;
  padding-left: 2rem;
  color: #92400e;
  line-height: 1.8;
`;

// Activity icon mapping
const getActivityIcon = (activity) => {
  const iconMap = {
    beach: <FaUmbrellaBeach />,
    mountain: <FaMountain />,
    city: <FaCity />,
    photo: <FaCamera />,
    food: <FaUtensils />,
    culture: <FaTheaterMasks />,
    shopping: <FaShoppingBag />,
    hiking: <FaHiking />,
    family: <MdChildCare />,
    child: <FaChild />,
    baby: <FaBaby />,
  };

  const activityLower = activity.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (activityLower.includes(key)) return icon;
  }
  return <FaCity />; // default icon
};

// Get weather icon
const getWeatherIcon = (condition) => {
  const weatherMap = {
    sunny: <FiSun />,
    clear: <FiSun />,
    cloudy: <FiCloud />,
    rain: <FiCloudRain />,
    rainy: <FiCloudRain />,
  };

  const conditionLower = condition.toLowerCase();
  for (const [key, icon] of Object.entries(weatherMap)) {
    if (conditionLower.includes(key)) return icon;
  }
  return <FiCloud />; // default
};

// Main Component
export default function ItineraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    // Try to get trip from router query first (from success page)
    if (router.query.bookingId) {
      fetchBookingFromAPI(router.query.bookingId);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem("confirmedTrip");
      if (stored) {
        setTrip(JSON.parse(stored));
        setLoading(false);
      } else {
        // No trip data available
        setLoading(false);
      }
    }
  }, [router.query.bookingId]);

  const fetchBookingFromAPI = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`);
      if (res.ok) {
        const bookings = await res.json();
        const booking = bookings.find((b) => b._id === bookingId);
        if (booking) {
          // Transform booking data to match trip format
          const transformedTrip = {
            ...booking,
            Destination: booking.destination,
            StartDate: booking.startDate,
            EndDate: booking.endDate,
            Duration: booking.duration,
            Month: booking.month,
            Price: booking.price,
            Hotel: booking.hotel,
            selectedActivities: booking.activities || [],
            Weather: booking.weather,
            Flight: booking.flight,
            Reason: booking.reason,
            passengers: booking.passengers,
          };
          setTrip(transformedTrip);
        }
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container style={{ marginTop: "4rem" }}>
          <LoadingCard>
            <FiLoader />
            <p>Loading your itinerary...</p>
          </LoadingCard>
        </Container>
      </PageWrapper>
    );
  }

  if (!trip) {
    return (
      <PageWrapper>
        <Container
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            marginTop: "4rem",
          }}
        >
          <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>
            No itinerary found. Please complete a booking first.
          </div>
          <BackLink
            href="/"
            style={{ marginTop: "2rem", display: "inline-block" }}
          >
            <ActionButton>
              <FiArrowLeft />
              Back to Home
            </ActionButton>
          </BackLink>
        </Container>
      </PageWrapper>
    );
  }

  // Format dates for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const start = formatDate(trip.StartDate);
  const end = formatDate(trip.EndDate);

  const handleExportPDF = () => {
    generateItineraryPDF(trip);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${trip.Destination}`,
        text: `Check out my upcoming trip to ${trip.Destination} from ${start} to ${end}!`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      const shareUrl = `${window.location.origin}/itinerary${trip._id ? `?bookingId=${trip._id}` : ""}`;
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handleEmailItinerary = async () => {
    if (!session?.user?.email) {
      alert("Please log in to email your itinerary");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/send-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          trip: trip,
        }),
      });

      if (res.ok) {
        alert("Itinerary sent to your email!");
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate price breakdown
  const calculateBasePrice = () => {
    if (!trip.Price) return 0;
    const totalPrice = parseInt(trip.Price.replace(/[^0-9]/g, ""));
    const activitiesTotal =
      trip.selectedActivities?.reduce(
        (sum, act) => sum + (act.price || 0),
        0
      ) || 0;
    return totalPrice - activitiesTotal;
  };

  const hasChildren =
    trip.passengers &&
    (trip.passengers.children > 0 || trip.passengers.infants > 0);

  return (
    <>
      <Head>
        <title>{trip.Destination} Itinerary – AI Travel Planner</title>
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </Head>

      <PageWrapper>
        <HeroSection className="no-print">
          <HeroContent>
            <SuccessIcon>
              <FiCheckCircle />
            </SuccessIcon>
            <HeroTitle>Your Trip is Confirmed!</HeroTitle>
            <HeroSubtitle>
              Get ready for an amazing adventure. Here is everything you need to
              know.
            </HeroSubtitle>
            {trip._id && (
              <BookingReference>
                <FiInfo />
                Booking Reference: {trip._id}
              </BookingReference>
            )}
          </HeroContent>
        </HeroSection>

        <Container>
          <ItineraryCard>
            <CardHeader>
              <DestinationTitle>
                <FiMapPin />
                {trip.Destination}
              </DestinationTitle>
              <TripMeta>
                <MetaItem>
                  <FiCalendar />
                  {start} — {end}
                </MetaItem>
                <MetaItem>
                  <FiClock />
                  {trip.Duration}
                </MetaItem>
                {trip.passengers && (
                  <MetaItem>
                    <FiUsers />
                    {trip.passengers.adults +
                      (trip.passengers.children || 0) +
                      (trip.passengers.infants || 0)}{" "}
                    Travelers
                  </MetaItem>
                )}
              </TripMeta>
            </CardHeader>

            <CardBody>
              <Section delay="0s">
                <SectionHeader>
                  <SectionIcon>
                    <FiInfo />
                  </SectionIcon>
                  <Label>
                    Why Visit {trip.Destination} in {trip.Month}?
                  </Label>
                </SectionHeader>
                <Content>{trip.Reason}</Content>
              </Section>

              {trip.Weather && trip.Weather.forecast && (
                <Section delay="0.1s">
                  <SectionHeader>
                    <SectionIcon>
                      <FiSun />
                    </SectionIcon>
                    <Label>Weather Forecast</Label>
                  </SectionHeader>
                  <WeatherContainer>
                    <WeatherGrid>
                      {trip.Weather.forecast.map((day, index) => (
                        <WeatherDay key={index}>
                          <div className="date">
                            {formatShortDate(day.date)}
                          </div>
                          <div className="icon">
                            {getWeatherIcon(day.condition)}
                          </div>
                          <div className="temp">{day.temp}</div>
                          <div className="condition">{day.condition}</div>
                        </WeatherDay>
                      ))}
                    </WeatherGrid>
                  </WeatherContainer>
                </Section>
              )}

              {trip.passengers && (
                <Section delay="0.2s">
                  <SectionHeader>
                    <SectionIcon>
                      <FiUsers />
                    </SectionIcon>
                    <Label>Travelers</Label>
                  </SectionHeader>
                  <PassengerInfo>
                    {trip.passengers.adults > 0 && (
                      <PassengerItem>
                        <FiUsers />
                        <span className="count">{trip.passengers.adults}</span>
                        Adult{trip.passengers.adults > 1 ? "s" : ""}
                      </PassengerItem>
                    )}
                    {trip.passengers.children > 0 && (
                      <PassengerItem>
                        <FaChild />
                        <span className="count">
                          {trip.passengers.children}
                        </span>
                        Child{trip.passengers.children > 1 ? "ren" : ""}
                      </PassengerItem>
                    )}
                    {trip.passengers.infants > 0 && (
                      <PassengerItem>
                        <FaBaby />
                        <span className="count">{trip.passengers.infants}</span>
                        Infant{trip.passengers.infants > 1 ? "s" : ""}
                      </PassengerItem>
                    )}
                  </PassengerInfo>
                </Section>
              )}

              {trip.Flight && (
                <Section delay="0.3s">
                  <SectionHeader>
                    <SectionIcon>
                      <FaPlane />
                    </SectionIcon>
                    <Label>Flight Information</Label>
                  </SectionHeader>
                  <FlightContainer>
                    <FlightCard>
                      <FlightHeader>
                        <MdFlightTakeoff />
                        Outbound Flight
                      </FlightHeader>
                      <FlightDetail>{trip.Flight.Outbound}</FlightDetail>
                    </FlightCard>
                    <FlightCard>
                      <FlightHeader>
                        <MdFlightLand />
                        Return Flight
                      </FlightHeader>
                      <FlightDetail>{trip.Flight.Return}</FlightDetail>
                    </FlightCard>
                  </FlightContainer>
                </Section>
              )}

              <Section delay="0.4s">
                <SectionHeader>
                  <SectionIcon>
                    <FaHotel />
                  </SectionIcon>
                  <Label>Accommodation</Label>
                </SectionHeader>
                <HotelContainer>
                  <HotelName>{trip.Hotel}</HotelName>
                  <Amenities>
                    <Amenity>
                      <FaWifi /> Free WiFi
                    </Amenity>
                    <Amenity>
                      <FaSwimmingPool /> Pool
                    </Amenity>
                    <Amenity>
                      <FaDumbbell /> Gym
                    </Amenity>
                    <Amenity>
                      <FaCoffee /> Breakfast
                    </Amenity>
                    {hasChildren && (
                      <>
                        <Amenity>
                          <MdChildCare /> Kids Club
                        </Amenity>
                        <Amenity>
                          <FaBaby /> Baby Facilities
                        </Amenity>
                      </>
                    )}
                  </Amenities>
                </HotelContainer>
              </Section>

              {trip.selectedActivities?.length > 0 && (
                <Section delay="0.5s">
                  <SectionHeader>
                    <SectionIcon>
                      <FiCheckCircle />
                    </SectionIcon>
                    <Label>Selected Activities</Label>
                  </SectionHeader>
                  <ActivitiesList>
                    {trip.selectedActivities.map((act, i) => (
                      <ActivityItem key={i}>
                        <div className="activity-info">
                          {getActivityIcon(act.name)}
                          <span>{act.name}</span>
                        </div>
                        <span className="activity-price">${act.price}</span>
                      </ActivityItem>
                    ))}
                  </ActivitiesList>
                </Section>
              )}

              <PriceSection>
                <PriceBreakdown>
                  <PriceRow>
                    <span>Base Package</span>
                    <span>${calculateBasePrice()}</span>
                  </PriceRow>
                  {trip.selectedActivities?.map((act, i) => (
                    <PriceRow key={i}>
                      <span>{act.name}</span>
                      <span>${act.price}</span>
                    </PriceRow>
                  ))}
                </PriceBreakdown>
                <PriceLabel>Total Trip Cost</PriceLabel>
                <PriceAmount>{trip.Price}</PriceAmount>
              </PriceSection>

              <TipsSection>
                <TipsHeader>
                  <FiInfo />
                  Helpful Tips for Your Trip
                </TipsHeader>
                <TipsList>
                  <li>
                    Check passport validity (must be valid for 6 months from
                    travel date)
                  </li>
                  <li>Consider travel insurance for peace of mind</li>
                  <li>
                    Download offline maps for {trip.Destination.split(",")[0]}
                  </li>
                  <li>Keep digital copies of important documents</li>
                  {hasChildren && (
                    <>
                      <li>
                        Pack extra supplies for children (snacks, entertainment,
                        etc.)
                      </li>
                      <li>Check airline policies for traveling with infants</li>
                      <li>Book child-friendly restaurants in advance</li>
                    </>
                  )}
                </TipsList>
              </TipsSection>

              <ActionsSection className="no-print">
                <BackLink href="/my-trips">
                  <ActionButton>
                    <FiArrowLeft />
                    My Trips
                  </ActionButton>
                </BackLink>
                <ActionButton onClick={handleExportPDF} primary>
                  <FiDownload />
                  Download PDF
                </ActionButton>
                <ActionButton onClick={handlePrint}>
                  <FiPrinter />
                  Print
                </ActionButton>
                <ActionButton
                  onClick={handleEmailItinerary}
                  disabled={emailLoading}
                >
                  <FiMail />
                  {emailLoading ? "Sending..." : "Email"}
                </ActionButton>
                <ActionButton onClick={handleShare}>
                  <FiShare2 />
                  Share
                </ActionButton>
              </ActionsSection>
            </CardBody>
          </ItineraryCard>
        </Container>
      </PageWrapper>
    </>
  );
}

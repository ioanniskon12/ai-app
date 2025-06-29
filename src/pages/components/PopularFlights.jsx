// File: pages/PopularFlights.js

import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import Image from "next/image";
import { popularRoutes } from "@/data/popularRoutes";
import {
  FiMapPin,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import { FaPlane } from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Main Container - Full Width
const Section = styled.section`
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  padding: 5rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h2`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    color: #667eea;
    animation: ${float} 3s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding: 0 3rem;
  animation: ${fadeIn} 1s ease-out 0.2s both;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Carousel = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 0 2rem;
  scroll-snap-type: x mandatory;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0.5rem 0 1.5rem;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const Card = styled.div`
  position: relative;
  flex: 0 0 400px;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${slideIn} 0.6s ease-out ${(props) => props.index * 0.1}s both;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 1;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

    &::before {
      background: linear-gradient(
        180deg,
        rgba(102, 126, 234, 0.3) 0%,
        rgba(118, 75, 162, 0.3) 50%,
        rgba(0, 0, 0, 0.9) 100%
      );
    }

    .card-content {
      transform: translateY(-10px);
    }

    .price-tag {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    flex: 0 0 300px;
    height: 400px;
  }

  @media (max-width: 480px) {
    flex: 0 0 280px;
    height: 380px;
  }
`;

const CardImageWrapper = styled.div`
  position: absolute;
  inset: 0;
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RouteText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ArrowIcon = styled(FaPlane)`
  font-size: 1.25rem;
  transform: rotate(45deg);
  color: #fbbf24;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
`;

const DestinationName = styled.h3`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.125rem;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  animation: ${pulse} 2s ease-in-out infinite;

  span {
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
`;

const FlightTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 1rem;

  svg {
    color: #fbbf24;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const CTAButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
  background: white;
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    svg {
      color: white;
    }
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: #667eea;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
    display: none;
  }
`;

const PrevButton = styled(ArrowButton)`
  left: 1rem;
`;

const NextButton = styled(ArrowButton)`
  right: 1rem;
`;

const LoadingGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: hidden;
  padding: 1rem 0;
`;

const LoadingCard = styled.div`
  flex: 0 0 400px;
  height: 500px;
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 1000px 100%;
  border-radius: 24px;
  animation: ${shimmer} 2s linear infinite;

  @media (max-width: 768px) {
    flex: 0 0 300px;
    height: 400px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;

  svg {
    font-size: 4rem;
    color: #e5e7eb;
    margin-bottom: 1rem;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;

  svg {
    font-size: 1rem;
  }
`;

// Main Component
export default function PopularFlights() {
  const [userLocation, setUserLocation] = useState(null);
  const [cityName, setCityName] = useState("Larnaca");
  const [routes, setRoutes] = useState(popularRoutes.Cyprus.routes);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  // Fetch user location from IP API
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        const country = data.country_name || "default";
        const routeData = popularRoutes[country] || popularRoutes.default;

        setUserLocation(country);
        setCityName(data.city || routeData.city);
        setRoutes(routeData.routes);
      } catch (err) {
        console.error("Error fetching location:", err);
        setRoutes(popularRoutes.default.routes);
        setCityName(popularRoutes.default.city);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Handle route click
  const handleRouteClick = (destination) => {
    if (typeof window !== "undefined") {
      const tripData = generateTripData(destination);
      localStorage.setItem("selectedTrip", JSON.stringify(tripData));
      window.location.href = `/trip/1`;
    }
  };

  // Generate trip data
  const generateTripData = (destination) => {
    const trips = {
      Paris: {
        Destination: "Paris",
        Month: "May",
        Reason:
          "Experience romance, art, and culture in the City of Light. Visit iconic landmarks like the Eiffel Tower, explore world-class museums, and indulge in exquisite French cuisine.",
        Duration: "5 days",
        StartDate: "2025-05-15",
        EndDate: "2025-05-20",
        Flight: {
          Outbound: `${cityName} → CDG, 9:00 AM - 11:30 AM`,
          Return: `CDG → ${cityName}, 6:00 PM - 8:30 PM`,
        },
        Hotel: "Le Marais Boutique Hotel",
        availableActivities: [
          { name: "Eiffel Tower Skip-the-Line Tour", price: 85 },
          { name: "Louvre Museum Guided Tour", price: 65 },
          { name: "Seine River Dinner Cruise", price: 120 },
          { name: "Versailles Day Trip", price: 95 },
          { name: "Montmartre Food Tour", price: 75 },
        ],
        Price: "$2200",
        basePrice: 2200,
        DestinationImage:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      },
      Rome: {
        Destination: "Rome",
        Month: "April",
        Reason:
          "Explore ancient history and indulge in Italian cuisine. Walk through the Colosseum, marvel at the Sistine Chapel, and enjoy authentic pasta in charming trattorias.",
        Duration: "5 days",
        StartDate: "2025-04-10",
        EndDate: "2025-04-15",
        Flight: {
          Outbound: `${cityName} → FCO, 8:00 AM - 10:30 AM`,
          Return: `FCO → ${cityName}, 5:00 PM - 7:30 PM`,
        },
        Hotel: "Hotel Artemide",
        availableActivities: [
          { name: "Colosseum & Roman Forum Tour", price: 75 },
          { name: "Vatican Museums & Sistine Chapel", price: 95 },
          { name: "Pasta Making Class", price: 85 },
          { name: "Trastevere Food Tour", price: 70 },
          { name: "Borghese Gallery Tour", price: 55 },
        ],
        Price: "$1950",
        basePrice: 1950,
        DestinationImage:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
      },
      Barcelona: {
        Destination: "Barcelona",
        Month: "June",
        Reason:
          "Enjoy beaches, architecture, and vibrant nightlife. Discover Gaudí's masterpieces, relax on Mediterranean beaches, and experience the energy of Las Ramblas.",
        Duration: "5 days",
        StartDate: "2025-06-05",
        EndDate: "2025-06-10",
        Flight: {
          Outbound: `${cityName} → BCN, 10:00 AM - 12:30 PM`,
          Return: `BCN → ${cityName}, 7:00 PM - 9:30 PM`,
        },
        Hotel: "Hotel Casa Fuster",
        availableActivities: [
          { name: "Sagrada Familia Fast Track", price: 65 },
          { name: "Park Güell Guided Tour", price: 45 },
          { name: "Tapas & Wine Tour", price: 80 },
          { name: "Camp Nou Stadium Tour", price: 55 },
          { name: "Flamenco Show & Dinner", price: 90 },
        ],
        Price: "$1800",
        basePrice: 1800,
        DestinationImage:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
      },
      Dubai: {
        Destination: "Dubai",
        Month: "March",
        Reason:
          "Experience luxury, shopping, and desert adventures. Shop in world-class malls, dine in Michelin-starred restaurants, and enjoy thrilling desert safaris.",
        Duration: "5 days",
        StartDate: "2025-03-20",
        EndDate: "2025-03-25",
        Flight: {
          Outbound: `${cityName} → DXB, 11:00 PM - 7:00 AM+1`,
          Return: `DXB → ${cityName}, 2:00 AM - 8:00 AM`,
        },
        Hotel: "Atlantis The Palm",
        availableActivities: [
          { name: "Desert Safari with BBQ Dinner", price: 120 },
          { name: "Burj Khalifa Observation Deck", price: 95 },
          { name: "Dubai Mall & Aquarium", price: 65 },
          { name: "Dhow Cruise Dinner", price: 85 },
          { name: "Ski Dubai Snow Park", price: 75 },
        ],
        Price: "$2500",
        basePrice: 2500,
        DestinationImage:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
      },
      London: {
        Destination: "London",
        Month: "July",
        Reason:
          "Discover history, culture, and British traditions. Visit royal palaces, world-class museums, enjoy West End shows, and experience the charm of British pubs.",
        Duration: "5 days",
        StartDate: "2025-07-10",
        EndDate: "2025-07-15",
        Flight: {
          Outbound: `${cityName} → LHR, 9:00 AM - 11:00 AM`,
          Return: `LHR → ${cityName}, 6:00 PM - 8:00 PM`,
        },
        Hotel: "The Zetter Townhouse",
        availableActivities: [
          { name: "Tower of London & Crown Jewels", price: 65 },
          { name: "West End Theatre Show", price: 85 },
          { name: "British Museum Tour", price: 45 },
          { name: "Thames River Cruise", price: 55 },
          { name: "Harry Potter Studio Tour", price: 110 },
        ],
        Price: "$2100",
        basePrice: 2100,
        DestinationImage:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
      },
      Athens: {
        Destination: "Athens",
        Month: "May",
        Reason:
          "Walk through ancient history and enjoy Mediterranean life. Explore the Acropolis, wander through Plaka's charming streets, and savor delicious Greek cuisine.",
        Duration: "5 days",
        StartDate: "2025-05-20",
        EndDate: "2025-05-25",
        Flight: {
          Outbound: `${cityName} → ATH, 7:00 AM - 9:30 AM`,
          Return: `ATH → ${cityName}, 4:00 PM - 6:30 PM`,
        },
        Hotel: "Electra Metropolis Athens",
        availableActivities: [
          { name: "Acropolis & Parthenon Tour", price: 55 },
          { name: "Greek Cooking Class", price: 75 },
          { name: "Day Trip to Delphi", price: 95 },
          { name: "Athens Food Walking Tour", price: 65 },
          { name: "Sunset at Cape Sounion", price: 85 },
        ],
        Price: "$1600",
        basePrice: 1600,
        DestinationImage:
          "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800",
      },
    };

    const trip = trips[destination] || {
      Destination: destination,
      Month: "June",
      Reason: `Explore the beauty and culture of ${destination}. Discover hidden gems, experience local traditions, and create unforgettable memories in this amazing destination.`,
      Duration: "5 days",
      StartDate: "2025-06-01",
      EndDate: "2025-06-06",
      Flight: {
        Outbound: `${cityName} → ${destination}, 9:00 AM - 12:00 PM`,
        Return: `${destination} → ${cityName}, 5:00 PM - 8:00 PM`,
      },
      Hotel: `${destination} Grand Hotel`,
      availableActivities: [
        { name: `${destination} City Tour`, price: 65 },
        { name: "Local Food Experience", price: 75 },
        { name: "Cultural Museum Visit", price: 45 },
        { name: "Day Trip Adventure", price: 95 },
        { name: "Evening Entertainment", price: 85 },
      ],
      Price: "$1800",
      basePrice: 1800,
      DestinationImage: `https://source.unsplash.com/800x600/?${destination},travel`,
    };

    trip.id = Date.now().toString();
    trip.generatedAt = new Date().toISOString();
    return trip;
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Mock prices for display
  const getPriceForRoute = (destination) => {
    const prices = {
      Paris: "From $899",
      Rome: "From $749",
      Barcelona: "From $699",
      Dubai: "From $1,199",
      London: "From $849",
      Athens: "From $599",
    };
    return prices[destination] || "From $799";
  };

  // Mock flight times
  const getFlightTime = (destination) => {
    const times = {
      Paris: "2h 30m",
      Rome: "2h 30m",
      Barcelona: "2h 30m",
      Dubai: "5h 30m",
      London: "2h 00m",
      Athens: "2h 30m",
    };
    return times[destination] || "3h 00m";
  };

  // Loading state
  if (loading) {
    return (
      <Section>
        <Container>
          <Header>
            <Title>Popular Flights</Title>
            <Subtitle>
              <FiMapPin />
              Discovering your location...
            </Subtitle>
          </Header>
        </Container>
        <CarouselWrapper>
          <LoadingGrid>
            {[...Array(6)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </LoadingGrid>
        </CarouselWrapper>
      </Section>
    );
  }

  // Empty state
  if (!routes || routes.length === 0) {
    return (
      <Section>
        <Container>
          <Header>
            <Title>Popular Flights</Title>
          </Header>
          <EmptyState>
            <FaPlane />
            <p>No routes available at the moment.</p>
            <p>Check back later for more destinations.</p>
          </EmptyState>
        </Container>
      </Section>
    );
  }

  // Main render
  return (
    <Section>
      <Container>
        <Header>
          <Title>Popular Flights</Title>
          <Subtitle>
            <FiTrendingUp />
            Trending destinations from {cityName}
          </Subtitle>
        </Header>
      </Container>

      <CarouselWrapper>
        <PrevButton onClick={scrollLeft} aria-label="Scroll Left">
          <FiChevronLeft />
        </PrevButton>

        <Carousel ref={carouselRef}>
          {routes.map((route, idx) => (
            <Card
              key={idx}
              index={idx}
              onClick={() => handleRouteClick(route.destination)}
            >
              <CardImageWrapper>
                <Image
                  src={route.image}
                  alt={route.destination}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 300px, 400px"
                  priority={idx < 3}
                />
              </CardImageWrapper>

              <PriceTag className="price-tag">
                {getPriceForRoute(route.destination)}
                <span>/person</span>
              </PriceTag>

              <CardContent className="card-content">
                <RouteInfo>
                  <RouteText>
                    {cityName}
                    <ArrowIcon />
                    {route.destination}
                  </RouteText>
                </RouteInfo>

                <DestinationName>{route.destination}</DestinationName>

                <FlightTime>
                  <FiClock />
                  {getFlightTime(route.destination)} direct flight
                </FlightTime>

                <CTAButton>
                  View Details
                  <FiChevronRight />
                </CTAButton>

                <Badge>
                  <FiTrendingUp />
                  Popular Route
                </Badge>
              </CardContent>
            </Card>
          ))}
        </Carousel>

        <NextButton onClick={scrollRight} aria-label="Scroll Right">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NextButton>
      </CarouselWrapper>
    </Section>
  );
}

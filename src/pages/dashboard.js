// pages/dashboard.js - Modern User Dashboard
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiUser,
  FiSettings,
  FiHeart,
  FiClock,
  FiDownload,
  FiShare2,
  FiStar,
  FiTrendingUp,
  FiGlobe,
  FiAirplay,
  FiBookmark,
  FiCamera,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaMountain,
  FaCity,
  FaPassport,
  FaChild,
} from "react-icons/fa";
import { MdChildCare, MdFlight } from "react-icons/md";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main Container
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E");
    z-index: -1;
  }
`;

// Header Section
const DashboardHeader = styled.div`
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.9) 0%,
    rgba(118, 75, 162, 0.9) 25%,
    rgba(240, 147, 251, 0.9) 50%,
    rgba(79, 172, 254, 0.9) 75%,
    rgba(102, 126, 234, 0.9) 100%
  );
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  padding: 6rem 0 6rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const QuickActionButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  margin: 0 0.5rem;
  animation: ${fadeIn} 1s ease-out 0.4s both;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    margin: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;

// Content Section
const ContentSection = styled.div`
  max-width: 1200px;
  margin: -3rem auto 0;
  padding: 0 2rem 4rem;
  position: relative;
  z-index: 2;
`;

// Stats Cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out 0.6s both;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) =>
      props.gradient || "linear-gradient(90deg, #667eea, #764ba2)"};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${(props) => props.color || "rgba(102, 126, 234, 0.1)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${(props) => props.iconColor || "#667eea"};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
`;

const StatTrend = styled.div`
  color: ${(props) => (props.positive ? "#10b981" : "#ef4444")};
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Tabs
const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabsList = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 0.5rem;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow-x: auto;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button`
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "transparent"};
  color: ${(props) => (props.active ? "white" : "#6b7280")};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
        : "rgba(102, 126, 234, 0.1)"};
    color: ${(props) => (props.active ? "white" : "#667eea")};
  }

  svg {
    font-size: 1rem;
  }
`;

// Trips Grid
const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: ${slideIn} 0.8s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const TripCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
  }
`;

const TripImage = styled.div`
  height: 200px;
  background: ${(props) =>
    props.image
      ? `linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)), url(${props.image})`
      : "linear-gradient(135deg, #667eea, #764ba2)"};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;

  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  }
`;

const TripStatus = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${(props) =>
    props.status === "upcoming"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : props.status === "ongoing"
        ? "linear-gradient(135deg, #f59e0b, #d97706)"
        : "linear-gradient(135deg, #6b7280, #4b5563)"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const TripDestination = styled.h3`
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const TripContent = styled.div`
  padding: 1.5rem;
`;

const TripMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TripMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;

  svg {
    color: #667eea;
    font-size: 1rem;
  }
`;

const TripPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;

  span {
    font-size: 0.9rem;
    color: #6b7280;
    font-weight: 500;
  }
`;

const TripActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "rgba(107, 114, 128, 0.1)"};
  color: ${(props) => (props.variant === "primary" ? "white" : "#374151")};
  border: ${(props) =>
    props.variant === "primary"
      ? "none"
      : "1px solid rgba(107, 114, 128, 0.2)"};
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  flex: 1;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background: ${(props) =>
      props.variant === "primary"
        ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
        : "rgba(107, 114, 128, 0.15)"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 1rem;
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const EmptyButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }

  svg {
    font-size: 1.2rem;
  }
`;

// Recent Activity Section
const RecentActivityCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
    font-size: 1.5rem;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(props) => props.color || "rgba(102, 126, 234, 0.1)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${(props) => props.iconColor || "#667eea"};
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetchUserData();
    }
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/user/dashboard?email=${session.user.email}`
      );

      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromDates = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  };

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === "all") return true;
    const status = getStatusFromDates(trip.startDate, trip.endDate);
    return status === activeTab;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNewTrip = () => {
    router.push("/");
  };

  const handleEditTrip = (tripId) => {
    // Navigate to edit trip page or open modal
    console.log("Edit trip:", tripId);
  };

  const handleCancelTrip = async (tripId) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const res = await fetch(`/api/bookings/${tripId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUserData();
      }
    } catch (error) {
      console.error("Error canceling trip:", error);
    }
  };

  const recentActivities = [
    {
      icon: <FaPlane />,
      color: "rgba(59, 130, 246, 0.1)",
      iconColor: "#3b82f6",
      title: "Trip to Paris booked",
      time: "2 hours ago",
    },
    {
      icon: <FiHeart />,
      color: "rgba(239, 68, 68, 0.1)",
      iconColor: "#ef4444",
      title: "Added Rome to wishlist",
      time: "1 day ago",
    },
    {
      icon: <FiStar />,
      color: "rgba(245, 158, 11, 0.1)",
      iconColor: "#f59e0b",
      title: "Reviewed Tokyo trip",
      time: "3 days ago",
    },
  ];

  if (status === "loading" || loading) {
    return (
      <DashboardContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              color: "#667eea",
            }}
          >
            Loading your dashboard...
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <WelcomeTitle>
            Welcome back, {session?.user?.name?.split(" ")[0] || "Traveler"}! ✈️
          </WelcomeTitle>
          <WelcomeSubtitle>
            Ready for your next adventure? Let&apos;s explore the world
            together.
          </WelcomeSubtitle>
          <div>
            <QuickActionButton onClick={handleNewTrip}>
              <FiPlus />
              Plan New Trip
            </QuickActionButton>
            <QuickActionButton onClick={() => router.push("/profile")}>
              <FiSettings />
              Profile Settings
            </QuickActionButton>
          </div>
        </HeaderContent>
      </DashboardHeader>

      <ContentSection>
        <StatsGrid>
          <StatCard gradient="linear-gradient(90deg, #667eea, #764ba2)">
            <StatHeader>
              <StatIcon color="rgba(102, 126, 234, 0.1)" iconColor="#667eea">
                <FaPlane />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalTrips}</StatValue>
            <StatLabel>Total Trips</StatLabel>
            <StatTrend positive={stats.totalTrips > 0}>
              <FiTrendingUp />
              Your travel journey
            </StatTrend>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #10b981, #059669)">
            <StatHeader>
              <StatIcon color="rgba(16, 185, 129, 0.1)" iconColor="#10b981">
                <FiCalendar />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.upcomingTrips}</StatValue>
            <StatLabel>Upcoming Trips</StatLabel>
            <StatTrend positive={stats.upcomingTrips > 0}>
              <FiArrowRight />
              Adventure awaits
            </StatTrend>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #f59e0b, #d97706)">
            <StatHeader>
              <StatIcon color="rgba(245, 158, 11, 0.1)" iconColor="#f59e0b">
                <FiStar />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.completedTrips}</StatValue>
            <StatLabel>Completed Trips</StatLabel>
            <StatTrend positive={stats.completedTrips > 0}>
              <FiBookmark />
              Memories made
            </StatTrend>
          </StatCard>

          <StatCard gradient="linear-gradient(90deg, #8b5cf6, #7c3aed)">
            <StatHeader>
              <StatIcon color="rgba(139, 92, 246, 0.1)" iconColor="#8b5cf6">
                <FiDollarSign />
              </StatIcon>
            </StatHeader>
            <StatValue>${stats.totalSpent?.toLocaleString() || 0}</StatValue>
            <StatLabel>Total Invested</StatLabel>
            <StatTrend positive={stats.totalSpent > 0}>
              <FiGlobe />
              In experiences
            </StatTrend>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          <TabsList>
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              <FiAirplay />
              All Trips ({trips.length})
            </TabButton>
            <TabButton
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            >
              <FiCalendar />
              Upcoming ({stats.upcomingTrips})
            </TabButton>
            <TabButton
              active={activeTab === "ongoing"}
              onClick={() => setActiveTab("ongoing")}
            >
              <FiClock />
              Current Trip
            </TabButton>
            <TabButton
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
            >
              <FiStar />
              Completed ({stats.completedTrips})
            </TabButton>
          </TabsList>
        </TabsContainer>

        {filteredTrips.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              {activeTab === "upcoming" ? (
                <FiCalendar />
              ) : activeTab === "completed" ? (
                <FiStar />
              ) : activeTab === "ongoing" ? (
                <FiClock />
              ) : (
                <FaPlane />
              )}
            </EmptyIcon>
            <EmptyTitle>
              {activeTab === "upcoming"
                ? "No upcoming trips"
                : activeTab === "completed"
                  ? "No completed trips yet"
                  : activeTab === "ongoing"
                    ? "No current trips"
                    : "No trips found"}
            </EmptyTitle>
            <EmptyText>
              {activeTab === "upcoming"
                ? "Start planning your next adventure! Use our AI to create the perfect trip tailored to your preferences."
                : activeTab === "completed"
                  ? "Once you complete your first trip, it will appear here with all your travel memories."
                  : activeTab === "ongoing"
                    ? "You don't have any trips happening right now."
                    : "Begin your travel journey by planning your first AI-generated trip."}
            </EmptyText>
            <EmptyButton onClick={handleNewTrip}>
              <FiPlus />
              Plan Your First Trip
            </EmptyButton>
          </EmptyState>
        ) : (
          <TripsGrid>
            {filteredTrips.map((trip) => {
              const status = getStatusFromDates(trip.startDate, trip.endDate);
              const hasChildren =
                trip.passengers &&
                (trip.passengers.children > 0 || trip.passengers.infants > 0);

              return (
                <TripCard key={trip._id || trip.id}>
                  <TripImage
                    image={trip.destinationImage || trip.DestinationImage}
                  >
                    <TripStatus status={status}>
                      {status === "upcoming"
                        ? "✈️ Upcoming"
                        : status === "ongoing"
                          ? "🌍 Current"
                          : "✅ Completed"}
                    </TripStatus>
                    <TripDestination>
                      {trip.destination || trip.Destination}
                      {hasChildren && (
                        <span
                          style={{ fontSize: "1rem", marginLeft: "0.5rem" }}
                        >
                          👨‍👩‍👧‍👦
                        </span>
                      )}
                    </TripDestination>
                  </TripImage>

                  <TripContent>
                    <TripMeta>
                      <TripMetaItem>
                        <FiCalendar />
                        {formatDate(trip.startDate || trip.StartDate)}
                      </TripMetaItem>
                      <TripMetaItem>
                        <FiClock />
                        {trip.duration || trip.Duration}
                      </TripMetaItem>
                      <TripMetaItem>
                        <FiMapPin />
                        {trip.destination?.split(",")[0] ||
                          trip.Destination?.split(",")[0]}
                      </TripMetaItem>
                      <TripMetaItem>
                        <FiUser />
                        {trip.passengers?.adults || 1} +{" "}
                        {(trip.passengers?.children || 0) +
                          (trip.passengers?.infants || 0)}{" "}
                        travelers
                      </TripMetaItem>
                    </TripMeta>

                    <TripPrice>
                      $
                      {parseInt(
                        trip.price?.replace(/[^0-9]/g, "") ||
                          trip.Price?.replace(/[^0-9]/g, "") ||
                          0
                      ).toLocaleString()}
                      <span> total</span>
                    </TripPrice>

                    <TripActions>
                      {status === "upcoming" && (
                        <>
                          <ActionButton
                            variant="primary"
                            onClick={() =>
                              router.push(`/trip/${trip._id || trip.id}`)
                            }
                          >
                            <FiEdit3 />
                            View Details
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleEditTrip(trip._id || trip.id)}
                          >
                            <FiSettings />
                            Modify
                          </ActionButton>
                        </>
                      )}

                      {status === "ongoing" && (
                        <>
                          <ActionButton variant="primary">
                            <FiCamera />
                            Add Photos
                          </ActionButton>
                          <ActionButton>
                            <FiShare2 />
                            Share
                          </ActionButton>
                        </>
                      )}

                      {status === "completed" && (
                        <>
                          <ActionButton variant="primary">
                            <FiStar />
                            Review Trip
                          </ActionButton>
                          <ActionButton>
                            <FiDownload />
                            Download
                          </ActionButton>
                        </>
                      )}

                      {status !== "completed" && (
                        <ActionButton
                          onClick={() => handleCancelTrip(trip._id || trip.id)}
                        >
                          <FiTrash2 />
                          Cancel
                        </ActionButton>
                      )}
                    </TripActions>
                  </TripContent>
                </TripCard>
              );
            })}
          </TripsGrid>
        )}

        {/* Recent Activity Section */}
        <RecentActivityCard>
          <SectionTitle>
            <FiClock />
            Recent Activity
          </SectionTitle>

          <ActivityList>
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon
                  color={activity.color}
                  iconColor={activity.iconColor}
                >
                  {activity.icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivityCard>

        {/* Quick Actions */}
        <RecentActivityCard>
          <SectionTitle>
            <FiBookmark />
            Quick Actions
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <ActionButton
              variant="primary"
              onClick={handleNewTrip}
              style={{ padding: "1.5rem", fontSize: "1.1rem" }}
            >
              <FiPlus />
              Plan New Trip
            </ActionButton>

            <ActionButton
              onClick={() => router.push("/wishlist")}
              style={{ padding: "1.5rem", fontSize: "1.1rem" }}
            >
              <FiHeart />
              View Wishlist
            </ActionButton>

            <ActionButton
              onClick={() => router.push("/profile")}
              style={{ padding: "1.5rem", fontSize: "1.1rem" }}
            >
              <FiUser />
              Edit Profile
            </ActionButton>

            <ActionButton
              onClick={() => router.push("/support")}
              style={{ padding: "1.5rem", fontSize: "1.1rem" }}
            >
              <FiSettings />
              Get Support
            </ActionButton>
          </div>
        </RecentActivityCard>
      </ContentSection>
    </DashboardContainer>
  );
}

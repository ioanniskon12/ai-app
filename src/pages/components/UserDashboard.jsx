// components/UserDashboard.jsx - Personal Travel Analytics Dashboard
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useSession } from "next-auth/react";
import {
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiClock,
  FiEdit3,
  FiRefreshCw,
  FiUser,
  FiHeart,
  FiTarget,
  FiGift,
} from "react-icons/fi";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    animation: ${(props) =>
      props.loading ? "spin 1s linear infinite" : "none"};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CardIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: ${(props) => props.color || "#667eea"};
  animation: ${float} 3s ease-in-out infinite;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${(props) => props.percentage}%;
  transition: width 1s ease-out;
  border-radius: 4px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const AchievementCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  border-radius: 12px;
  margin-bottom: 1rem;
  animation: ${pulse} 2s ease-in-out infinite;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AchievementIcon = styled.div`
  font-size: 2rem;
  animation: ${float} 2s ease-in-out infinite;
`;

const AchievementText = styled.div`
  h4 {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
    color: #2d3748;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #4a5568;
  }
`;

const RecommendationCard = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 4px solid #667eea;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #2d3748;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #4a5568;
  }
`;

const TripCard = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #2d3748;
  }

  p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: #64748b;
  }
`;

const LoadingShimmer = styled.div`
  height: 200px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 12px;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  margin: 1rem 0;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const UserDashboard = () => {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/analytics");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!session) {
    return (
      <DashboardContainer>
        <ErrorMessage>Please log in to view your travel dashboard</ErrorMessage>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Header>
          <WelcomeTitle>Travel Dashboard</WelcomeTitle>
          <ErrorMessage>Error loading your travel data: {error}</ErrorMessage>
          <RefreshButton onClick={fetchAnalytics}>
            <FiRefreshCw />
            Try Again
          </RefreshButton>
        </Header>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeTitle>
          Welcome back, {session.user.name?.split(" ")[0]}! ✈️
        </WelcomeTitle>
        <WelcomeSubtitle>
          Here's your personalized travel dashboard
        </WelcomeSubtitle>
        <RefreshButton
          onClick={fetchAnalytics}
          disabled={loading}
          loading={loading}
        >
          <FiRefreshCw />
          Refresh Data
        </RefreshButton>
      </Header>

      {loading ? (
        <ContentGrid>
          {[...Array(6)].map((_, i) => (
            <Card key={i} delay={`${i * 0.1}s`}>
              <LoadingShimmer />
            </Card>
          ))}
        </ContentGrid>
      ) : (
        <ContentGrid>
          {/* Overview Stats */}
          <Card delay="0s">
            <CardHeader>
              <CardIcon color="#10b981">
                <FiCalendar />
              </CardIcon>
              <CardTitle>Travel Overview</CardTitle>
            </CardHeader>
            <MetricValue>{analytics?.overview?.totalBookings || 0}</MetricValue>
            <MetricLabel>Total Trips Booked</MetricLabel>
            <ListItem>
              <span>Completed</span>
              <strong>{analytics?.overview?.completedBookings || 0}</strong>
            </ListItem>
            <ListItem>
              <span>Confirmed</span>
              <strong>{analytics?.overview?.confirmedBookings || 0}</strong>
            </ListItem>
            <ListItem>
              <span>Destinations Visited</span>
              <strong>{analytics?.overview?.destinationsVisited || 0}</strong>
            </ListItem>
          </Card>

          {/* Spending Analytics */}
          <Card delay="0.1s">
            <CardHeader>
              <CardIcon color="#f59e0b">
                <FiDollarSign />
              </CardIcon>
              <CardTitle>Travel Spending</CardTitle>
            </CardHeader>
            <MetricValue>
              {formatCurrency(analytics?.overview?.totalSpent || 0)}
            </MetricValue>
            <MetricLabel>Total Amount Spent</MetricLabel>
            {analytics?.spending?.average > 0 && (
              <ListItem>
                <span>Average per Trip</span>
                <strong>{formatCurrency(analytics.spending.average)}</strong>
              </ListItem>
            )}
            <ListItem>
              <span>Member Since</span>
              <strong>{formatDate(analytics?.overview?.memberSince)}</strong>
            </ListItem>
          </Card>

          {/* Travel Patterns */}
          <Card delay="0.2s">
            <CardHeader>
              <CardIcon color="#8b5cf6">
                <FiTrendingUp />
              </CardIcon>
              <CardTitle>Travel Patterns</CardTitle>
            </CardHeader>
            <MetricValue>
              {analytics?.travelPatterns?.averageTripsPerYear || 0}
            </MetricValue>
            <MetricLabel>Trips Per Year</MetricLabel>
            <ListItem>
              <span>Travel Style</span>
              <strong style={{ textTransform: "capitalize" }}>
                {analytics?.travelPatterns?.travelFrequency || "Occasional"}
              </strong>
            </ListItem>
            {analytics?.travelPatterns?.mostPopularMonth && (
              <ListItem>
                <span>Favorite Month</span>
                <strong>{analytics.travelPatterns.mostPopularMonth}</strong>
              </ListItem>
            )}
            {analytics?.travelPatterns?.averageTripDuration > 0 && (
              <ListItem>
                <span>Avg Trip Length</span>
                <strong>
                  {analytics.travelPatterns.averageTripDuration} days
                </strong>
              </ListItem>
            )}
          </Card>

          {/* Favorite Destinations */}
          <Card delay="0.3s">
            <CardHeader>
              <CardIcon color="#ef4444">
                <FiMapPin />
              </CardIcon>
              <CardTitle>Favorite Destinations</CardTitle>
            </CardHeader>
            {analytics?.destinations?.favorites?.length > 0 ? (
              analytics.destinations.favorites
                .slice(0, 5)
                .map((dest, index) => (
                  <ListItem key={index}>
                    <span>{dest.destination}</span>
                    <strong>
                      {dest.count} visit{dest.count > 1 ? "s" : ""}
                    </strong>
                  </ListItem>
                ))
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No favorite destinations yet. Book your first trip!
              </p>
            )}
          </Card>

          {/* Upcoming Trips */}
          <Card delay="0.4s">
            <CardHeader>
              <CardIcon color="#06b6d4">
                <FiClock />
              </CardIcon>
              <CardTitle>Upcoming Adventures</CardTitle>
            </CardHeader>
            {analytics?.trips?.upcoming?.length > 0 ? (
              analytics.trips.upcoming.map((trip, index) => (
                <TripCard key={index}>
                  <h4>{trip.destination}</h4>
                  <p>
                    📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      style={{ textTransform: "capitalize", fontWeight: "600" }}
                    >
                      {trip.status}
                    </span>
                  </p>
                </TripCard>
              ))
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No upcoming trips. Start planning your next adventure!
              </p>
            )}
          </Card>

          {/* Achievements */}
          {analytics?.achievements?.length > 0 && (
            <Card delay="0.5s">
              <CardHeader>
                <CardIcon color="#f97316">
                  <FiAward />
                </CardIcon>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              {analytics.achievements.map((achievement, index) => (
                <AchievementCard key={index}>
                  <AchievementIcon>{achievement.icon}</AchievementIcon>
                  <AchievementText>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                  </AchievementText>
                </AchievementCard>
              ))}
            </Card>
          )}

          {/* Recommendations */}
          {analytics?.recommendations?.length > 0 && (
            <Card delay="0.6s">
              <CardHeader>
                <CardIcon color="#ec4899">
                  <FiStar />
                </CardIcon>
                <CardTitle>Personalized Recommendations</CardTitle>
              </CardHeader>
              {analytics.recommendations.map((rec, index) => (
                <RecommendationCard key={index}>
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </RecommendationCard>
              ))}
            </Card>
          )}

          {/* Loyalty Progress */}
          {analytics?.loyaltyInsights && (
            <Card delay="0.7s">
              <CardHeader>
                <CardIcon color="#10b981">
                  <FiGift />
                </CardIcon>
                <CardTitle>Loyalty Progress</CardTitle>
              </CardHeader>
              <MetricValue>
                {analytics.loyaltyInsights.nextMilestone.current}
              </MetricValue>
              <MetricLabel>
                of {analytics.loyaltyInsights.nextMilestone.target} trips to
                next reward
              </MetricLabel>
              <ProgressBar>
                <ProgressFill
                  percentage={
                    (analytics.loyaltyInsights.nextMilestone.current /
                      analytics.loyaltyInsights.nextMilestone.target) *
                    100
                  }
                />
              </ProgressBar>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Next reward: {analytics.loyaltyInsights.nextMilestone.reward}
              </p>
            </Card>
          )}

          {/* Recent Edit Requests */}
          {analytics?.editRequests?.length > 0 && (
            <Card delay="0.8s">
              <CardHeader>
                <CardIcon color="#6366f1">
                  <FiEdit3 />
                </CardIcon>
                <CardTitle>Recent Edit Requests</CardTitle>
              </CardHeader>
              {analytics.editRequests.slice(0, 3).map((request, index) => (
                <ListItem key={index}>
                  <div>
                    <div style={{ fontWeight: "600" }}>
                      {request.destination}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {request.requestType.replace("_", " ")} •{" "}
                      {formatDate(request.submittedAt)}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      backgroundColor:
                        request.status === "completed"
                          ? "#d1fae5"
                          : request.status === "pending"
                            ? "#fef3c7"
                            : "#fee2e2",
                      color:
                        request.status === "completed"
                          ? "#065f46"
                          : request.status === "pending"
                            ? "#92400e"
                            : "#991b1b",
                    }}
                  >
                    {request.status}
                  </span>
                </ListItem>
              ))}
            </Card>
          )}
        </ContentGrid>
      )}
    </DashboardContainer>
  );
};

export default UserDashboard;

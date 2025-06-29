// pages/admin/analytics.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  font-weight: 500;

  &:hover {
    background: #f3f4f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => (props.positive ? "#059669" : "#dc2626")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
`;

const SimpleChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
`;

const ChartBar = styled.div`
  flex: 1;
  background: #3b82f6;
  border-radius: 4px 4px 0 0;
  position: relative;
  height: ${(props) => props.height}%;
  transition: all 0.3s;

  &:hover {
    background: #2563eb;

    &::after {
      opacity: 1;
    }
  }

  &::after {
    content: "${(props) => props.value}";
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s;
  }
`;

const ChartLabel = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const PopularList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const PopularItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const PopularName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const PopularCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "admin")
    ) {
      router.push("/");
    }

    if (session?.user?.role === "admin") {
      fetchAnalytics();
    }
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <Container>Loading analytics...</Container>;
  }

  if (!analytics) {
    return <Container>Failed to load analytics</Container>;
  }

  const maxBookings = Math.max(
    ...analytics.monthlyTrend.map((m) => m.bookings)
  );

  return (
    <Container>
      <Header>
        <Title>Analytics Dashboard</Title>
        <BackButton href="/admin">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Admin
        </BackButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Revenue</StatTitle>
            <StatChange positive>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              +12.5%
            </StatChange>
          </StatHeader>
          <StatValue>${analytics.revenue.total.toLocaleString()}</StatValue>
          <StatSubtext>
            ${analytics.revenue.thisMonth.toLocaleString()} this month
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Total Users</StatTitle>
            <StatChange positive>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {analytics.users.newThisMonth} new
            </StatChange>
          </StatHeader>
          <StatValue>{analytics.users.total}</StatValue>
          <StatSubtext>
            {analytics.users.verificationRate}% verified
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Total Bookings</StatTitle>
            <StatChange positive>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {analytics.bookings.thisMonth} this month
            </StatChange>
          </StatHeader>
          <StatValue>{analytics.bookings.total}</StatValue>
          <StatSubtext>
            {analytics.bookings.averagePerUser} per user average
          </StatSubtext>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Average Booking Value</StatTitle>
          </StatHeader>
          <StatValue>${analytics.revenue.averagePerBooking}</StatValue>
          <StatSubtext>Per completed booking</StatSubtext>
        </StatCard>
      </StatsGrid>

      <Grid>
        <ChartContainer>
          <ChartTitle>Monthly Booking Trend</ChartTitle>
          <SimpleChart>
            {analytics.monthlyTrend.map((month, index) => (
              <ChartBar
                key={index}
                height={(month.bookings / maxBookings) * 100}
                value={month.bookings}
              />
            ))}
          </SimpleChart>
          <ChartLabel>
            {analytics.monthlyTrend.map((month, index) => (
              <span key={index}>{month.month.split(" ")[0]}</span>
            ))}
          </ChartLabel>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Popular Destinations</ChartTitle>
          <PopularList>
            {analytics.popularDestinations.map((dest, index) => (
              <PopularItem key={index}>
                <PopularName>{dest.destination}</PopularName>
                <PopularCount>{dest.count} bookings</PopularCount>
              </PopularItem>
            ))}
          </PopularList>
        </ChartContainer>
      </Grid>
    </Container>
  );
}

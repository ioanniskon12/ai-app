// components/AdminDashboard.jsx - Comprehensive Analytics Dashboard
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiEdit3,
  FiBarChart3,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
  FiDownload,
  FiFilter,
} from "react-icons/fi";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: ${(props) => props.color || "#667eea"};
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => (props.positive ? "#059669" : "#dc2626")};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const LoadingShimmer = styled.div`
  height: 200px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 8px;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #f1f5f9;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1f2937;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${(props) => {
    switch (props.status) {
      case "pending":
        return "background: #fef3c7; color: #92400e;";
      case "completed":
        return "background: #d1fae5; color: #065f46;";
      case "rejected":
        return "background: #fee2e2; color: #991b1b;";
      case "confirmed":
        return "background: #dbeafe; color: #1e40af;";
      default:
        return "background: #f3f4f6; color: #374151;";
    }
  }}
`;

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [metric, setMetric] = useState("all");

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}&metric=${metric}`
      );
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
    fetchAnalytics();
  }, [timeRange, metric]);

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? "+" : ""}${value}%`;
  };

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          <FiActivity /> Error loading analytics: {error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Analytics Dashboard</Title>
        <Controls>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>

          <Select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="all">All Metrics</option>
            <option value="overview">Overview</option>
            <option value="bookings">Bookings</option>
            <option value="users">Users</option>
            <option value="revenue">Revenue</option>
            <option value="edit-requests">Edit Requests</option>
          </Select>

          <RefreshButton
            onClick={fetchAnalytics}
            disabled={loading}
            loading={loading}
          >
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </Controls>
      </Header>

      {loading ? (
        <div>
          <MetricsGrid>
            {[...Array(4)].map((_, i) => (
              <MetricCard key={i} delay={`${i * 0.1}s`}>
                <LoadingShimmer />
              </MetricCard>
            ))}
          </MetricsGrid>
        </div>
      ) : (
        <>
          {/* Overview Metrics */}
          {analytics?.overview && (
            <MetricsGrid>
              <MetricCard delay="0s">
                <MetricHeader>
                  <MetricIcon color="#667eea">
                    <FiCalendar />
                  </MetricIcon>
                </MetricHeader>
                <MetricValue>
                  {formatNumber(analytics.overview.totalBookings)}
                </MetricValue>
                <MetricLabel>Total Bookings</MetricLabel>
                <MetricChange
                  positive={
                    analytics.overview.recentMetrics.bookings.growth >= 0
                  }
                >
                  {analytics.overview.recentMetrics.bookings.growth >= 0 ? (
                    <FiTrendingUp />
                  ) : (
                    <FiTrendingDown />
                  )}
                  {formatPercentage(
                    analytics.overview.recentMetrics.bookings.growth
                  )}
                </MetricChange>
              </MetricCard>

              <MetricCard delay="0.1s">
                <MetricHeader>
                  <MetricIcon color="#10b981">
                    <FiUsers />
                  </MetricIcon>
                </MetricHeader>
                <MetricValue>
                  {formatNumber(analytics.overview.totalUsers)}
                </MetricValue>
                <MetricLabel>Total Users</MetricLabel>
                <MetricChange
                  positive={analytics.overview.recentMetrics.users.growth >= 0}
                >
                  {analytics.overview.recentMetrics.users.growth >= 0 ? (
                    <FiTrendingUp />
                  ) : (
                    <FiTrendingDown />
                  )}
                  {formatPercentage(
                    analytics.overview.recentMetrics.users.growth
                  )}
                </MetricChange>
              </MetricCard>

              <MetricCard delay="0.2s">
                <MetricHeader>
                  <MetricIcon color="#f59e0b">
                    <FiDollarSign />
                  </MetricIcon>
                </MetricHeader>
                <MetricValue>
                  {formatCurrency(analytics.overview.totalRevenue)}
                </MetricValue>
                <MetricLabel>Total Revenue</MetricLabel>
                <MetricChange
                  positive={
                    analytics.overview.recentMetrics.revenue.growth >= 0
                  }
                >
                  {analytics.overview.recentMetrics.revenue.growth >= 0 ? (
                    <FiTrendingUp />
                  ) : (
                    <FiTrendingDown />
                  )}
                  {formatPercentage(
                    analytics.overview.recentMetrics.revenue.growth
                  )}
                </MetricChange>
              </MetricCard>

              <MetricCard delay="0.3s">
                <MetricHeader>
                  <MetricIcon color="#ef4444">
                    <FiEdit3 />
                  </MetricIcon>
                </MetricHeader>
                <MetricValue>
                  {analytics.editRequests
                    ? formatNumber(
                        analytics.editRequests.statusDistribution?.reduce(
                          (sum, item) => sum + item.count,
                          0
                        ) || 0
                      )
                    : "0"}
                </MetricValue>
                <MetricLabel>Edit Requests</MetricLabel>
                <MetricChange positive={true}>
                  <FiActivity />
                  Active
                </MetricChange>
              </MetricCard>
            </MetricsGrid>
          )}

          {/* Charts Grid */}
          <ChartsGrid>
            {/* Booking Status Distribution */}
            {analytics?.bookings?.statusDistribution && (
              <ChartCard delay="0.4s">
                <ChartHeader>
                  <ChartTitle>Booking Status Distribution</ChartTitle>
                  <FiPieChart />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Count</TableHeader>
                        <TableHeader>Percentage</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.bookings.statusDistribution.map(
                        (item, index) => {
                          const total =
                            analytics.bookings.statusDistribution.reduce(
                              (sum, s) => sum + s.count,
                              0
                            );
                          const percentage = (
                            (item.count / total) *
                            100
                          ).toFixed(1);
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <StatusBadge status={item._id}>
                                  {item._id}
                                </StatusBadge>
                              </TableCell>
                              <TableCell>{item.count}</TableCell>
                              <TableCell>{percentage}%</TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}

            {/* Top Destinations */}
            {analytics?.bookings?.topDestinations && (
              <ChartCard delay="0.5s">
                <ChartHeader>
                  <ChartTitle>Top Destinations</ChartTitle>
                  <FiBarChart3 />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Destination</TableHeader>
                        <TableHeader>Bookings</TableHeader>
                        <TableHeader>Revenue</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.bookings.topDestinations
                        .slice(0, 5)
                        .map((dest, index) => (
                          <TableRow key={index}>
                            <TableCell>{dest._id}</TableCell>
                            <TableCell>{dest.count}</TableCell>
                            <TableCell>
                              {formatCurrency(dest.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}

            {/* Edit Request Analytics */}
            {analytics?.editRequests?.statusDistribution && (
              <ChartCard delay="0.6s">
                <ChartHeader>
                  <ChartTitle>Edit Request Status</ChartTitle>
                  <FiEdit3 />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Count</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.editRequests.statusDistribution.map(
                        (item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <StatusBadge status={item._id}>
                                {item._id}
                              </StatusBadge>
                            </TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                        )
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}

            {/* Edit Request Types */}
            {analytics?.editRequests?.typeDistribution && (
              <ChartCard delay="0.7s">
                <ChartHeader>
                  <ChartTitle>Edit Request Types</ChartTitle>
                  <FiBarChart3 />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Request Type</TableHeader>
                        <TableHeader>Count</TableHeader>
                        <TableHeader>Percentage</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.editRequests.typeDistribution.map(
                        (item, index) => {
                          const total =
                            analytics.editRequests.typeDistribution.reduce(
                              (sum, t) => sum + t.count,
                              0
                            );
                          const percentage = (
                            (item.count / total) *
                            100
                          ).toFixed(1);
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <span style={{ textTransform: "capitalize" }}>
                                  {item._id.replace("_", " ")}
                                </span>
                              </TableCell>
                              <TableCell>{item.count}</TableCell>
                              <TableCell>{percentage}%</TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}

            {/* Revenue by Destination */}
            {analytics?.revenue?.revenueByDestination && (
              <ChartCard delay="0.8s">
                <ChartHeader>
                  <ChartTitle>Revenue by Destination</ChartTitle>
                  <FiDollarSign />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Destination</TableHeader>
                        <TableHeader>Revenue</TableHeader>
                        <TableHeader>Bookings</TableHeader>
                        <TableHeader>Avg Value</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.revenue.revenueByDestination
                        .slice(0, 5)
                        .map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item._id}</TableCell>
                            <TableCell>
                              {formatCurrency(item.revenue)}
                            </TableCell>
                            <TableCell>{item.bookings}</TableCell>
                            <TableCell>
                              {formatCurrency(item.avgValue)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}

            {/* User Engagement */}
            {analytics?.users?.userEngagement && (
              <ChartCard delay="0.9s">
                <ChartHeader>
                  <ChartTitle>User Engagement Levels</ChartTitle>
                  <FiUsers />
                </ChartHeader>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Engagement Level</TableHeader>
                        <TableHeader>Users</TableHeader>
                        <TableHeader>Avg Spent</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.users.userEngagement.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span style={{ textTransform: "capitalize" }}>
                              {item._id.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>
                            {formatCurrency(item.avgSpent || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            )}
          </ChartsGrid>

          {/* Performance Metrics */}
          {analytics?.performance && (
            <TableContainer>
              <ChartHeader>
                <ChartTitle>Performance Metrics</ChartTitle>
                <FiActivity />
              </ChartHeader>

              {analytics.performance.customerSatisfaction && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4>Customer Satisfaction</h4>
                  <p>
                    Average Rating:{" "}
                    {analytics.performance.customerSatisfaction.avgRating?.toFixed(
                      1
                    )}
                    /5
                  </p>
                  <p>
                    Total Reviews:{" "}
                    {analytics.performance.customerSatisfaction.totalReviews}
                  </p>
                </div>
              )}

              {analytics.performance.processingTime && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4>Average Processing Time</h4>
                  <p>
                    {Math.round(
                      analytics.performance.processingTime.avgProcessingTime /
                        (1000 * 60 * 60)
                    )}{" "}
                    hours
                  </p>
                  <p>
                    Based on {analytics.performance.processingTime.count}{" "}
                    bookings
                  </p>
                </div>
              )}

              {analytics.editRequests?.resolutionTimes &&
                analytics.editRequests.resolutionTimes[0] && (
                  <div>
                    <h4>Edit Request Resolution Times</h4>
                    <p>
                      Average:{" "}
                      {analytics.editRequests.resolutionTimes[0].avgResolutionTime?.toFixed(
                        1
                      )}{" "}
                      hours
                    </p>
                    <p>
                      Fastest:{" "}
                      {analytics.editRequests.resolutionTimes[0].minResolutionTime?.toFixed(
                        1
                      )}{" "}
                      hours
                    </p>
                    <p>
                      Slowest:{" "}
                      {analytics.editRequests.resolutionTimes[0].maxResolutionTime?.toFixed(
                        1
                      )}{" "}
                      hours
                    </p>
                  </div>
                )}
            </TableContainer>
          )}
        </>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;

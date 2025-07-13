// pages/admin/dashboard.js - Complete Admin Dashboard
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiMail,
} from "react-icons/fi";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaPlane,
  FaHotel,
  FaExclamationTriangle,
} from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
`;

const Sidebar = styled.div`
  width: 260px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  padding: 0 2rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const NavItem = styled.div`
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${(props) => (props.active ? "#667eea" : "#6b7280")};
  background: ${(props) =>
    props.active ? "rgba(102, 126, 234, 0.1)" : "transparent"};
  border-left: 3px solid
    ${(props) => (props.active ? "#667eea" : "transparent")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
    color: #667eea;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1f2937;
  font-weight: 700;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${(props) => (props.primary ? "#667eea" : "white")};
  color: ${(props) => (props.primary ? "white" : "#6b7280")};
  border: 1px solid ${(props) => (props.primary ? "#667eea" : "#e5e7eb")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.color || "#667eea"};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(props) => props.bg || "rgba(102, 126, 234, 0.1)"};
  color: ${(props) => props.color || "#667eea"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${(props) => (props.positive ? "#10b981" : "#ef4444")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: ${(props) => (props.active ? "#667eea" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#6b7280")};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.active ? "#667eea" : "rgba(102, 126, 234, 0.1)"};
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem 2rem;
  background: #f9fafb;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.875rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) => props.color || "#667eea"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case "active":
        return "rgba(16, 185, 129, 0.1)";
      case "confirmed":
        return "rgba(16, 185, 129, 0.1)";
      case "pending":
        return "rgba(251, 191, 36, 0.1)";
      case "cancelled":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "active":
        return "#10b981";
      case "confirmed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }};
`;

const ActionMenu = styled.div`
  position: relative;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-radius: 50%;
  border-top-color: #667eea;
  animation: ${spin} 0.8s linear infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }
`;

// Mock Chart Component (replace with actual chart library)
const Chart = styled.div`
  height: 300px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
`;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("week");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchDashboardData();
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/users/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // Implement CSV export functionality
    alert("Export functionality coming soon!");
  };

  const handleUserAction = (action, userId) => {
    console.log(`${action} user ${userId}`);
    // Implement user actions
  };

  if (loading || status === "loading") {
    return (
      <DashboardWrapper>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          <LoadingSpinner style={{ width: "40px", height: "40px" }} />
        </div>
      </DashboardWrapper>
    );
  }

  const stats = dashboardData?.stats || {};
  const users = dashboardData?.recentUsers || [];
  const trips = dashboardData?.recentBookings || [];

  return (
    <DashboardWrapper>
      <Sidebar>
        <Logo>🌍 AI Travel Admin</Logo>
        <NavItem
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          <FiActivity />
          Overview
        </NavItem>
        <NavItem
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        >
          <FiUsers />
          Users
        </NavItem>
        <NavItem
          active={activeTab === "bookings"}
          onClick={() => setActiveTab("bookings")}
        >
          <FaPlane />
          Bookings
        </NavItem>
        <NavItem
          active={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine />
          Analytics
        </NavItem>
        <NavItem
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        >
          <FiCalendar />
          Settings
        </NavItem>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "users" && "User Management"}
            {activeTab === "bookings" && "Bookings Management"}
            {activeTab === "analytics" && "Analytics & Reports"}
            {activeTab === "settings" && "Settings"}
          </Title>
          <HeaderActions>
            <Button onClick={fetchDashboardData} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? "spinning" : ""} />
              Refresh
            </Button>
            <Button primary onClick={handleExport}>
              <FiDownload />
              Export
            </Button>
          </HeaderActions>
        </Header>

        {activeTab === "overview" && (
          <>
            <StatsGrid>
              <StatCard delay="0s" color="#667eea">
                <StatHeader>
                  <StatTitle>Total Users</StatTitle>
                  <StatIcon bg="rgba(102, 126, 234, 0.1)" color="#667eea">
                    <FiUsers />
                  </StatIcon>
                </StatHeader>
                <StatValue>{stats.totalUsers || 0}</StatValue>
                <StatChange positive>
                  <FiTrendingUp />
                  {stats.userGrowth || "+12%"} this month
                </StatChange>
              </StatCard>

              <StatCard delay="0.1s" color="#10b981">
                <StatHeader>
                  <StatTitle>Total Bookings</StatTitle>
                  <StatIcon bg="rgba(16, 185, 129, 0.1)" color="#10b981">
                    <FaPlane />
                  </StatIcon>
                </StatHeader>
                <StatValue>{stats.totalBookings || 0}</StatValue>
                <StatChange positive>
                  <FiTrendingUp />
                  {stats.bookingGrowth || "+8%"} this month
                </StatChange>
              </StatCard>

              <StatCard delay="0.2s" color="#f59e0b">
                <StatHeader>
                  <StatTitle>Revenue</StatTitle>
                  <StatIcon bg="rgba(245, 158, 11, 0.1)" color="#f59e0b">
                    <FiDollarSign />
                  </StatIcon>
                </StatHeader>
                <StatValue>${stats.totalRevenue || "0"}</StatValue>
                <StatChange positive>
                  <FiTrendingUp />
                  {stats.revenueGrowth || "+15%"} this month
                </StatChange>
              </StatCard>

              <StatCard delay="0.3s" color="#8b5cf6">
                <StatHeader>
                  <StatTitle>Active Trips</StatTitle>
                  <StatIcon bg="rgba(139, 92, 246, 0.1)" color="#8b5cf6">
                    <FiMapPin />
                  </StatIcon>
                </StatHeader>
                <StatValue>{stats.activeTrips || 0}</StatValue>
                <StatChange positive={false}>
                  {stats.activeTripsCount || "23"} ongoing
                </StatChange>
              </StatCard>
            </StatsGrid>

            <ChartContainer>
              <ChartHeader>
                <ChartTitle>Booking Trends</ChartTitle>
                <TabContainer>
                  <Tab
                    active={timeRange === "week"}
                    onClick={() => setTimeRange("week")}
                  >
                    Week
                  </Tab>
                  <Tab
                    active={timeRange === "month"}
                    onClick={() => setTimeRange("month")}
                  >
                    Month
                  </Tab>
                  <Tab
                    active={timeRange === "year"}
                    onClick={() => setTimeRange("year")}
                  >
                    Year
                  </Tab>
                </TabContainer>
              </ChartHeader>
              <Chart>
                Chart visualization would go here (integrate with Chart.js or
                Recharts)
              </Chart>
            </ChartContainer>
          </>
        )}

        {(activeTab === "users" || activeTab === "bookings") && (
          <TableContainer>
            <TableHeader>
              <SearchBar>
                <FiSearch />
                <SearchInput
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBar>
              <Button>
                <FiFilter />
                Filter
              </Button>
            </TableHeader>

            <Table>
              <thead>
                <tr>
                  {activeTab === "users" ? (
                    <>
                      <Th>User</Th>
                      <Th>Email</Th>
                      <Th>Joined</Th>
                      <Th>Bookings</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </>
                  ) : (
                    <>
                      <Th>Booking ID</Th>
                      <Th>User</Th>
                      <Th>Destination</Th>
                      <Th>Dates</Th>
                      <Th>Price</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === "users" ? (
                  users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={user._id}>
                        <Td>
                          <UserInfo>
                            <UserAvatar color={`hsl(${index * 60}, 70%, 50%)`}>
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </UserAvatar>
                            <div>
                              <div style={{ fontWeight: "600" }}>
                                {user.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#6b7280",
                                }}
                              >
                                ID: {user._id.slice(-6)}
                              </div>
                            </div>
                          </UserInfo>
                        </Td>
                        <Td>{user.email}</Td>
                        <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                        <Td>{user.totalBookings || 0}</Td>
                        <Td>
                          <StatusBadge status="active">Active</StatusBadge>
                        </Td>
                        <Td>
                          <ActionMenu>
                            <ActionButton
                              onClick={() => handleUserAction("view", user._id)}
                            >
                              <FiMoreVertical />
                            </ActionButton>
                          </ActionMenu>
                        </Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <Td colSpan="6">
                        <EmptyState>
                          <FiUsers />
                          <h3>No users found</h3>
                          <p>Users will appear here once they sign up</p>
                        </EmptyState>
                      </Td>
                    </tr>
                  )
                ) : trips.length > 0 ? (
                  trips.map((trip, index) => (
                    <tr key={trip._id}>
                      <Td>#{trip._id.slice(-6)}</Td>
                      <Td>{trip.userName}</Td>
                      <Td>{trip.destination}</Td>
                      <Td>
                        {new Date(trip.startDate).toLocaleDateString()} -
                        {new Date(trip.endDate).toLocaleDateString()}
                      </Td>
                      <Td>${trip.totalPrice}</Td>
                      <Td>
                        <StatusBadge status={trip.status || "confirmed"}>
                          {trip.status || "Confirmed"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <ActionMenu>
                          <ActionButton>
                            <FiMoreVertical />
                          </ActionButton>
                        </ActionMenu>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="7">
                      <EmptyState>
                        <FaPlane />
                        <h3>No bookings found</h3>
                        <p>Bookings will appear here once users make them</p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </MainContent>

      <style jsx global>{`
        .spinning {
          animation: ${spin} 1s linear infinite;
        }
      `}</style>
    </DashboardWrapper>
  );
}

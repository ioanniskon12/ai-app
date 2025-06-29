// pages/admin/index.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${(props) => props.color || "#eff6ff"};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-weight: 500;
  color: ${(props) => (props.active ? "#3b82f6" : "#6b7280")};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #3b82f6;
    transform: scaleX(${(props) => (props.active ? 1 : 0)});
    transition: transform 0.2s;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #374151;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${(props) =>
    props.type === "admin"
      ? "#fee2e2"
      : props.type === "verified"
        ? "#d1fae5"
        : "#f3f4f6"};
  color: ${(props) =>
    props.type === "admin"
      ? "#dc2626"
      : props.type === "verified"
        ? "#059669"
        : "#374151"};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${(props) =>
    props.variant === "danger" ? "#fee2e2" : "#eff6ff"};
  color: ${(props) => (props.variant === "danger" ? "#dc2626" : "#3b82f6")};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#fecaca" : "#dbeafe"};
  }
`;

const SearchBar = styled.div`
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterButton = styled.button`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f3f4f6;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-weight: 500;
  color: #6b7280;
`;

const InfoValue = styled.div`
  color: #111827;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "admin")
    ) {
      router.push("/");
    }

    if (session?.user?.role === "admin") {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch all bookings
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((u) => (u._id === userId ? updatedUser : u)));
        alert("User updated successfully");
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => {
      const price = parseInt(booking.price?.replace(/[^0-9]/g, "") || "0");
      return sum + price;
    }, 0),
    activeTrips: bookings.filter((b) => new Date(b.startDate) > new Date())
      .length,
  };

  if (status === "loading" || loading) {
    return <Container>Loading...</Container>;
  }

  if (session?.user?.role !== "admin") {
    return <Container>Access denied</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Manage users, bookings, and system settings</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#dbeafe">
            <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </StatIcon>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#dbeafe">
            <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 20 20">
              <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2V2a8 8 0 1 0 0 16z" />
            </svg>
          </StatIcon>
          <StatValue>{stats.totalBookings}</StatValue>
          <StatLabel>Total Bookings</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#fef3c7">
            <svg width="24" height="24" fill="#f59e0b" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          </StatIcon>
          <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#d1fae5">
            <svg width="24" height="24" fill="#059669" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          </StatIcon>
          <StatValue>{stats.activeTrips}</StatValue>
          <StatLabel>Active Trips</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <TabsList>
          <Tab
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Tab>
          <Tab
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </Tab>
          <Tab
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
          >
            Edit Requests
          </Tab>
        </TabsList>

        {activeTab === "users" && (
          <>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterButton>
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Filter
              </FilterButton>
            </SearchBar>

            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>User</Th>
                    <Th>Joined</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <Td>
                        <UserInfo>
                          <UserAvatar>
                            {user.image ? (
                              <img src={user.image} alt={user.name} />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </UserAvatar>
                          <UserDetails>
                            <UserName>{user.name}</UserName>
                            <UserEmail>{user.email}</UserEmail>
                          </UserDetails>
                        </UserInfo>
                      </Td>
                      <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Badge type={user.role === "admin" ? "admin" : "user"}>
                          {user.role || "user"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          type={user.emailVerified ? "verified" : "unverified"}
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </Td>
                      <Td>
                        <ActionButtons>
                          <ActionButton onClick={() => viewUserDetails(user)}>
                            View
                          </ActionButton>
                          <ActionButton
                            onClick={() => {
                              const newRole =
                                user.role === "admin" ? "user" : "admin";
                              handleUpdateUser(user._id, { role: newRole });
                            }}
                          >
                            {user.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </ActionButton>
                        </ActionButtons>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeTab === "bookings" && (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Booking ID</Th>
                  <Th>User</Th>
                  <Th>Destination</Th>
                  <Th>Dates</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const status =
                    new Date(booking.startDate) > new Date()
                      ? "upcoming"
                      : new Date(booking.endDate) < new Date()
                        ? "completed"
                        : "ongoing";
                  return (
                    <tr key={booking._id}>
                      <Td>{booking._id.slice(-6).toUpperCase()}</Td>
                      <Td>{booking.email}</Td>
                      <Td>{booking.destination}</Td>
                      <Td>
                        {new Date(booking.startDate).toLocaleDateString()} -
                        {new Date(booking.endDate).toLocaleDateString()}
                      </Td>
                      <Td>{booking.price}</Td>
                      <Td>
                        <Badge
                          type={
                            status === "upcoming"
                              ? "verified"
                              : status === "completed"
                                ? "user"
                                : "admin"
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </Td>
                      <Td>
                        <ActionButtons>
                          <ActionButton>View</ActionButton>
                          <ActionButton>Edit</ActionButton>
                        </ActionButtons>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        )}

        {activeTab === "requests" && (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}
          >
            No edit requests at this time
          </div>
        )}
      </TabsContainer>

      {showUserModal && selectedUser && (
        <Modal
          onClick={(e) =>
            e.target === e.currentTarget && setShowUserModal(false)
          }
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle>User Details</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <UserInfo style={{ marginBottom: "2rem" }}>
                <UserAvatar style={{ width: "80px", height: "80px" }}>
                  {selectedUser.image ? (
                    <img src={selectedUser.image} alt={selectedUser.name} />
                  ) : (
                    selectedUser.name?.charAt(0).toUpperCase() || "U"
                  )}
                </UserAvatar>
                <UserDetails>
                  <UserName style={{ fontSize: "1.25rem" }}>
                    {selectedUser.name}
                  </UserName>
                  <UserEmail>{selectedUser.email}</UserEmail>
                </UserDetails>
              </UserInfo>

              <InfoGrid>
                <InfoItem>
                  <InfoLabel>User ID</InfoLabel>
                  <InfoValue>{selectedUser._id}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Role</InfoLabel>
                  <InfoValue>
                    <Badge
                      type={selectedUser.role === "admin" ? "admin" : "user"}
                    >
                      {selectedUser.role || "user"}
                    </Badge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email Verified</InfoLabel>
                  <InfoValue>
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Joined</InfoLabel>
                  <InfoValue>
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{selectedUser.phone || "Not provided"}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Location</InfoLabel>
                  <InfoValue>
                    {selectedUser.city && selectedUser.country
                      ? `${selectedUser.city}, ${selectedUser.country}`
                      : "Not provided"}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Bio</InfoLabel>
                  <InfoValue>{selectedUser.bio || "No bio provided"}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Bookings</InfoLabel>
                  <InfoValue>
                    {
                      bookings.filter((b) => b.email === selectedUser.email)
                        .length
                    }
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
            </ModalBody>
            <ModalFooter>
              <ActionButton onClick={() => setShowUserModal(false)}>
                Close
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

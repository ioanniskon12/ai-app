// // pages/api/admin/bookings/[id].js
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../api/auth/[...nextauth]";
// import dbConnect from "@/lib/mongodb";
// import Booking from "@/models/Booking"; // Adjust the import path as necessary

// export default async function handler(req, res) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session || session.user.role !== "admin") {
//     return res.status(403).json({ error: "Access denied" });
//   }

//   const { id } = req.query;
//   await dbConnect();

//   if (req.method === "PUT") {
//     try {
//       const booking = await Booking.findByIdAndUpdate(id, req.body, {
//         new: true,
//       });

//       if (!booking) {
//         return res.status(404).json({ error: "Booking not found" });
//       }

//       res.status(200).json(booking);
//     } catch (error) {
//       console.error("Error updating booking:", error);
//       res.status(500).json({ error: "Failed to update booking" });
//     }
//   } else if (req.method === "DELETE") {
//     try {
//       const booking = await Booking.findByIdAndDelete(id);

//       if (!booking) {
//         return res.status(404).json({ error: "Booking not found" });
//       }

//       res.status(200).json({ success: true });
//     } catch (error) {
//       console.error("Error deleting booking:", error);
//       res.status(500).json({ error: "Failed to delete booking" });
//     }
//   } else {
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }

// pages/admin/bookings/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styled from "styled-components";

// Remove any direct imports of MongoDB models or dbConnect here
// DON'T DO THIS:
// import Booking from '@/models/Booking';
// import dbConnect from '@/lib/mongodb';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const BookingDetails = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.div`
  font-weight: 500;
  color: #6b7280;
`;

const Value = styled.div`
  color: #111827;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

export default function AdminBookingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check admin permissions
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (id && session?.user?.role === "admin") {
      fetchBookingDetails();
    }
  }, [id, session]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from API route instead of direct database access
      const res = await fetch(`/api/admin/bookings/${id}`);

      if (!res.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const data = await res.json();
      setBooking(data.booking);
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Container>
        <LoadingSpinner>Loading booking details...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container>
        <ErrorMessage>Booking not found</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Booking Details</Title>
      </Header>

      <BookingDetails>
        <DetailRow>
          <Label>Booking ID</Label>
          <Value>{booking._id}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Customer Email</Label>
          <Value>{booking.email}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Destination</Label>
          <Value>{booking.destination}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Dates</Label>
          <Value>
            {new Date(booking.startDate).toLocaleDateString()} -
            {new Date(booking.endDate).toLocaleDateString()}
          </Value>
        </DetailRow>

        <DetailRow>
          <Label>Total Price</Label>
          <Value>${booking.totalPrice}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Status</Label>
          <Value>{booking.status}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Payment Status</Label>
          <Value>{booking.paymentStatus}</Value>
        </DetailRow>

        <DetailRow>
          <Label>Passengers</Label>
          <Value>
            Adults: {booking.passengers?.adults || 0}, Children:{" "}
            {booking.passengers?.children || 0}, Infants:{" "}
            {booking.passengers?.infants || 0}
          </Value>
        </DetailRow>
      </BookingDetails>
    </Container>
  );
}

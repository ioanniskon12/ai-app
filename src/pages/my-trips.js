// // pages/my-trips.js
// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import styled, { keyframes } from "styled-components";
// import {
//   FiCalendar,
//   FiMapPin,
//   FiDollarSign,
//   FiEdit3,
//   FiTrash2,
//   FiClock,
//   FiCheck,
//   FiX,
//   FiLoader,
//   FiAlertCircle,
//   FiSend,
// } from "react-icons/fi";
// import { FaPlane, FaHotel } from "react-icons/fa";

// // Animations
// const fadeIn = keyframes
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const slideIn = keyframes
//   from { transform: translateX(-20px); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// `;

// const spin = keyframes
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// `;

// // Page Layout
// const PageWrapper = styled.div`
//   min-height: 100vh;
//   background: #f5f7fa;
// `;

// const Header = styled.div`
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
//   padding: 3rem 0;
//   text-align: center;
// `;

// const PageTitle = styled.h1`
//   font-size: 2.5rem;
//   font-weight: 800;
//   margin-bottom: 0.5rem;
// `;

// const Subtitle = styled.p`
//   font-size: 1.125rem;
//   opacity: 0.9;
// `;

// const Container = styled.div`
//   max-width: 1200px;
//   margin: -2rem auto 4rem;
//   padding: 0 2rem;
//   position: relative;
//   z-index: 1;

//   @media (max-width: 768px) {
//     padding: 0 1rem;
//   }
// `;

// // Empty State
// const EmptyState = styled.div`
//   background: white;
//   border-radius: 20px;
//   padding: 4rem;
//   text-align: center;
//   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
//   animation: ${fadeIn} 0.6s ease-out;

//   svg {
//     font-size: 4rem;
//     color: #e5e7eb;
//     margin-bottom: 1rem;
//   }

//   h3 {
//     font-size: 1.5rem;
//     color: #1f2937;
//     margin-bottom: 0.5rem;
//   }

//   p {
//     color: #6b7280;
//     margin-bottom: 2rem;
//   }
// `;

// const StartButton = styled.button`
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
//   padding: 1rem 2rem;
//   border-radius: 50px;
//   border: none;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s;

//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
//   }
// `;

// // Trip Grid
// const TripGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
//   gap: 2rem;
//   animation: ${fadeIn} 0.6s ease-out;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// // Trip Card
// const TripCard = styled.div`
//   background: white;
//   border-radius: 20px;
//   overflow: hidden;
//   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
//   transition: all 0.3s;
//   animation: ${slideIn} 0.6s ease-out ${(props) => props.delay || "0s"};

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
//   }
// `;

// const TripHeader = styled.div`
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
//   padding: 1.5rem;
//   position: relative;
//   overflow: hidden;

//   &::before {
//     content: "✈️";
//     position: absolute;
//     right: -10px;
//     top: -10px;
//     font-size: 60px;
//     opacity: 0.1;
//   }
// `;

// const TripTitle = styled.h3`
//   font-size: 1.5rem;
//   font-weight: 700;
//   margin-bottom: 0.5rem;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const TripMeta = styled.div`
//   display: flex;
//   gap: 1.5rem;
//   font-size: 0.875rem;
//   opacity: 0.9;
// `;

// const TripContent = styled.div`
//   padding: 1.5rem;
// `;

// const DetailRow = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   margin-bottom: 1rem;
//   color: #4b5563;

//   svg {
//     color: #667eea;
//     font-size: 1.25rem;
//   }

//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

// const StatusBadge = styled.span`
//   display: inline-flex;
//   align-items: center;
//   gap: 0.5rem;
//   padding: 0.5rem 1rem;
//   border-radius: 50px;
//   font-size: 0.875rem;
//   font-weight: 600;
//   background: ${(props) => {
//     if (props.status === "confirmed") return "#d1fae5";
//     if (props.status === "pending") return "#fef3c7";
//     if (props.status === "cancelled") return "#fee2e2";
//     return "#e5e7eb";
//   }};
//   color: ${(props) => {
//     if (props.status === "confirmed") return "#065f46";
//     if (props.status === "pending") return "#92400e";
//     if (props.status === "cancelled") return "#991b1b";
//     return "#4b5563";
//   }};
// `;

// const ActionButtons = styled.div`
//   display: flex;
//   gap: 0.75rem;
//   margin-top: 1.5rem;
//   padding-top: 1.5rem;
//   border-top: 1px solid #e5e7eb;
// `;

// const ActionButton = styled.button`
//   flex: 1;
//   padding: 0.75rem;
//   border-radius: 12px;
//   border: 2px solid transparent;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
//   font-size: 0.875rem;
// `;

// const EditButton = styled(ActionButton)`
//   background: #f3f4f6;
//   color: #667eea;
//   border-color: #e5e7eb;

//   &:hover {
//     background: #667eea;
//     color: white;
//     border-color: #667eea;
//   }
// `;

// const DeleteButton = styled(ActionButton)`
//   background: #fee2e2;
//   color: #dc2626;
//   border-color: #fecaca;

//   &:hover {
//     background: #dc2626;
//     color: white;
//     border-color: #dc2626;
//   }
// `;

// // Edit Request Modal
// const Modal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.5);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 2rem;
//   z-index: 1000;
//   animation: ${fadeIn} 0.3s ease-out;
// `;

// const ModalContent = styled.div`
//   background: white;
//   border-radius: 20px;
//   padding: 2rem;
//   max-width: 600px;
//   width: 100%;
//   max-height: 90vh;
//   overflow-y: auto;
//   animation: ${slideIn} 0.3s ease-out;
// `;

// const ModalHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 1.5rem;

//   h3 {
//     font-size: 1.5rem;
//     font-weight: 700;
//     color: #1f2937;
//   }
// `;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   font-size: 1.5rem;
//   color: #6b7280;
//   cursor: pointer;
//   padding: 0.5rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: all 0.3s;

//   &:hover {
//     color: #1f2937;
//     transform: rotate(90deg);
//   }
// `;

// const EditForm = styled.form`
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const FormGroup = styled.div`
//   label {
//     display: block;
//     font-weight: 600;
//     color: #1f2937;
//     margin-bottom: 0.5rem;
//   }
// `;

// const Select = styled.select`
//   width: 100%;
//   padding: 0.75rem;
//   border: 2px solid #e5e7eb;
//   border-radius: 12px;
//   font-size: 1rem;
//   font-family: inherit;
//   transition: all 0.3s;
//   background: white;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//     box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//   }
// `;

// const RadioGroup = styled.div`
//   display: flex;
//   gap: 1rem;
//   flex-wrap: wrap;
// `;

// const RadioLabel = styled.label`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   cursor: pointer;
//   padding: 0.5rem 1rem;
//   border: 2px solid #e5e7eb;
//   border-radius: 8px;
//   transition: all 0.3s;

//   &:has(input:checked) {
//     border-color: #667eea;
//     background: rgba(102, 126, 234, 0.05);
//   }

//   input {
//     cursor: pointer;
//   }
// `;

// const TextArea = styled.textarea`
//   width: 100%;
//   padding: 1rem;
//   border: 2px solid #e5e7eb;
//   border-radius: 12px;
//   font-size: 1rem;
//   font-family: inherit;
//   resize: vertical;
//   min-height: 120px;
//   transition: all 0.3s;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//     box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//   }
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 0.75rem;
//   border: 2px solid #e5e7eb;
//   border-radius: 12px;
//   font-size: 1rem;
//   transition: all 0.3s;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//     box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//   }
// `;

// const SubmitButton = styled.button`
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
//   padding: 1rem;
//   border-radius: 12px;
//   border: none;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;

//   &:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
//   }

//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   svg {
//     animation: ${(props) => (props.loading ? spin : "none")} 1s linear infinite;
//   }
// `;

// const SuccessMessage = styled.div`
//   background: #d1fae5;
//   color: #065f46;
//   padding: 1rem;
//   border-radius: 12px;
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   margin-bottom: 1rem;
// `;

// const ErrorMessage = styled.div`
//   background: #fee2e2;
//   color: #dc2626;
//   padding: 1rem;
//   border-radius: 12px;
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   margin-bottom: 1rem;
// `;

// const LoadingState = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   padding: 4rem;
//   color: #6b7280;

//   svg {
//     font-size: 3rem;
//     color: #667eea;
//     animation: ${spin} 1s linear infinite;
//     margin-bottom: 1rem;
//   }
// `;

// export default function MyTrips() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [editRequest, setEditRequest] = useState("");
//   const [requestType, setRequestType] = useState("other");
//   const [priority, setPriority] = useState("medium");
//   const [proposedChanges, setProposedChanges] = useState({
//     startDate: "",
//     endDate: "",
//     hotel: "",
//     activities: "",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/");
//     } else if (session?.user?.email) {
//       fetchBookings();
//     }
//   }, [session, status]);

//   const fetchBookings = async () => {
//     try {
//       const res = await fetch(`/api/bookings?email=${session.user.email}`);
//       if (res.ok) {
//         const data = await res.json();
//         setBookings(data);
//       }
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditRequest = async (e) => {
//     e.preventDefault();
//     if (!editRequest.trim() || !selectedBooking) return;

//     setSubmitting(true);
//     setError("");
//     setSuccess("");

//     // Only include non-empty proposed changes
//     const filteredChanges = {};
//     Object.entries(proposedChanges).forEach(([key, value]) => {
//       if (value && value.trim()) {
//         filteredChanges[key] = value;
//       }
//     });

//     try {
//       const res = await fetch("/api/bookings/edit-request", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: selectedBooking._id,
//           request: editRequest,
//           requestType: requestType,
//           priority: priority,
//           proposedChanges: filteredChanges,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setSuccess(
//           "Edit request submitted successfully! We'll contact you soon."
//         );
//         setTimeout(() => {
//           setEditModalOpen(false);
//           setEditRequest("");
//           setRequestType("other");
//           setPriority("medium");
//           setProposedChanges({
//             startDate: "",
//             endDate: "",
//             hotel: "",
//             activities: "",
//           });
//           setSuccess("");
//         }, 2000);
//       } else {
//         setError(data.error || "Failed to submit edit request");
//       }
//     } catch (error) {
//       setError("An error occurred. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (bookingId) => {
//     if (!confirm("Are you sure you want to cancel this booking?")) return;

//     try {
//       const res = await fetch(
//         `/api/bookings/${bookingId}?email=${session.user.email}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (res.ok) {
//         setBookings(bookings.filter((b) => b._id !== bookingId));
//       }
//     } catch (error) {
//       console.error("Error deleting booking:", error);
//       alert("Failed to cancel booking");
//     }
//   };

//   if (status === "loading" || loading) {
//     return (
//       <PageWrapper>
//         <Header>
//           <PageTitle>My Trips</PageTitle>
//           <Subtitle>Manage your travel bookings</Subtitle>
//         </Header>
//         <Container>
//           <LoadingState>
//             <FiLoader />
//             <p>Loading your trips...</p>
//           </LoadingState>
//         </Container>
//       </PageWrapper>
//     );
//   }

//   return (
//     <>
//       <PageWrapper>
//         <Header>
//           <PageTitle>My Trips</PageTitle>
//           <Subtitle>
//             {bookings.length > 0
//               ? `You have ${bookings.length} upcoming trip${bookings.length > 1 ? "s" : ""}`
//               : "Start planning your next adventure"}
//           </Subtitle>
//         </Header>

//         <Container>
//           {bookings.length === 0 ? (
//             <EmptyState>
//               <FaPlane />
//               <h3>No trips yet</h3>
//               <p>Start planning your dream vacation today!</p>
//               <StartButton onClick={() => router.push("/")}>
//                 Plan a Trip
//               </StartButton>
//             </EmptyState>
//           ) : (
//             <TripGrid>
//               {bookings.map((booking, index) => (
//                 <TripCard key={booking._id} delay={`${index * 0.1}s`}>
//                   <TripHeader>
//                     <TripTitle>
//                       <FiMapPin />
//                       {booking.destination}
//                     </TripTitle>
//                     <TripMeta>
//                       <span>{booking.month}</span>
//                       <span>•</span>
//                       <span>{booking.duration}</span>
//                     </TripMeta>
//                   </TripHeader>

//                   <TripContent>
//                     <DetailRow>
//                       <FiCalendar />
//                       <div>
//                         {booking.startDate && booking.endDate ? (
//                           <>
//                             {new Date(booking.startDate).toLocaleDateString()} -{" "}
//                             {new Date(booking.endDate).toLocaleDateString()}
//                           </>
//                         ) : (
//                           "Dates to be confirmed"
//                         )}
//                       </div>
//                     </DetailRow>

//                     <DetailRow>
//                       <FaHotel />
//                       <div>{booking.hotel}</div>
//                     </DetailRow>

//                     <DetailRow>
//                       <FiDollarSign />
//                       <div>
//                         <strong>{booking.price}</strong> per person
//                       </div>
//                     </DetailRow>

//                     <DetailRow>
//                       <FiClock />
//                       <StatusBadge status="confirmed">
//                         <FiCheck />
//                         Confirmed
//                       </StatusBadge>
//                     </DetailRow>

//                     <ActionButtons>
//                       <EditButton
//                         onClick={() => {
//                           setSelectedBooking(booking);
//                           setEditModalOpen(true);
//                         }}
//                       >
//                         <FiEdit3 />
//                         Request Changes
//                       </EditButton>
//                       <DeleteButton onClick={() => handleDelete(booking._id)}>
//                         <FiTrash2 />
//                         Cancel
//                       </DeleteButton>
//                     </ActionButtons>
//                   </TripContent>
//                 </TripCard>
//               ))}
//             </TripGrid>
//           )}
//         </Container>
//       </PageWrapper>

//       {editModalOpen && (
//         <Modal
//           onClick={(e) => {
//             if (e.target === e.currentTarget) setEditModalOpen(false);
//           }}
//         >
//           <ModalContent>
//             <ModalHeader>
//               <h3>Request Trip Changes</h3>
//               <CloseButton onClick={() => setEditModalOpen(false)}>
//                 <FiX />
//               </CloseButton>
//             </ModalHeader>

//             {success && (
//               <SuccessMessage>
//                 <FiCheck />
//                 {success}
//               </SuccessMessage>
//             )}

//             {error && (
//               <ErrorMessage>
//                 <FiAlertCircle />
//                 {error}
//               </ErrorMessage>
//             )}

//             <EditForm onSubmit={handleEditRequest}>
//               <FormGroup>
//                 <label>Trip Details</label>
//                 <div
//                   style={{
//                     background: "#f9fafb",
//                     padding: "1rem",
//                     borderRadius: "12px",
//                     marginBottom: "1rem",
//                   }}
//                 >
//                   <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
//                     {selectedBooking?.destination}
//                   </p>
//                   <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
//                     {selectedBooking?.month} • {selectedBooking?.duration}
//                   </p>
//                 </div>
//               </FormGroup>

//               <FormGroup>
//                 <label>Request Type</label>
//                 <Select
//                   value={requestType}
//                   onChange={(e) => setRequestType(e.target.value)}
//                   required
//                 >
//                   <option value="other">Other Changes</option>
//                   <option value="date_change">Date Change</option>
//                   <option value="hotel_change">Hotel Change</option>
//                   <option value="activity_change">Activity Change</option>
//                   <option value="cancellation">Full Cancellation</option>
//                 </Select>
//               </FormGroup>

//               <FormGroup>
//                 <label>Priority</label>
//                 <RadioGroup>
//                   {["low", "medium", "high", "urgent"].map((level) => (
//                     <RadioLabel key={level}>
//                       <input
//                         type="radio"
//                         name="priority"
//                         value={level}
//                         checked={priority === level}
//                         onChange={(e) => setPriority(e.target.value)}
//                       />
//                       {level.charAt(0).toUpperCase() + level.slice(1)}
//                     </RadioLabel>
//                   ))}
//                 </RadioGroup>
//               </FormGroup>

//               {requestType === "date_change" && (
//                 <>
//                   <FormGroup>
//                     <label>New Start Date</label>
//                     <Input
//                       type="date"
//                       value={proposedChanges.startDate}
//                       onChange={(e) =>
//                         setProposedChanges({
//                           ...proposedChanges,
//                           startDate: e.target.value,
//                         })
//                       }
//                     />
//                   </FormGroup>
//                   <FormGroup>
//                     <label>New End Date</label>
//                     <Input
//                       type="date"
//                       value={proposedChanges.endDate}
//                       onChange={(e) =>
//                         setProposedChanges({
//                           ...proposedChanges,
//                           endDate: e.target.value,
//                         })
//                       }
//                     />
//                   </FormGroup>
//                 </>
//               )}

//               {requestType === "hotel_change" && (
//                 <FormGroup>
//                   <label>Preferred Hotel (optional)</label>
//                   <Input
//                     type="text"
//                     value={proposedChanges.hotel}
//                     onChange={(e) =>
//                       setProposedChanges({
//                         ...proposedChanges,
//                         hotel: e.target.value,
//                       })
//                     }
//                     placeholder="Enter preferred hotel name or requirements"
//                   />
//                 </FormGroup>
//               )}

//               {requestType === "activity_change" && (
//                 <FormGroup>
//                   <label>Activity Changes (optional)</label>
//                   <TextArea
//                     value={proposedChanges.activities}
//                     onChange={(e) =>
//                       setProposedChanges({
//                         ...proposedChanges,
//                         activities: e.target.value,
//                       })
//                     }
//                     placeholder="List activities you'd like to add or remove"
//                     rows={3}
//                   />
//                 </FormGroup>
//               )}

//               <FormGroup>
//                 <label>Detailed Request</label>
//                 <TextArea
//                   value={editRequest}
//                   onChange={(e) => setEditRequest(e.target.value)}
//                   placeholder="Please provide detailed information about the changes you need..."
//                   required
//                   rows={5}
//                 />
//               </FormGroup>

//               <SubmitButton
//                 type="submit"
//                 disabled={submitting || !editRequest.trim()}
//                 loading={submitting}
//               >
//                 <FiSend />
//                 {submitting ? "Submitting..." : "Submit Request"}
//               </SubmitButton>
//             </EditForm>
//           </ModalContent>
//         </Modal>
//       )}
//     </>
//   );
// }

// pages/my-trips.js - Complete trips dashboard
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};
  animation-fill-mode: both;

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #6b7280;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${(props) => props.delay || "0s"};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TripImage = styled.div`
  height: 200px;
  background: ${(props) =>
    props.image
      ? `url(${props.image}) center/cover`
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  position: relative;

  .status-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: ${(props) =>
      props.status === "confirmed"
        ? "#10b981"
        : props.status === "pending"
          ? "#f59e0b"
          : "#ef4444"};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const TripContent = styled.div`
  padding: 1.5rem;
`;

const TripTitle = styled.h3`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const TripDetails = styled.div`
  .detail-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color: #6b7280;

    svg {
      color: #667eea;
      flex-shrink: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const TripActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;

  &:hover {
    background: #5a67d8;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;

  .empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.5rem;
    color: #374151;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
`;

export default function MyTrips() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.email) {
      fetchBookings();
    }
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching bookings for:", session.user.email);

      const res = await fetch(`/api/bookings?email=${session.user.email}`);

      if (res.ok) {
        const data = await res.json();
        console.log("📦 Bookings response:", data);

        // Handle different response formats
        let bookingsList = [];
        if (Array.isArray(data)) {
          bookingsList = data;
        } else if (data.bookings && Array.isArray(data.bookings)) {
          bookingsList = data.bookings;
        }

        setBookings(bookingsList);
      } else {
        throw new Error(`Failed to fetch bookings: ${res.status}`);
      }
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError("Failed to load your trips. Please try again.");

      // Fallback: check localStorage for recent bookings
      try {
        const lastBooking = localStorage.getItem("lastBooking");
        if (lastBooking) {
          const booking = JSON.parse(lastBooking);
          setBookings([booking]);
          setError(""); // Clear error if we found something
        }
      } catch (localError) {
        console.warn("Failed to load from localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDestinationImage = (destination) => {
    const city = destination
      ?.split(",")[0]
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    return `https://source.unsplash.com/400x200/?${city},travel,city`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return "#10b981";
      case "pending":
      case "pending_payment":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleViewTrip = (booking) => {
    router.push(`/trip/${booking._id || booking.id}`);
  };

  const handleEditTrip = (booking) => {
    // Store trip data for editing
    localStorage.setItem("editingTrip", JSON.stringify(booking));
    router.push("/trip-builder");
  };

  if (status === "loading" || loading) {
    return (
      <PageWrapper>
        <Container>
          <LoadingState>
            <div className="spinner"></div>
            <p>Loading your trips...</p>
          </LoadingState>
        </Container>
      </PageWrapper>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  const totalTrips = bookings.length;
  const confirmedTrips = bookings.filter(
    (b) => b.status === "confirmed" || b.paymentStatus === "paid"
  ).length;
  const totalSpent = bookings.reduce((sum, b) => {
    const price =
      typeof b.totalPrice === "number"
        ? b.totalPrice
        : parseInt(b.price?.replace(/[^0-9]/g, "") || "0");
    return sum + price;
  }, 0);

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>My Trips Dashboard</Title>
          <Subtitle>
            Welcome back, {session.user.name || session.user.email}! Here are
            all your travel bookings.
          </Subtitle>
        </Header>

        <StatsGrid>
          <StatCard delay="0.1s">
            <div className="stat-number">{totalTrips}</div>
            <div className="stat-label">Total Trips</div>
          </StatCard>

          <StatCard delay="0.2s">
            <div className="stat-number">{confirmedTrips}</div>
            <div className="stat-label">Confirmed</div>
          </StatCard>

          <StatCard delay="0.3s">
            <div className="stat-number">${totalSpent.toLocaleString()}</div>
            <div className="stat-label">Total Spent</div>
          </StatCard>

          <StatCard delay="0.4s">
            <div className="stat-number">
              {new Set(bookings.map((b) => b.destination?.split(",")[0])).size}
            </div>
            <div className="stat-label">Destinations</div>
          </StatCard>
        </StatsGrid>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {bookings.length === 0 && !loading ? (
          <EmptyState>
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <h3>No trips yet</h3>
            <p>Start planning your first adventure!</p>
            <PrimaryButton onClick={() => router.push("/")}>
              Plan Your First Trip
            </PrimaryButton>
          </EmptyState>
        ) : (
          <TripsGrid>
            {bookings.map((booking, index) => (
              <TripCard
                key={booking._id || booking.id || index}
                delay={`${index * 0.1}s`}
              >
                <TripImage
                  image={getDestinationImage(booking.destination)}
                  status={booking.status || booking.paymentStatus}
                >
                  <div className="status-badge">
                    {booking.status === "confirmed" ||
                    booking.paymentStatus === "paid"
                      ? "Confirmed"
                      : booking.status || "Pending"}
                  </div>
                </TripImage>

                <TripContent>
                  <TripTitle>{booking.destination}</TripTitle>

                  <TripDetails>
                    <div className="detail-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      <span>{booking.duration || "Duration TBD"}</span>
                    </div>

                    {booking.month && (
                      <div className="detail-row">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{booking.month}</span>
                      </div>
                    )}

                    {booking.startDate && (
                      <div className="detail-row">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>
                          {new Date(booking.startDate).toLocaleDateString()} -{" "}
                          {booking.endDate
                            ? new Date(booking.endDate).toLocaleDateString()
                            : "TBD"}
                        </span>
                      </div>
                    )}

                    <div className="detail-row">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span>
                        $
                        {booking.totalPrice ||
                          booking.price?.replace(/[^0-9]/g, "") ||
                          "TBD"}
                      </span>
                    </div>

                    {booking.passengers && (
                      <div className="detail-row">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>
                          {booking.passengers.adults || 0} adults
                          {booking.passengers.children > 0 &&
                            `, ${booking.passengers.children} children`}
                          {booking.passengers.infants > 0 &&
                            `, ${booking.passengers.infants} infants`}
                        </span>
                      </div>
                    )}
                  </TripDetails>

                  <TripActions>
                    <PrimaryButton onClick={() => handleViewTrip(booking)}>
                      View Details
                    </PrimaryButton>
                    <SecondaryButton onClick={() => handleEditTrip(booking)}>
                      Edit Trip
                    </SecondaryButton>
                  </TripActions>
                </TripContent>
              </TripCard>
            ))}
          </TripsGrid>
        )}
      </Container>
    </PageWrapper>
  );
}

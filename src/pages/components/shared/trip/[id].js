// pages/shared/trip/[id].js - Public Trip View Page
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Head from "next/head";
import { FiCalendar } from "react-icons/fi";
import { FaUmbrellaBeach } from "react-icons/fa";

const PublicTripContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const TripCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const TripHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Destination = styled.h1`
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const TripDates = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const DetailCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const CallToAction = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  color: white;
`;

const CTAButton = styled.a`
  display: inline-block;
  margin-top: 1rem;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  }
`;

export default function SharedTripPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSharedTrip();
    }
  }, [id]);

  const fetchSharedTrip = async () => {
    try {
      const response = await fetch(`/api/share/trip/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTripData(data);
      } else {
        console.error("Failed to fetch shared trip");
      }
    } catch (error) {
      console.error("Error fetching shared trip:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicTripContainer>
        <TripCard>
          <p>Loading trip details...</p>
        </TripCard>
      </PublicTripContainer>
    );
  }

  if (!tripData) {
    return (
      <PublicTripContainer>
        <TripCard>
          <h2>Trip Not Found</h2>
          <p>This trip may have been removed or the link is invalid.</p>
        </TripCard>
      </PublicTripContainer>
    );
  }

  return (
    <>
      <Head>
        <title>Trip to {tripData.destination} - AI Travel Planner</title>
        <meta
          name="description"
          content={`Check out this amazing trip to ${tripData.destination}`}
        />
        <meta property="og:title" content={`Trip to ${tripData.destination}`} />
        <meta
          property="og:description"
          content={`${tripData.duration} trip from ${new Date(tripData.startDate).toLocaleDateString()}`}
        />
      </Head>

      <PublicTripContainer>
        <TripCard>
          <TripHeader>
            <Destination>{tripData.destination}</Destination>
            <TripDates>
              {new Date(tripData.startDate).toLocaleDateString()} -{" "}
              {new Date(tripData.endDate).toLocaleDateString()}
            </TripDates>
          </TripHeader>

          <Section>
            <SectionTitle>
              <FiCalendar />
              Trip Overview
            </SectionTitle>
            <DetailGrid>
              <DetailCard>
                <h4>Duration</h4>
                <p>{tripData.duration}</p>
              </DetailCard>
              <DetailCard>
                <h4>Travel Month</h4>
                <p>{tripData.month}</p>
              </DetailCard>
              <DetailCard>
                <h4>Hotel</h4>
                <p>{tripData.hotel}</p>
              </DetailCard>
            </DetailGrid>
          </Section>

          {tripData.activities && tripData.activities.length > 0 && (
            <Section>
              <SectionTitle>
                <FaUmbrellaBeach />
                Activities
              </SectionTitle>
              <ul>
                {tripData.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </Section>
          )}

          <CallToAction>
            <h3>Want to plan your own amazing trip?</h3>
            <p>
              Use AI Travel Planner to create personalized itineraries in
              seconds!
            </p>
            <CTAButton href="/">Start Planning</CTAButton>
          </CallToAction>
        </TripCard>
      </PublicTripContainer>
    </>
  );
}

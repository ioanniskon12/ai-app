// File: src/components/TripSection.js

import React from "react";
import styled from "styled-components";
import Image from "next/image";
import { FiCalendar, FiMapPin, FiDollarSign } from "react-icons/fi";
import { FaPlane, FaHotel } from "react-icons/fa";

// ────────────────────────────────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────────────────────────────────

const SectionWrapper = styled.div`
  margin: 4rem auto;
  max-width: 1200px;
  padding: 0 1rem;
`;

const ActionBar = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const PriceTag = styled.div`
  display: flex;
  flex-direction: column;
`;
const PriceLabel = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
`;
const PriceAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  .per-person {
    font-size: 1rem;
    font-weight: 400;
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  align-items: center;

  &.wishlist {
    background: white;
    color: #e53e3e;
    border-color: #e53e3e;
  }
  &.share {
    background: white;
    color: #3b82f6;
    border-color: #3b82f6;
  }
  &.book {
    background: #3b82f6;
    color: white;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const InfoCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  svg {
    color: #3b82f6;
  }
`;

const InfoCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
`;

const InfoCardContent = styled.div`
  color: #4b5563;
  line-height: 1.6;
`;

const LiveDataSection = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #111827;
  }
`;

const OfferCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
  }
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;
const OfferTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
`;
const OfferPrice = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #10b981;
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const WeatherCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #e5e7eb;
`;

const WeatherDay = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;
const WeatherDate = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;
const WeatherIcon = styled.div`
  font-size: 2rem;
  margin: 0.5rem 0;
`;
const WeatherTemp = styled.div`
  .high {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }
  .low {
    font-size: 0.9rem;
    color: #6b7280;
    margin-left: 0.5rem;
  }
`;

// ────────────────────────────────────────────────────────────────────────────
// TripSection Component
// ────────────────────────────────────────────────────────────────────────────

export default function TripSection({ trip, onBook }) {
  // mock live data
  const flightOffers = [
    {
      airline: "British Airways",
      price: 450,
      outbound: trip.Flight.Outbound,
      inbound: trip.Flight.Return,
    },
    {
      airline: "Virgin Atlantic",
      price: 520,
      outbound: trip.Flight.Outbound,
      inbound: trip.Flight.Return,
    },
  ];
  const hotelOffers = [
    { name: "Aman Tokyo", price: 750, night: true },
    { name: "Park Hyatt Tokyo", price: 450, night: true },
  ];
  const weather = [
    { day: "Today", date: "3/31", icon: "☀️", high: 13, low: 6 },
    { day: "Wed", date: "4/1", icon: "☁️", high: 18, low: 12 },
    { day: "Thu", date: "4/2", icon: "☀️", high: 21, low: 15 },
    { day: "Fri", date: "4/3", icon: "☁️", high: 19, low: 12 },
    { day: "Sat", date: "4/4", icon: "🌧️", high: 25, low: 18 },
    { day: "Sun", date: "4/5", icon: "⛅", high: 20, low: 14 },
    { day: "Mon", date: "4/6", icon: "🌧️", high: 21, low: 15 },
  ];

  return (
    <SectionWrapper>
      {/* ─── Action Bar ───────── */}
      <ActionBar>
        <PriceTag>
          <PriceLabel>Total Price</PriceLabel>
          <PriceAmount>
            ${trip.basePrice}
            <span className="per-person">/person</span>
          </PriceAmount>
        </PriceTag>
        <ButtonGroup>
          <ActionButton className="wishlist">Add to Wishlist</ActionButton>
          <ActionButton className="share">Share Trip</ActionButton>
          <ActionButton className="book" onClick={onBook}>
            Book Now
          </ActionButton>
        </ButtonGroup>
      </ActionBar>

      {/* ─── Info Cards ───────── */}
      <InfoGrid>
        <InfoCard>
          <InfoCardHeader>
            <FiCalendar size={24} />
            <InfoCardTitle>Travel Dates</InfoCardTitle>
          </InfoCardHeader>
          <InfoCardContent>
            {trip.StartDate} — {trip.EndDate}
            <div style={{ marginTop: "0.5rem", color: "#6b7280" }}>
              {trip.Duration}
            </div>
          </InfoCardContent>
        </InfoCard>

        <InfoCard>
          <InfoCardHeader>
            <FaPlane size={24} />
            <InfoCardTitle>Flight Details</InfoCardTitle>
          </InfoCardHeader>
          <InfoCardContent>
            <strong>Outbound:</strong> {trip.Flight.Outbound}
            <br />
            <strong>Return:</strong> {trip.Flight.Return}
          </InfoCardContent>
        </InfoCard>

        <InfoCard>
          <InfoCardHeader>
            <FaHotel size={24} />
            <InfoCardTitle>Accommodation</InfoCardTitle>
          </InfoCardHeader>
          <InfoCardContent>
            <strong>{trip.Hotel}</strong>
            <div style={{ marginTop: "0.5rem" }}>
              🏨 Free WiFi &nbsp; 🏊 Pool &nbsp; 🏋️ Gym &nbsp; ☕ Breakfast
            </div>
          </InfoCardContent>
        </InfoCard>
      </InfoGrid>

      {/* ─── Live Data ───────── */}
      <LiveDataSection>
        <SectionHeader>
          <FiMapPin size={28} className="icon" />
          <h2>
            Live Data for {trip.Destination}, {trip.Country}
          </h2>
        </SectionHeader>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Flight Offers:</h3>
          {flightOffers.map((f, i) => (
            <OfferCard key={i}>
              <OfferHeader>
                <OfferTitle>{f.airline}</OfferTitle>
                <OfferPrice>${f.price}</OfferPrice>
              </OfferHeader>
              <div>
                Out: {f.outbound} <br />
                Ret: {f.inbound}
              </div>
            </OfferCard>
          ))}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Hotel Offers:</h3>
          {hotelOffers.map((h, i) => (
            <OfferCard key={i}>
              <OfferHeader>
                <OfferTitle>{h.name}</OfferTitle>
                <OfferPrice>
                  ${h.price}
                  {h.night && (
                    <span style={{ fontSize: "0.85rem", fontWeight: 400 }}>
                      /night
                    </span>
                  )}
                </OfferPrice>
              </OfferHeader>
            </OfferCard>
          ))}
        </div>

        <div>
          <h3>7-Day Weather Forecast:</h3>
          <WeatherGrid>
            {weather.map((w, i) => (
              <WeatherCard key={i}>
                <WeatherDay>{w.day}</WeatherDay>
                <WeatherDate>{w.date}</WeatherDate>
                <WeatherIcon>{w.icon}</WeatherIcon>
                <WeatherTemp>
                  <span className="high">{w.high}°</span>
                  <span className="low">{w.low}°</span>
                </WeatherTemp>
              </WeatherCard>
            ))}
          </WeatherGrid>
        </div>
      </LiveDataSection>
    </SectionWrapper>
  );
}

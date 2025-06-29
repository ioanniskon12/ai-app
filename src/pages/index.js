// pages/index.js - Updated to go directly to trip-builder
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import {
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMinus,
  FiPlus,
  FiLoader,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import {
  FaUmbrellaBeach,
  FaMountain,
  FaCity,
  FaPlane,
  FaHotel,
} from "react-icons/fa";
import { MdChildCare, MdLuggage, MdFlight } from "react-icons/md";
import { HeroBGIMG } from "../../config/image";

// Keep all the existing animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Loading Component Styles
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }
`;

const LoadingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 4rem 3rem;
  text-align: center;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  max-width: 500px;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const LoadingIcon = styled.div`
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 2rem;
  animation: ${spin} 2s linear infinite;
`;

const LoadingTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const LoadingMessage = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const LoadingStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
      : "rgba(249, 250, 251, 0.8)"};
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid ${(props) => (props.active ? "#667eea" : "transparent")};

  .icon {
    font-size: 1.5rem;
    color: ${(props) => (props.active ? "#667eea" : "#9ca3af")};
    animation: ${(props) => (props.active ? pulse : "none")} 2s ease-in-out
      infinite;
  }

  .text {
    color: ${(props) => (props.active ? "#1f2937" : "#6b7280")};
    font-weight: ${(props) => (props.active ? "600" : "500")};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(229, 231, 235, 0.5);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  width: ${(props) => props.progress}%;
  transition: width 0.5s ease;
`;

const LoadingTips = styled.div`
  background: rgba(251, 191, 36, 0.1);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const TipTitle = styled.h4`
  color: #92400e;
  font-weight: 700;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
`;

const TipText = styled.p`
  color: #92400e;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
`;

// Hero Section Styles
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 400% 400%;
  background-image: ${HeroBGIMG};
  animation: ${gradient} 15s ease infinite;
  position: relative;
  overflow: hidden;
  /* 
 background-image: url(${HeroBGIMG});
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: cover; */

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }
`;

const HeroContainer = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 2;
`;

const HeroContent = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const HeroSuggestionChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 1.2s ease-out 0.4s both;

  @media (max-width: 600px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    justify-content: flex-start;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }
`;

const HeroChip = styled.button`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.95rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 1.1rem;
  }

  @media (max-width: 600px) {
    flex: 0 0 auto;
  }
`;

const SearchWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 1.4s ease-out 0.6s both;
`;

const HeroSearchContainer = styled.div`
  position: relative;
  z-index: 5;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 100px;
  padding: 0.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 600px) {
    border-radius: 16px;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const HeroSearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
  outline: none;
  color: #1f2937;
  font-weight: 500;

  &::placeholder {
    color: #6b7280;
    font-weight: 400;
  }

  @media (max-width: 600px) {
    width: 100%;
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
`;

const HeroPassengersButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  background: rgba(99, 102, 241, 0.1);
  margin: 0 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  color: #4f46e5;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: scale(1.05);
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    margin: 0;
  }
`;

const HeroSearchButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }

  svg {
    animation: ${(props) => (props.loading ? spin : "none")} 1s linear infinite;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const FeaturesSection = styled.div`
  margin-top: 6rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  animation: ${fadeIn} 1.6s ease-out 0.8s both;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 4rem;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: white;
  display: flex;
  justify-content: center;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 0.5rem;
`;

const FeatureDesc = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
`;

// Enhanced Dropdown styles
const HeroDropdown = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  width: 90vw;
  max-width: 420px;
  max-height: 90vh;
  z-index: 99999;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.3);
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 600px) {
    width: 95vw;
    max-width: 380px;
    border-radius: 20px;
  }
`;

const HeroDropdownHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.3)
    );
  }
`;

const CloseIcon = styled.div`
  cursor: pointer;
  font-size: 1.8rem;
  line-height: 1;
  transform: rotate(45deg);
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &:hover {
    transform: rotate(45deg) scale(1.1);
    background: rgba(255, 255, 255, 0.2);
  }
`;

const DropdownSection = styled.div`
  padding: 2rem;
  background: #fafbfc;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.6);
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(102, 126, 234, 0.02);
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 12px;
  }
`;

const LabelSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  color: #667eea;
  font-size: 1.2rem;
`;

const LabelText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.span`
  font-size: 1.125rem;
  color: #1f2937;
  font-weight: 600;
`;

const Sublabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const CountButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid ${(props) => (props.disabled ? "#e5e7eb" : "#667eea")};
  border-radius: 12px;
  background: ${(props) => (props.disabled ? "#f9fafb" : "white")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  color: ${(props) => (props.disabled ? "#9ca3af" : "#667eea")};
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const Count = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  min-width: 2.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BagsSection = styled.div`
  background: white;
  padding: 2rem;
  border-top: 1px solid rgba(229, 231, 235, 0.6);
`;

const SectionTitle = styled.h3`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: "🧳";
    font-size: 1.5rem;
  }
`;

const BagRow = styled(Row)`
  &:hover {
    background: rgba(102, 126, 234, 0.02);
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 12px;
  }
`;

const DropdownFooter = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(229, 231, 235, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FooterButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 1rem;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const PassengerSummary = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(229, 231, 235, 0.5);

  @media (max-width: 600px) {
    text-align: center;
    width: 100%;
  }
`;

const SearchPreservationNote = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  color: white;
  font-size: 0.875rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  opacity: 0.9;
`;

const DropdownBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 99998;
  animation: ${fadeIn} 0.2s ease-out;
`;

// Loading State Component
const LoadingState = ({
  title = "Creating Your Perfect Trip",
  hasChildren = false,
  step = 0,
  customMessage = null,
}) => {
  const steps = [
    { icon: FiMapPin, text: "Analyzing destinations", duration: 2000 },
    { icon: FaPlane, text: "Finding best flights", duration: 1500 },
    { icon: FaHotel, text: "AI selecting accommodations", duration: 2000 },
    {
      icon: FaUmbrellaBeach,
      text: "Curating perfect activities",
      duration: 2000,
    },
    { icon: FiCalendar, text: "Optimizing your itinerary", duration: 1500 },
  ];

  const progress = Math.min(((step + 1) / steps.length) * 100, 100);

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (hasChildren) {
      return "Our AI is working hard to create the perfect family trip with child-friendly destinations, activities, and accommodations.";
    }
    return "Our AI is analyzing thousands of destinations, flights, and activities to create your personalized trip package.";
  };

  const getTip = () => {
    const tips = [
      hasChildren
        ? "We're ensuring all recommendations are perfect for families with children!"
        : "The more specific your search, the better your personalized results!",

      hasChildren
        ? "Looking for family hotels with cribs, high chairs, and kids' menus!"
        : "AI is comparing prices across hundreds of airlines for the best deals!",

      hasChildren
        ? "Selecting accommodations with baby-changing facilities and play areas!"
        : "Finding hotels with the best reviews and perfect locations!",

      hasChildren
        ? "Curating activities that are fun and safe for the whole family!"
        : "Discovering hidden gems and must-see attractions just for you!",

      hasChildren
        ? "Optimizing travel times and activities for comfortable family travel!"
        : "Creating the perfect balance of adventure, culture, and relaxation!",
    ];

    return tips[step] || tips[0];
  };

  return (
    <LoadingContainer>
      <LoadingCard>
        <LoadingIcon>
          <FiLoader />
        </LoadingIcon>

        <LoadingTitle>{title}</LoadingTitle>
        <LoadingMessage>{getMessage()}</LoadingMessage>

        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>

        <LoadingSteps>
          {steps.map((stepItem, index) => (
            <LoadingStep key={index} active={index === step}>
              <div className="icon">
                <stepItem.icon />
              </div>
              <div className="text">{stepItem.text}</div>
            </LoadingStep>
          ))}
        </LoadingSteps>

        <LoadingTips>
          <TipTitle>
            💡 {hasChildren ? "Family Travel Tip" : "Travel Tip"}
          </TipTitle>
          <TipText>{getTip()}</TipText>
        </LoadingTips>
      </LoadingCard>
    </LoadingContainer>
  );
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [bags, setBags] = useState({
    cabin: 0,
    checked: 0,
  });
  const [passOpen, setPassOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPassOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const inc = (type, key) => {
    if (type === "passengers") {
      setPassengers((p) => ({ ...p, [key]: p[key] + 1 }));
    } else {
      setBags((b) => ({ ...b, [key]: b[key] + 1 }));
    }
  };

  const dec = (type, key) => {
    if (type === "passengers") {
      setPassengers((p) => ({
        ...p,
        [key]: Math.max(key === "adults" ? 1 : 0, p[key] - 1),
      }));
    } else {
      setBags((b) => ({
        ...b,
        [key]: Math.max(0, b[key] - 1),
      }));
    }
  };

  const getTotalPassengers = () => {
    const parts = [];
    if (passengers.adults > 0) parts.push(`${passengers.adults}A`);
    if (passengers.children > 0) parts.push(`${passengers.children}C`);
    if (passengers.infants > 0) parts.push(`${passengers.infants}I`);
    return parts.join(" ");
  };

  // Updated search function to go directly to trip-builder
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setLoadingStep(0);
    setError("");

    // Save all search data to localStorage for persistence
    const searchData = {
      query: query,
      passengers: passengers,
      bags: bags,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("searchData", JSON.stringify(searchData));
    localStorage.setItem("searchQuery", query);
    localStorage.setItem("passengers", JSON.stringify(passengers));
    localStorage.setItem("bags", JSON.stringify(bags));

    try {
      // Step 1: Analyzing destinations
      setLoadingStep(0);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Finding best flights
      setLoadingStep(1);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 3: Start AI generation and selecting accommodations
      setLoadingStep(2);

      // Actually call the AI API
      const aiPromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          passengers: passengers,
        }),
      });

      // Show "Selecting accommodations" step for at least 2 seconds
      const minWaitPromise = new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      // Wait for both the minimum time AND the AI response
      const [aiResponse] = await Promise.all([aiPromise, minWaitPromise]);

      if (!aiResponse.ok) {
        throw new Error("Failed to generate trip");
      }

      // Step 4: Curating activities
      setLoadingStep(3);

      // Parse the AI response
      const { result } = await aiResponse.json();
      const trips = typeof result === "string" ? JSON.parse(result) : result;

      // Show "Curating activities" step for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 5: Optimizing itinerary
      setLoadingStep(4);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process the first trip (or best match)
      const trip = trips[0];
      const today = new Date();
      let year = today.getFullYear();
      let mStart = new Date(`${trip.Month} 1, ${year}`);
      if (mStart < today) {
        year++;
        mStart = new Date(`${trip.Month} 1, ${year}`);
      }
      const days = parseInt(trip.Duration, 10) || 5;
      const iso = (d) => d.toISOString().split("T")[0];
      const StartDate = iso(mStart);
      const end = new Date(mStart);
      end.setDate(mStart.getDate() + days - 1);
      const EndDate = iso(end);
      const basePrice = parseInt(trip.Price.replace(/[^0-9]/g, ""), 10);

      const processedTrip = {
        ...trip,
        id: Date.now().toString(),
        StartDate,
        EndDate,
        basePrice,
        passengers: passengers,
        searchQuery: query,
      };

      // Save the generated trip to localStorage
      localStorage.setItem("generatedTrip", JSON.stringify(processedTrip));
      localStorage.setItem("selectedTrip", JSON.stringify(processedTrip));

      // Check authentication and redirect to trip-builder
      if (session) {
        router.push("/trip-builder");
      } else {
        // Save redirect path and go to login
        localStorage.setItem("redirectAfterLogin", "/trip-builder");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      setError("Failed to generate trip. Please try again.");
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const suggestions = [
    {
      icon: <FaUmbrellaBeach />,
      text: "5-day romantic trip to Paris in spring",
    },
    { icon: <FaMountain />, text: "Adventure trip to Tokyo for 7 days" },
    { icon: <FaCity />, text: "Family vacation to Rome with kids" },
    { icon: <FaPlane />, text: "Weekend getaway to Barcelona" },
    { icon: <FaHotel />, text: "Cultural tour of London for a week" },
  ];

  const features = [
    {
      icon: <MdFlight />,
      title: "Smart Flight Search",
      desc: "AI-powered search finds the best flights tailored to your preferences and family needs",
    },
    {
      icon: <FiSearch />,
      title: "Interactive Trip Builder",
      desc: "Refine and customize your perfect trip with real-time AI assistance",
    },
    {
      icon: <FaHotel />,
      title: "Family-Friendly Planning",
      desc: "Automatic child-friendly activities and amenities when traveling with kids",
    },
    {
      icon: <FaCity />,
      title: "Weather-Aware Itineraries",
      desc: "Real-time weather data helps plan your perfect travel dates",
    },
  ];

  const handleSuggestion = (s) => setQuery(s);

  const hasChildren = passengers.children > 0 || passengers.infants > 0;

  // Show loading state when searching
  if (loading) {
    return (
      <LoadingState
        title="Creating Your Perfect Trip"
        hasChildren={hasChildren}
        step={loadingStep}
        customMessage={
          hasChildren
            ? "Our AI is working hard to create the perfect family trip with child-friendly destinations, activities, and accommodations."
            : null
        }
      />
    );
  }

  // Passenger Dropdown Component
  const PassengerDropdown = () => {
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        setPassOpen(false);
      }
    };

    if (!passOpen) return null;

    return (
      <>
        <DropdownBackdrop onClick={handleBackdropClick} />
        <HeroDropdown>
          <HeroDropdownHeader>
            Passengers
            <CloseIcon onClick={() => setPassOpen(false)}>+</CloseIcon>
          </HeroDropdownHeader>

          <DropdownSection>
            <Row>
              <LabelSection>
                <IconWrapper>
                  <FiUser size={20} />
                </IconWrapper>
                <LabelText>
                  <Label>Adults</Label>
                  <Sublabel>Over 11</Sublabel>
                </LabelText>
              </LabelSection>
              <Controls>
                <CountButton
                  onClick={() => dec("passengers", "adults")}
                  disabled={passengers.adults <= 1}
                >
                  <FiMinus size={16} />
                </CountButton>
                <Count>{passengers.adults}</Count>
                <CountButton onClick={() => inc("passengers", "adults")}>
                  <FiPlus size={16} />
                </CountButton>
              </Controls>
            </Row>

            <Row>
              <LabelSection>
                <IconWrapper>
                  <MdChildCare size={20} />
                </IconWrapper>
                <LabelText>
                  <Label>Children</Label>
                  <Sublabel>2 - 11</Sublabel>
                </LabelText>
              </LabelSection>
              <Controls>
                <CountButton
                  onClick={() => dec("passengers", "children")}
                  disabled={passengers.children <= 0}
                >
                  <FiMinus size={16} />
                </CountButton>
                <Count>{passengers.children}</Count>
                <CountButton onClick={() => inc("passengers", "children")}>
                  <FiPlus size={16} />
                </CountButton>
              </Controls>
            </Row>

            <Row>
              <LabelSection>
                <IconWrapper>
                  <MdChildCare size={16} />
                </IconWrapper>
                <LabelText>
                  <Label>Infants</Label>
                  <Sublabel>Under 2</Sublabel>
                </LabelText>
              </LabelSection>
              <Controls>
                <CountButton
                  onClick={() => dec("passengers", "infants")}
                  disabled={passengers.infants <= 0}
                >
                  <FiMinus size={16} />
                </CountButton>
                <Count>{passengers.infants}</Count>
                <CountButton onClick={() => inc("passengers", "infants")}>
                  <FiPlus size={16} />
                </CountButton>
              </Controls>
            </Row>
          </DropdownSection>

          <BagsSection>
            <SectionTitle>Bags</SectionTitle>

            <BagRow>
              <LabelSection>
                <IconWrapper>
                  <MdLuggage size={20} />
                </IconWrapper>
                <LabelText>
                  <Label>Cabin baggage</Label>
                  <Sublabel>Small carry-on items</Sublabel>
                </LabelText>
              </LabelSection>
              <Controls>
                <CountButton
                  onClick={() => dec("bags", "cabin")}
                  disabled={bags.cabin <= 0}
                >
                  <FiMinus size={16} />
                </CountButton>
                <Count>{bags.cabin}</Count>
                <CountButton onClick={() => inc("bags", "cabin")}>
                  <FiPlus size={16} />
                </CountButton>
              </Controls>
            </BagRow>

            <BagRow>
              <LabelSection>
                <IconWrapper>
                  <MdLuggage size={20} />
                </IconWrapper>
                <LabelText>
                  <Label>Checked baggage</Label>
                  <Sublabel>Large suitcases</Sublabel>
                </LabelText>
              </LabelSection>
              <Controls>
                <CountButton
                  onClick={() => dec("bags", "checked")}
                  disabled={bags.checked <= 0}
                >
                  <FiMinus size={16} />
                </CountButton>
                <Count>{bags.checked}</Count>
                <CountButton onClick={() => inc("bags", "checked")}>
                  <FiPlus size={16} />
                </CountButton>
              </Controls>
            </BagRow>
          </BagsSection>

          <DropdownFooter>
            <FooterButton onClick={() => setPassOpen(false)}>
              <FiUser />
              Apply Selection
            </FooterButton>
            <PassengerSummary>
              {getTotalPassengers()} • {bags.cabin + bags.checked} bags
            </PassengerSummary>
          </DropdownFooter>
        </HeroDropdown>
      </>
    );
  };

  return (
    <HeroSection>
      <HeroContainer>
        <HeroContent>
          <HeroTitle>Where Dreams Take Flight</HeroTitle>
          <Subtitle>
            Let AI craft your perfect journey in seconds
            {hasChildren && " - family-friendly adventures included!"}
          </Subtitle>
        </HeroContent>

        <HeroSuggestionChips>
          {suggestions.map((suggestion, i) => (
            <HeroChip key={i} onClick={() => handleSuggestion(suggestion.text)}>
              {suggestion.icon}
              {suggestion.text}
            </HeroChip>
          ))}
        </HeroSuggestionChips>

        <SearchWrapper>
          <HeroSearchContainer>
            <HeroSearchInput
              type="text"
              placeholder={
                hasChildren
                  ? "Describe your family adventure..."
                  : "Describe your dream destination..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <HeroPassengersButton onClick={() => setPassOpen(!passOpen)}>
              <FiUser />
              {getTotalPassengers()}
              {passOpen ? <FiChevronUp /> : <FiChevronDown />}
            </HeroPassengersButton>

            <HeroSearchButton
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              loading={loading}
            >
              <FiSearch />
              {loading ? "Searching..." : "Search"}
            </HeroSearchButton>
          </HeroSearchContainer>
          {passOpen && <PassengerDropdown />}
          {query && (
            <SearchPreservationNote>
              <FiSearch />
              Your search will be saved and you can refine it in the trip
              builder
            </SearchPreservationNote>
          )}
        </SearchWrapper>

        <FeaturesSection>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDesc>{feature.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeaturesSection>
      </HeroContainer>
    </HeroSection>
  );
}

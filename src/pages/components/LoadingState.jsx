// src/components/LoadingState.jsx
import styled, { keyframes } from "styled-components";
import { FiLoader, FiPlane, FiMapPin, FiCalendar } from "react-icons/fi";
import { FaHotel, FaUmbrellaBeach } from "react-icons/fa";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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

const LoadingState = ({
  title = "Creating Your Perfect Trip",
  hasChildren = false,
  step = 0,
  customMessage = null,
}) => {
  const steps = [
    { icon: FiMapPin, text: "Analyzing destinations", duration: 2000 },
    { icon: FiPlane, text: "Finding best flights", duration: 3000 },
    { icon: FaHotel, text: "Selecting accommodations", duration: 2500 },
    { icon: FaUmbrellaBeach, text: "Curating activities", duration: 2000 },
    { icon: FiCalendar, text: "Optimizing itinerary", duration: 1500 },
  ];

  const progress = Math.min(((step + 1) / steps.length) * 100, 100);

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (hasChildren) {
      return "Our AI is carefully selecting family-friendly destinations, activities, and accommodations perfect for traveling with children.";
    }
    return "Our AI is analyzing thousands of destinations, flights, and activities to create your perfect personalized trip.";
  };

  const getTip = () => {
    if (hasChildren) {
      return "We're including child-friendly activities, family hotels with proper amenities, and ensuring all recommendations are suitable for traveling with kids!";
    }
    return "The more specific your search, the better our AI can tailor your perfect trip. Try mentioning preferred activities, budget, or travel style!";
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
          <TipTitle>💡 Did you know?</TipTitle>
          <TipText>{getTip()}</TipText>
        </LoadingTips>
      </LoadingCard>
    </LoadingContainer>
  );
};

export default LoadingState;

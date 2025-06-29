// pages/about.js
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  FiUsers,
  FiTarget,
  FiHeart,
  FiGlobe,
  FiAward,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiStar,
  FiMail,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaPlane,
  FaRocket,
  FaHandshake,
  FaChartLine,
  FaUsers,
  FaLinkedin,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const counter = keyframes`
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
`;

// Page Wrapper
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

// Hero Section
const HeroSection = styled.section`
  position: relative;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  padding: 8rem 0 10rem;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
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

  @media (max-width: 768px) {
    padding: 6rem 0 8rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeroContent = styled.div`
  text-align: center;
  color: white;
  animation: ${fadeIn} 1s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 3rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FloatingIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
`;

// Stats Section
const StatsSection = styled.section`
  margin-top: -5rem;
  position: relative;
  z-index: 10;
  margin-bottom: 5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
  }
`;

const StatIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;

  svg {
    font-size: 2.5rem;
    color: #667eea;
  }
`;

const StatNumber = styled.h3`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  animation: ${counter} 0.8s ease-out;
`;

const StatLabel = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 500;
`;

// Mission Section
const MissionSection = styled.section`
  padding: 5rem 0;
  background: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    left: -50px;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    opacity: 0.1;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #f093fb 0%, #4facfe 100%);
    border-radius: 50%;
    opacity: 0.1;
  }
`;

const MissionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const MissionContent = styled.div`
  animation: ${slideIn} 0.8s ease-out;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SectionText = styled.p`
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;

  svg {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: #667eea;
    margin-top: 0.25rem;
  }

  div {
    h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    p {
      color: #6b7280;
      line-height: 1.6;
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.2) 0%,
      rgba(118, 75, 162, 0.2) 100%
    );
    z-index: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Values Section
const ValuesSection = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const ValueCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  animation: ${fadeIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
  }
`;

const ValueIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.2) 0%,
      rgba(118, 75, 162, 0.2) 100%
    );
    border-radius: 50%;
    z-index: -1;
  }

  svg {
    font-size: 3rem;
    color: white;
  }
`;

const ValueTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const ValueText = styled.p`
  color: #6b7280;
  line-height: 1.6;
`;

// Team Section
const TeamSection = styled.section`
  padding: 5rem 0;
  background: white;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const TeamMember = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;
`;

const MemberImage = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: scale(1.05);

    &::before {
      opacity: 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberName = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MemberRole = styled.p`
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const MemberBio = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-4px);
  }

  svg {
    font-size: 1rem;
  }
`;

// CTA Section
const CTASection = styled.section`
  padding: 5rem 0;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  text-align: center;
  position: relative;
  overflow: hidden;

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

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  color: white;
  animation: ${fadeIn} 0.8s ease-out;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${(props) =>
    props.primary ? "white" : "rgba(255, 255, 255, 0.1)"};
  color: ${(props) => (props.primary ? "#667eea" : "white")};
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  transition: all 0.3s;
  border: 2px solid
    ${(props) => (props.primary ? "white" : "rgba(255, 255, 255, 0.3)")};
  backdrop-filter: blur(10px);
  animation: ${(props) => (props.primary ? pulse : "none")} 2s ease-in-out
    infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    background: ${(props) =>
      props.primary
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "rgba(255, 255, 255, 0.2)"};
    color: white;
    border-color: transparent;
  }

  svg {
    font-size: 1.25rem;
  }
`;

// Main Component
export default function AboutPage() {
  const features = [
    {
      icon: <FiTarget />,
      title: "AI-Powered Planning",
      description:
        "Our advanced AI understands your preferences to create personalized travel experiences",
    },
    {
      icon: <FiShield />,
      title: "Trusted by Thousands",
      description:
        "Join our community of happy travelers who've discovered their dream destinations",
    },
    {
      icon: <FiZap />,
      title: "Instant Booking",
      description:
        "From planning to booking, we make your travel dreams reality in minutes",
    },
  ];

  const values = [
    {
      icon: <FiHeart />,
      title: "Passion for Travel",
      text: "We believe everyone deserves to explore the world. Our passion drives us to make travel accessible and unforgettable.",
    },
    {
      icon: <FiUsers />,
      title: "Customer First",
      text: "Your satisfaction is our priority. We're here 24/7 to ensure your journey is smooth from start to finish.",
    },
    {
      icon: <FiGlobe />,
      title: "Global Perspective",
      text: "With partnerships worldwide, we bring you authentic experiences and the best deals across the globe.",
    },
    {
      icon: <FiAward />,
      title: "Excellence",
      text: "We strive for excellence in everything we do, from our AI technology to our customer service.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Travel enthusiast with 15+ years in the industry",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "AI expert passionate about revolutionizing travel",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
      name: "Emma Davis",
      role: "Head of Customer Success",
      bio: "Dedicated to making every journey memorable",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
    {
      name: "James Wilson",
      role: "Lead Designer",
      bio: "Creating beautiful experiences for travelers",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
  ];

  return (
    <>
      <PageWrapper>
        {/* Hero Section */}
        <HeroSection>
          <Container>
            <HeroContent>
              <FloatingIcon>
                <FaRocket />
              </FloatingIcon>
              <HeroTitle>Revolutionizing Travel with AI</HeroTitle>
              <HeroSubtitle>
                We re on a mission to make travel planning effortless,
                personalized, and unforgettable for everyone, everywhere.
              </HeroSubtitle>
            </HeroContent>
          </Container>
        </HeroSection>

        {/* Stats Section */}
        <Container>
          <StatsSection>
            <StatsGrid>
              <StatCard>
                <StatIcon>
                  <FaUsers />
                </StatIcon>
                <StatNumber>50K+</StatNumber>
                <StatLabel>Happy Travelers</StatLabel>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <FiGlobe />
                </StatIcon>
                <StatNumber>150+</StatNumber>
                <StatLabel>Destinations</StatLabel>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <FiStar />
                </StatIcon>
                <StatNumber>4.9</StatNumber>
                <StatLabel>Average Rating</StatLabel>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <FiTrendingUp />
                </StatIcon>
                <StatNumber>98%</StatNumber>
                <StatLabel>Satisfaction Rate</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>
        </Container>

        {/* Mission Section */}
        <MissionSection>
          <Container>
            <MissionGrid>
              <MissionContent>
                <SectionTitle>Our Story</SectionTitle>
                <SectionText>
                  Founded in 2023, AI Travel Planner was born from a simple
                  idea: travel planning should be exciting, not exhausting. Our
                  founders, seasoned travelers themselves, experienced firsthand
                  the hours spent researching, comparing, and booking trips.
                </SectionText>
                <SectionText>
                  We knew there had to be a better way. By combining
                  cutting-edge AI technology with deep travel industry
                  expertise, we created a platform that understands your
                  preferences and delivers personalized travel experiences in
                  seconds.
                </SectionText>
                <FeatureList>
                  {features.map((feature, index) => (
                    <FeatureItem key={index} delay={`${index * 0.1}s`}>
                      {feature.icon}
                      <div>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </FeatureItem>
                  ))}
                </FeatureList>
              </MissionContent>
              <ImageWrapper>
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"
                  alt="Our team at work"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </ImageWrapper>
            </MissionGrid>
          </Container>
        </MissionSection>

        {/* Values Section */}
        <ValuesSection>
          <Container>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionTitle style={{ marginBottom: "1rem" }}>
                Our Values
              </SectionTitle>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1.125rem",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                These core values guide everything we do and shape how we serve
                our travelers
              </p>
            </div>
            <ValuesGrid>
              {values.map((value, index) => (
                <ValueCard key={index} delay={`${index * 0.1}s`}>
                  <ValueIcon>{value.icon}</ValueIcon>
                  <ValueTitle>{value.title}</ValueTitle>
                  <ValueText>{value.text}</ValueText>
                </ValueCard>
              ))}
            </ValuesGrid>
          </Container>
        </ValuesSection>

        {/* Team Section */}
        <TeamSection>
          <Container>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <SectionTitle style={{ marginBottom: "1rem" }}>
                Meet Our Team
              </SectionTitle>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1.125rem",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                Passionate individuals working together to transform the travel
                industry
              </p>
            </div>
            <TeamGrid>
              {team.map((member, index) => (
                <TeamMember key={index} delay={`${index * 0.1}s`}>
                  <MemberImage>
                    <img src={member.image} alt={member.name} />
                  </MemberImage>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                  <MemberBio>{member.bio}</MemberBio>
                  <SocialLinks>
                    <SocialLink
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaLinkedin />
                    </SocialLink>
                    <SocialLink
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTwitter />
                    </SocialLink>
                    <SocialLink
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaGithub />
                    </SocialLink>
                  </SocialLinks>
                </TeamMember>
              ))}
            </TeamGrid>
          </Container>
        </TeamSection>

        {/* CTA Section */}
        <CTASection>
          <Container>
            <CTAContent>
              <CTATitle>Ready to Start Your Journey?</CTATitle>
              <CTAText>
                Join thousands of travelers who ve discovered the joy of
                effortless travel planning
              </CTAText>
              <CTAButtons>
                <CTAButton href="/" primary>
                  <FaPlane />
                  Start Planning
                </CTAButton>
                <CTAButton href="/contact">
                  <FiMail />
                  Contact Us
                </CTAButton>
              </CTAButtons>
            </CTAContent>
          </Container>
        </CTASection>
      </PageWrapper>
    </>
  );
}

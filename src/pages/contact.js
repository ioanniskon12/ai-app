// pages/contact.js
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Head from "next/head";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiCheck,
  FiAlertCircle,
  FiHelpCircle,
} from "react-icons/fi";
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaHeadset,
  FaEnvelope,
} from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Page Wrapper
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

// Hero Section
const HeroSection = styled.div`
  position: relative;
  width: 100%;
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
  padding: 6rem 0 8rem;
  overflow: hidden;

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

  @media (max-width: 768px) {
    padding: 4rem 0 6rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const FloatingIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
  opacity: 0.9;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
  color: white;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Main Container
const Container = styled.div`
  max-width: 1200px;
  margin: -60px auto 0;
  padding: 0 2rem 4rem;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 0 1rem 3rem;
    margin-top: -40px;
  }
`;

// Content Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Contact Form Card
const FormCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }
`;

const FormSubtitle = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.125rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  pointer-events: none;
  transition: all 0.3s;

  ${(props) =>
    props.focused &&
    `
    color: #667eea;
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }

  svg {
    font-size: 1.25rem;
  }
`;

// Contact Info Card
const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out ${(props) => props.delay || "0.3s"} both;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  animation: ${slideIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;

  svg {
    font-size: 1.25rem;
  }
`;

const InfoContent = styled.div`
  flex: 1;

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

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }
`;

// Social Links
const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLink = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s;
  text-decoration: none;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 1.25rem;
  }
`;

// Map Section
const MapSection = styled.div`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 4rem;
  animation: ${fadeIn} 0.8s ease-out 0.5s both;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const MapTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1.125rem;
  position: relative;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

// Alert Messages
const Alert = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${fadeIn} 0.3s ease-out;

  ${(props) =>
    props.type === "success" &&
    `
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  `}

  ${(props) =>
    props.type === "error" &&
    `
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  `}

  svg {
    font-size: 1.25rem;
  }
`;

// FAQ Section
const FAQSection = styled.div`
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 24px;
  animation: ${fadeIn} 0.8s ease-out 0.6s both;

  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  p {
    color: #6b7280;
    font-size: 1.125rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FAQButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  padding: 0.875rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

// Main Component
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setAlert({
        type: "success",
        message:
          "Thank you for your message! We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Clear alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Contact Us – AI Travel Planner</title>
        <meta
          name="description"
          content="Get in touch with AI Travel Planner for support, questions, or feedback"
        />
      </Head>

      <PageWrapper>
        {/* Hero Section */}
        <HeroSection>
          <HeroContent>
            <FloatingIcon>
              <FaHeadset />
            </FloatingIcon>
            <HeroTitle>Get in Touch</HeroTitle>
            <HeroSubtitle>
              We are here to help make your travel dreams come true
            </HeroSubtitle>
          </HeroContent>
        </HeroSection>

        <Container>
          {/* Main Content Grid */}
          <ContentGrid>
            {/* Contact Form */}
            <FormCard>
              <FormTitle>
                <FaEnvelope />
                Send us a Message
              </FormTitle>
              <FormSubtitle>
                Fill out the form below and we ll get back to you as soon as
                possible
              </FormSubtitle>

              {alert && (
                <Alert type={alert.type}>
                  {alert.type === "success" ? <FiCheck /> : <FiAlertCircle />}
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Your Name</Label>
                  <InputWrapper>
                    <InputIcon focused={focusedField === "name"}>
                      <FiUser />
                    </InputIcon>
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField("")}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <InputIcon focused={focusedField === "email"}>
                      <FiMail />
                    </InputIcon>
                    <Input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Subject</Label>
                  <InputWrapper>
                    <InputIcon focused={focusedField === "subject"}>
                      <FiMessageSquare />
                    </InputIcon>
                    <Input
                      type="text"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField("")}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Message</Label>
                  <InputWrapper>
                    <InputIcon
                      focused={focusedField === "message"}
                      style={{
                        alignItems: "flex-start",
                        paddingTop: "0.875rem",
                      }}
                    >
                      <FiMessageSquare />
                    </InputIcon>
                    <TextArea
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField("")}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <SubmitButton type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                  <FiSend />
                </SubmitButton>
              </Form>
            </FormCard>

            {/* Contact Info */}
            <InfoCard>
              <InfoSection delay="0.3s">
                <InfoTitle>
                  <FiPhone />
                  Contact Information
                </InfoTitle>

                <InfoItem delay="0.4s">
                  <InfoIcon>
                    <FiMail />
                  </InfoIcon>
                  <InfoContent>
                    <h4>Email Us</h4>
                    <p>
                      <a href="mailto:support@aitravelplanner.com">
                        support@aitravelplanner.com
                      </a>
                    </p>
                  </InfoContent>
                </InfoItem>

                <InfoItem delay="0.5s">
                  <InfoIcon>
                    <FiPhone />
                  </InfoIcon>
                  <InfoContent>
                    <h4>Call Us</h4>
                    <p>
                      <a href="tel:+1234567890">+1 (234) 567-890</a>
                    </p>
                  </InfoContent>
                </InfoItem>

                <InfoItem delay="0.6s">
                  <InfoIcon>
                    <FiMapPin />
                  </InfoIcon>
                  <InfoContent>
                    <h4>Visit Us</h4>
                    <p>
                      123 Travel Street, Suite 100
                      <br />
                      San Francisco, CA 94107
                    </p>
                  </InfoContent>
                </InfoItem>

                <InfoItem delay="0.7s">
                  <InfoIcon>
                    <FiClock />
                  </InfoIcon>
                  <InfoContent>
                    <h4>Business Hours</h4>
                    <p>
                      Monday - Friday: 9:00 AM - 6:00 PM EST
                      <br />
                      Saturday - Sunday: 10:00 AM - 4:00 PM EST
                    </p>
                  </InfoContent>
                </InfoItem>
              </InfoSection>

              <InfoSection delay="0.4s">
                <InfoTitle>Connect With Us</InfoTitle>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                  Follow us on social media for travel tips, updates, and
                  exclusive offers
                </p>
                <SocialLinks>
                  <SocialLink
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitter />
                  </SocialLink>
                  <SocialLink
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook />
                  </SocialLink>
                  <SocialLink
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                  </SocialLink>
                  <SocialLink
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin />
                  </SocialLink>
                </SocialLinks>
              </InfoSection>
            </InfoCard>
          </ContentGrid>

          {/* Map Section */}
          <MapSection>
            <MapTitle>Find Us on the Map</MapTitle>
            <MapContainer>
              {/* Replace with actual Google Maps embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977105091553!2d-122.39476668468179!3d37.78779497975775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807f619a62df%3A0x491ce2f73977af35!2sSalesforce%20Tower!5e0!3m2!1sen!2sus!4v1634567890123!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </MapContainer>
          </MapSection>

          {/* FAQ CTA */}
          <FAQSection>
            <h3>Have More Questions?</h3>
            <p>
              Check out our frequently asked questions for quick answers to
              common queries
            </p>
            <FAQButton href="/faq">
              Visit FAQ Page
              <FiHelpCircle />
            </FAQButton>
          </FAQSection>
        </Container>
      </PageWrapper>
    </>
  );
}

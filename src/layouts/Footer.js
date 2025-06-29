// components/Footer.js
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiChevronRight,
  FiHeart,
} from "react-icons/fi";
import {
  FaPlane,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaPinterest,
} from "react-icons/fa";

// Animations
const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Main Footer Container
const FooterWrapper = styled.footer`
  position: relative;
  background: #0f172a;
  color: white;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(
      90deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #667eea 100%
    );
    background-size: 200% 200%;
    animation: ${gradient} 3s ease infinite;
  }
`;

// Wave SVG at top
const WaveDecoration = styled.div`
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;

  svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 60px;
  }

  .shape-fill {
    fill: #f5f7fa;
  }
`;

// Newsletter Section
const NewsletterSection = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 4rem 0;
  position: relative;
  z-index: 10;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: -1;
  }
`;

const NewsletterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const NewsletterIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  display: inline-block;
  animation: ${float} 3s ease-in-out infinite;
`;

const NewsletterTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const NewsletterSubtitle = styled.p`
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NewsletterButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  svg {
    font-size: 1.25rem;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

// Main Footer Content
const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem 2rem;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div`
  animation: ${fadeIn} 0.8s ease-out ${(props) => props.delay || "0s"} both;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;

  svg {
    font-size: 2.5rem;
    color: #667eea;
  }
`;

const FooterDescription = styled.p`
  color: #94a3b8;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.75rem;

  a {
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      color: #667eea;
      transform: translateX(5px);

      svg {
        opacity: 1;
        transform: translateX(0);
      }
    }

    svg {
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #94a3b8;

  svg {
    color: #667eea;
    margin-top: 0.25rem;
    flex-shrink: 0;
  }

  a {
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      color: #667eea;
    }
  }
`;

// Social Links
const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    color: white;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 1.125rem;
  }
`;

// Bottom Bar
const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #ef4444;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 640px) {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  a {
    color: #64748b;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      color: #667eea;
    }
  }
`;

// Payment Methods
const PaymentMethods = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;

  img {
    height: 30px;
    opacity: 0.7;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
`;

// Main Component
export default function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription");
  };

  return (
    <FooterWrapper>
      {/* Wave Decoration */}
      <WaveDecoration>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </WaveDecoration>

      {/* Newsletter Section */}
      <NewsletterSection>
        <NewsletterContainer>
          <NewsletterIcon>
            <FiMail />
          </NewsletterIcon>
          <NewsletterTitle>Stay Updated on Travel Deals</NewsletterTitle>
          <NewsletterSubtitle>
            Get exclusive offers and travel tips delivered straight to your
            inbox
          </NewsletterSubtitle>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <NewsletterInput
              type="email"
              placeholder="Enter your email address"
              required
            />
            <NewsletterButton type="submit">
              Subscribe
              <FiSend />
            </NewsletterButton>
          </NewsletterForm>
        </NewsletterContainer>
      </NewsletterSection>

      {/* Main Footer Content */}
      <FooterContent>
        <FooterGrid>
          {/* Company Info */}
          <FooterColumn delay="0.1s">
            <FooterLogo>
              <FaPlane />
              AI Travel
            </FooterLogo>
            <FooterDescription>
              Your AI-powered travel companion. Discover amazing destinations,
              plan perfect trips, and create unforgettable memories with our
              intelligent travel planning platform.
            </FooterDescription>
            <SocialLinks>
              <SocialLink
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </SocialLink>
              <SocialLink
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
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
              <SocialLink
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </SocialLink>
              <SocialLink
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaPinterest />
              </SocialLink>
            </SocialLinks>
          </FooterColumn>

          {/* Quick Links */}
          <FooterColumn delay="0.2s">
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLinks>
              <FooterLink>
                <Link href="/deals">
                  <FiChevronRight />
                  Hot Deals
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/destinations">
                  <FiChevronRight />
                  Destinations
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/blog">
                  <FiChevronRight />
                  Travel Blog
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/about">
                  <FiChevronRight />
                  About Us
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/careers">
                  <FiChevronRight />
                  Careers
                </Link>
              </FooterLink>
            </FooterLinks>
          </FooterColumn>

          {/* Support */}
          <FooterColumn delay="0.3s">
            <FooterTitle>Support</FooterTitle>
            <FooterLinks>
              <FooterLink>
                <Link href="/faq">
                  <FiChevronRight />
                  FAQ
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/contact">
                  <FiChevronRight />
                  Contact Us
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/help">
                  <FiChevronRight />
                  Help Center
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/cancellation">
                  <FiChevronRight />
                  Cancellation Policy
                </Link>
              </FooterLink>
              <FooterLink>
                <Link href="/refunds">
                  <FiChevronRight />
                  Refunds
                </Link>
              </FooterLink>
            </FooterLinks>
          </FooterColumn>

          {/* Contact */}
          <FooterColumn delay="0.4s">
            <FooterTitle>Get in Touch</FooterTitle>
            <ContactInfo>
              <ContactItem>
                <FiPhone />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </ContactItem>
              <ContactItem>
                <FiMail />
                <a href="mailto:support@aitravelplanner.com">
                  support@aitravelplanner.com
                </a>
              </ContactItem>
              <ContactItem>
                <FiMapPin />
                <span>
                  123 Travel Street, Suite 100
                  <br />
                  San Francisco, CA 94107
                </span>
              </ContactItem>
            </ContactInfo>
            <PaymentMethods>
              <img src="/images/visa.png" alt="Visa" />
              <img src="/images/mastercard.png" alt="Mastercard" />
              <img src="/images/amex.png" alt="American Express" />
              <img src="/images/paypal.png" alt="PayPal" />
            </PaymentMethods>
          </FooterColumn>
        </FooterGrid>

        {/* Bottom Bar */}
        <FooterBottom>
          <Copyright>
            © 2025 AI Travel Planner. Made with <FiHeart /> by our team
          </Copyright>
          <BottomLinks>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/sitemap">Sitemap</Link>
          </BottomLinks>
        </FooterBottom>
      </FooterContent>
    </FooterWrapper>
  );
}

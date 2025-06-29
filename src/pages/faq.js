// pages/faq.js
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Head from "next/head";
import {
  FiChevronDown,
  FiHelpCircle,
  FiMail,
  FiUser,
  FiCreditCard,
  FiEdit3,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";
import { FaQuestionCircle } from "react-icons/fa";

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

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
`;

// Page Container
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;

  @media (max-width: 768px) {
    padding: 0 1rem 3rem;
  }
`;

// Header Section
const HeaderWrapper = styled.div`
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 400px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -60px;
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
    height: 300px;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 0 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const FloatingIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
  opacity: 0.9;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Search Bar
const SearchContainer = styled.div`
  position: relative;
  max-width: 700px;
  margin: 3rem auto 4rem;
  z-index: 10;
`;

const SearchBar = styled.div`
  position: relative;
  background: white;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  }

  svg {
    color: #9ca3af;
    font-size: 1.25rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.125rem;
  color: #1f2937;
  font-weight: 500;

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

// Category Pills
const CategoryContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const CategoryPill = styled.button`
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "white"};
  color: ${(props) => (props.active ? "white" : "#6b7280")};
  border: 2px solid ${(props) => (props.active ? "transparent" : "#e5e7eb")};
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    ${(props) =>
      !props.active &&
      `
      background: #f9fafb;
      border-color: #667eea;
      color: #667eea;
    `}
  }

  svg {
    font-size: 1.125rem;
  }
`;

// Accordion Section
const AccordionContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AccordionItem = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  animation: ${fadeIn} 0.6s ease-out ${(props) => props.index * 0.1}s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  ${(props) =>
    props.isOpen &&
    `
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  `}
`;

const QuestionButton = styled.button`
  width: 100%;
  background: ${(props) =>
    props.isOpen
      ? "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)"
      : "white"};
  border: none;
  padding: 1.5rem 2rem;
  text-align: left;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.3s;
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: ${(props) => (props.isOpen ? "1" : "0")};
    transition: opacity 0.3s;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
  }
`;

const QuestionText = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const QuestionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    font-size: 1.25rem;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) =>
    props.isOpen
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "#f3f4f6"};
  color: ${(props) => (props.isOpen ? "white" : "#6b7280")};
  transition: all 0.3s;

  svg {
    transform: rotate(${(props) => (props.isOpen ? "180deg" : "0")});
    transition: transform 0.3s;
  }
`;

const AnswerWrapper = styled.div`
  max-height: ${({ isOpen }) => (isOpen ? "800px" : "0")};
  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  overflow: hidden;
  transition: all 0.4s ease;
`;

const AnswerContent = styled.div`
  padding: ${({ isOpen }) => (isOpen ? "0 2rem 2rem 2rem" : "0 2rem")};
  color: #4b5563;
  line-height: 1.8;
  font-size: 1rem;

  @media (max-width: 768px) {
    padding: ${({ isOpen }) =>
      isOpen ? "0 1.5rem 1.5rem 1.5rem" : "0 1.5rem"};
    font-size: 0.95rem;
  }
`;

// Quick Links Section
const QuickLinksSection = styled.div`
  margin-top: 5rem;
  padding: 3rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;

  @media (max-width: 768px) {
    padding: 2rem;
    margin-top: 3rem;
  }
`;

const QuickLinksTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const QuickLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  text-decoration: none;
  color: #4b5563;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
    background: white;

    svg {
      transform: scale(1.1);
    }
  }

  svg {
    font-size: 2rem;
    color: #667eea;
    transition: transform 0.3s;
  }

  div {
    text-align: left;

    h3 {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.875rem;
      line-height: 1.4;
    }
  }
`;

// FAQ Data with icons
const FAQ_CATEGORIES = [
  { name: "All", icon: <FiHelpCircle />, count: 5 },
  { name: "Account", icon: <FiUser />, count: 2 },
  { name: "Billing", icon: <FiCreditCard />, count: 1 },
  { name: "Trips", icon: <FiEdit3 />, count: 1 },
  { name: "Support", icon: <FiMessageCircle />, count: 1 },
];

const FAQ_ITEMS = [
  {
    category: "Account",
    icon: <FiUser />,
    question: "How do I create an account?",
    answer: `To create an account, click on "Sign Up" in the navbar (or open the signup modal), fill in your name, email, and password, and submit. You can also sign up using Google, Facebook, or Instagram by clicking the corresponding social button. Your account will be created instantly and you can start booking trips right away!`,
  },
  {
    category: "Account",
    icon: <FiUser />,
    question: "How do I reset my password if I forget it?",
    answer: `If you forget your password, click on "Login" and then choose "Forgot Password?". Enter the email associated with your account. You'll receive an email with a link to reset your password within a few minutes. Follow the instructions in that email to choose a new password. The link expires after 24 hours for security reasons.`,
  },
  {
    category: "Billing",
    icon: <FiCreditCard />,
    question: "How can I update my billing information or add a new card?",
    answer: `Once you're logged in, go to the "Profile" page in the navbar. Under the "Documents" tab, scroll to "Payment Cards" and click "Add Payment Card." Follow the prompts to securely enter your card details. We accept all major credit cards and debit cards. You can also remove existing cards from the same section. Your payment information is encrypted and stored securely.`,
  },
  {
    category: "Trips",
    icon: <FiEdit3 />,
    question: "How do I modify or cancel an existing trip?",
    answer: `To modify or cancel a trip, navigate to the "Dashboard" from the navbar. You'll see a list of all your upcoming trips. Click the "Edit Trip" button to change details (dates, destination, etc.) or click "Request Change" to send an email request to our support team. For cancellations, simply update your trip status or contact support directly via the link provided. Please note our cancellation policy applies.`,
  },
  {
    category: "Support",
    icon: <FiMessageCircle />,
    question: "Who can I contact if I need further assistance?",
    answer: `If you need further help, please send an email to support@yourdomain.com, or use the "Contact Us" form available at the bottom of every page. We typically respond within 24 hours during business days. For urgent matters, you can also reach us through our live chat feature during business hours (9 AM - 6 PM EST). You can also check our Help Center for articles and guides.`,
  },
];

const QUICK_LINKS = [
  {
    icon: <FiMail />,
    title: "Contact Support",
    description: "Get help from our team",
    href: "mailto:support@yourdomain.com",
  },
  {
    icon: <FiUser />,
    title: "Account Settings",
    description: "Manage your profile",
    href: "/profile",
  },
  {
    icon: <FiEdit3 />,
    title: "My Trips",
    description: "View and manage bookings",
    href: "/dashboard",
  },
];

// Main FAQ Component
export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAccordion = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  // Filter FAQs based on category and search
  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>FAQ – AI Travel Planner</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about AI Travel Planner"
        />
      </Head>

      <PageWrapper>
        {/* Header */}
        <HeaderWrapper>
          <HeaderContent>
            <FloatingIcon>
              <FaQuestionCircle />
            </FloatingIcon>
            <HeaderTitle>How Can We Help?</HeaderTitle>
            <HeaderSubtitle>
              Find quick answers to common questions about your travel planning
            </HeaderSubtitle>
          </HeaderContent>
        </HeaderWrapper>

        <PageContainer>
          {/* Search Bar */}
          <SearchContainer>
            <SearchBar>
              <FiSearch />
              <SearchInput
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </SearchContainer>

          {/* Category Pills */}
          <CategoryContainer>
            {FAQ_CATEGORIES.map((category) => (
              <CategoryPill
                key={category.name}
                active={selectedCategory === category.name}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.icon}
                {category.name}
                <span
                  style={{
                    background:
                      selectedCategory === category.name
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(102,126,234,0.1)",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "50px",
                    fontSize: "0.875rem",
                  }}
                >
                  {category.count}
                </span>
              </CategoryPill>
            ))}
          </CategoryContainer>

          {/* Accordion */}
          <AccordionContainer>
            {filteredFAQs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6b7280",
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                }}
              >
                <FiSearch
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                />
                <p>No FAQs found matching your search.</p>
              </div>
            ) : (
              filteredFAQs.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <AccordionItem key={idx} index={idx} isOpen={isOpen}>
                    <QuestionButton
                      onClick={() => toggleAccordion(idx)}
                      isOpen={isOpen}
                    >
                      <QuestionText>
                        <QuestionIcon>{item.icon}</QuestionIcon>
                        {item.question}
                      </QuestionText>
                      <IconWrapper isOpen={isOpen}>
                        <FiChevronDown />
                      </IconWrapper>
                    </QuestionButton>
                    <AnswerWrapper isOpen={isOpen}>
                      <AnswerContent isOpen={isOpen}>
                        {item.answer}
                      </AnswerContent>
                    </AnswerWrapper>
                  </AccordionItem>
                );
              })
            )}
          </AccordionContainer>

          {/* Quick Links */}
          <QuickLinksSection>
            <QuickLinksTitle>Still Need Help?</QuickLinksTitle>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              Cant find what youre looking for? Here are some quick links to
              help you out.
            </p>
            <QuickLinksGrid>
              {QUICK_LINKS.map((link, idx) => (
                <QuickLink key={idx} href={link.href}>
                  {link.icon}
                  <div>
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </div>
                </QuickLink>
              ))}
            </QuickLinksGrid>
          </QuickLinksSection>
        </PageContainer>
      </PageWrapper>
    </>
  );
}

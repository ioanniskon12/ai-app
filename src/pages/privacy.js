// pages/privacy.js
import { useState } from "react";
import styled from "styled-components";
import Head from "next/head";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 4rem;
`;

/* ---------------- Header Section ---------------- */

const HeaderWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 300px; /* adjust as needed */
  background-image: url("/images/privacy-header.jpg"); /* ← Replace with your own image path */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  text-align: center;
  color: #ffffff;
  padding: 0 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.125rem;
  color: #e5e7eb;
`;

/* --------------- Search Bar Section --------------- */

const SearchWrapper = styled.div`
  width: 100%;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 600px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

/* --------------- Accordion Section --------------- */

const AccordionContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionButton = styled.button`
  width: 100%;
  background: #ffffff;
  border: none;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: #f9fafb;
  }
`;

const IconWrapper = styled.span`
  font-size: 1.25rem;
  transition: transform 0.2s;

  ${({ isOpen }) =>
    isOpen &&
    `
    transform: rotate(180deg);
  `}
`;

const AnswerWrapper = styled.div`
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AnswerContent = styled.div`
  padding: ${({ isOpen }) => (isOpen ? "1rem 1.5rem" : "0 1.5rem")};
  color: #4b5563;
  line-height: 1.6;
  background: #f9fafb;
`;

/* --------------- Privacy Policy Sections --------------- */

const PRIVACY_ITEMS = [
  {
    title: "1. Introduction",
    content: `Welcome to AI Booking. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect information when you register for an account, make a booking, or interact with customer support. This includes:
- Personal identifiers (name, email, phone number)
- Payment information (credit/debit card details)
- Usage data (pages visited, preferences, search history)
All data is stored securely and used only for service improvement and transaction processing.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `Your data is used for:
- Processing bookings and payments
- Sending confirmation and reminder emails
- Improving our platform (analytics and personalization)
- Communicating promotions and offers (only if you opt in)
We never share your personal data with third parties for marketing without your explicit consent.`,
  },
  {
    title: "4. Cookies & Tracking Technologies",
    content: `We use cookies and similar tracking technologies to:
- Remember your login session
- Analyze site traffic and usage patterns
- Personalize content based on your preferences
You can manage or disable cookies through your browser settings, but this may affect certain functionalities on our site.`,
  },
  {
    title: "5. Your Rights & Choices",
    content: `Under GDPR and other data protection laws, you have:
- The right to access your data
- The right to correct or delete your data
- The right to restrict or object to processing
- The right to data portability
To exercise these rights, contact us at privacy@yourdomain.com. We will respond within 30 days.`,
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard security measures including:
- Encryption (TLS/SSL) for data in transit
- Secure storage for data at rest
- Regular security audits and vulnerability assessments
While we strive to protect your data, no system is completely secure. Use strong, unique passwords and enable two-factor authentication if available.`,
  },
  {
    title: "7. Changes to This Privacy Policy",
    content: `We may update this Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. We encourage you to review the Policy periodically for any changes.`,
  },
  {
    title: "8. Sta leo wrea",
    content: `Nai`,
  },
];

/* ---------------- Main Privacy Component ---------------- */

export default function PrivacyPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle accordion open/close
  const toggleAccordion = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  // Filter sections by title OR content matching the search query (case-insensitive)
  const filteredItems = PRIVACY_ITEMS.filter((item) => {
    const lcQuery = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(lcQuery) ||
      item.content.toLowerCase().includes(lcQuery)
    );
  });

  return (
    <>
      <Head>
        <title>Privacy Policy – AI Booking</title>
      </Head>

      <PageContainer>
        {/* ===== Header ===== */}
        <HeaderWrapper>
          <HeaderContent>
            <HeaderTitle>Privacy Policy</HeaderTitle>
            <HeaderSubtitle>
              Learn how we collect, use, and protect your data
            </HeaderSubtitle>
          </HeaderContent>
        </HeaderWrapper>

        {/* ===== Search Bar ===== */}
        <SearchWrapper>
          <SearchInput
            type="text"
            placeholder="Search Privacy Policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>

        {/* ===== Accordion ===== */}
        <AccordionContainer>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              // Note: because filtering may change indices, we map original index via findIndex
              const originalIdx = PRIVACY_ITEMS.indexOf(item);
              const isOpen = openIndex === originalIdx;

              return (
                <AccordionItem key={originalIdx}>
                  <QuestionButton onClick={() => toggleAccordion(originalIdx)}>
                    {item.title}
                    <IconWrapper isOpen={isOpen}>▼</IconWrapper>
                  </QuestionButton>
                  <AnswerWrapper isOpen={isOpen}>
                    <AnswerContent isOpen={isOpen}>
                      {item.content}
                    </AnswerContent>
                  </AnswerWrapper>
                </AccordionItem>
              );
            })
          ) : (
            <AccordionItem>
              <AnswerContent
                isOpen={true}
                style={{ textAlign: "center", padding: "1.5rem" }}
              >
                No sections match your search.
              </AnswerContent>
            </AccordionItem>
          )}
        </AccordionContainer>
      </PageContainer>
    </>
  );
}

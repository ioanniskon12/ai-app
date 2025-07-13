// components/ShareTripModal.js - Trip Sharing Modal Component
import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  FiShare2,
  FiCopy,
  FiMail,
  FiMessageCircle,
  FiTwitter,
  FiFacebook,
  FiX,
  FiCheck,
  FiLink,
  FiInfo,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const ShareLinkSection = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const ShareLinkLabel = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ShareLinkInput = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #4b5563;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CopyButton = styled.button`
  padding: 0.75rem 1rem;
  background: ${(props) => (props.copied ? "#10b981" : "#667eea")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.copied ? "#10b981" : "#5a67d8")};
    transform: translateY(-1px);
  }
`;

const ShareOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ShareOption = styled.button`
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const PrivacyNote = styled.div`
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  color: #92400e;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;

const EmailShareForm = styled.form`
  display: ${(props) => (props.show ? "block" : "none")};
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SendButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5a67d8;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export default function ShareTripModal({ isOpen, onClose, tripData }) {
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipient: "",
    message: `Check out my upcoming trip to ${tripData?.Destination || "this amazing destination"}!`,
  });
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (isOpen && tripData) {
      // Generate shareable URL
      const baseUrl = window.location.origin;
      const tripId = tripData._id || tripData.id;
      setShareUrl(`${baseUrl}/shared/trip/${tripId}`);
    }
  }, [isOpen, tripData]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(
      `Check out my trip to ${tripData.Destination}!`
    );

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/share/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: tripData._id || tripData.id,
          recipient: emailForm.recipient,
          message: emailForm.message,
          shareUrl,
        }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
        setShowEmailForm(false);
        setEmailForm({ recipient: "", message: "" });
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Email error:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FiShare2 />
            Share Your Trip
          </Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ShareLinkSection>
          <ShareLinkLabel>
            Share this link with friends and family:
          </ShareLinkLabel>
          <ShareLinkInput>
            <LinkInput
              type="text"
              value={shareUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <CopyButton onClick={handleCopyLink} copied={copied}>
              {copied ? (
                <>
                  <FiCheck /> Copied!
                </>
              ) : (
                <>
                  <FiCopy /> Copy
                </>
              )}
            </CopyButton>
          </ShareLinkInput>
        </ShareLinkSection>

        <ShareOptionsGrid>
          <ShareOption onClick={() => handleShare("twitter")}>
            <FiTwitter style={{ color: "#1DA1F2" }} />
            Twitter
          </ShareOption>
          <ShareOption onClick={() => handleShare("facebook")}>
            <FiFacebook style={{ color: "#1877F2" }} />
            Facebook
          </ShareOption>
          <ShareOption onClick={() => handleShare("whatsapp")}>
            <FaWhatsapp style={{ color: "#25D366" }} />
            WhatsApp
          </ShareOption>
          <ShareOption onClick={() => setShowEmailForm(!showEmailForm)}>
            <FiMail style={{ color: "#667eea" }} />
            Email
          </ShareOption>
        </ShareOptionsGrid>

        <EmailShareForm show={showEmailForm} onSubmit={handleEmailSubmit}>
          <FormGroup>
            <Label>Recipient Email</Label>
            <Input
              type="email"
              placeholder="friend@example.com"
              value={emailForm.recipient}
              onChange={(e) =>
                setEmailForm({ ...emailForm, recipient: e.target.value })
              }
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Personal Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message..."
              value={emailForm.message}
              onChange={(e) =>
                setEmailForm({ ...emailForm, message: e.target.value })
              }
            />
          </FormGroup>
          <SendButton type="submit">Send Email Invitation</SendButton>
        </EmailShareForm>

        <PrivacyNote>
          <FiInfo />
          <div>
            <strong>Privacy Note:</strong> Only trip details like destination,
            dates, and activities will be shared. Personal information and
            payment details remain private.
          </div>
        </PrivacyNote>
      </ModalContent>
    </ModalOverlay>
  );
}

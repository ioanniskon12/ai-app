// pages/profile.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";
import Head from "next/head";
import {
  FiUser,
  FiLock,
  FiFileText,
  FiCamera,
  FiUpload,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiCreditCard,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiGlobe,
  FiEdit3,
  FiSave,
  FiX,
  FiLoader,
} from "react-icons/fi";
import {
  FaGoogle,
  FaFacebook,
  FaPassport,
  FaIdCard,
  FaCreditCard,
  FaShieldAlt,
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

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Page Wrapper
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

// Hero Section
const HeroSection = styled.div`
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
  padding: 4rem 0 6rem;
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

  @media (max-width: 768px) {
    padding: 3rem 0 4rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ProfileHeader = styled.div`
  text-align: center;
  color: white;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

// Main Content Grid
const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  margin-top: -4rem;
  position: relative;
  z-index: 10;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    margin-top: -3rem;
  }
`;

// Sidebar
const Sidebar = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  @media (max-width: 968px) {
    position: static;
  }
`;

const UserProfile = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    font-size: 3rem;
    color: white;
  }
`;

const ChangePhotoButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  border: 3px solid white;

  &:hover {
    transform: scale(1.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    svg {
      color: white;
    }
  }

  input {
    display: none;
  }

  svg {
    font-size: 1.25rem;
    color: #667eea;
    transition: all 0.3s;
  }
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const UserEmail = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SidebarItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  text-align: left;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
      : "transparent"};
  color: ${(props) => (props.active ? "#667eea" : "#6b7280")};
  border: 2px solid ${(props) => (props.active ? "#667eea" : "transparent")};
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: ${(props) => (props.active ? "1" : "0")};
    transition: opacity 0.3s;
  }

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
        : "#f9fafb"};
    color: ${(props) => (props.active ? "#667eea" : "#4b5563")};
    transform: translateX(${(props) => (props.active ? "0" : "5px")});
  }

  svg {
    font-size: 1.25rem;
  }
`;

// Content Area
const Content = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out 0.3s both;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const Section = styled.div`
  margin-bottom: 3rem;
  animation: ${slideIn} 0.6s ease-out ${(props) => props.delay || "0s"} both;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #9ca3af;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s;
  background: #f9fafb;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: ${(props) =>
    props.variant === "danger"
      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  animation: ${(props) => (props.animate ? pulse : "none")} 2s ease-in-out
    infinite;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px
      ${(props) =>
        props.variant === "danger"
          ? "rgba(239, 68, 68, 0.4)"
          : "rgba(102, 126, 234, 0.4)"};
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

const SecondaryButton = styled(Button)`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  box-shadow: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
  }
`;

// Document Upload Styles
const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const DocumentCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  position: relative;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const DocumentIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    font-size: 1.75rem;
    color: #667eea;
  }
`;

const DocumentInfo = styled.div`
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: white;
  border: 2px solid #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #fee2e2;
    border-color: #fecaca;
    transform: scale(1.1);

    svg {
      color: #dc2626;
    }
  }

  svg {
    font-size: 1.125rem;
    color: #ef4444;
    transition: all 0.3s;
  }
`;

const UploadArea = styled.label`
  border: 3px dashed #e5e7eb;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;

  &:hover {
    border-color: #667eea;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%
    );

    svg {
      transform: translateY(-5px);
    }
  }

  input {
    display: none;
  }

  svg {
    font-size: 3rem;
    color: #9ca3af;
    margin-bottom: 1rem;
    transition: all 0.3s;
  }

  p {
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  span {
    font-size: 0.875rem;
    color: #9ca3af;
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
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
    border: 1px solid #6ee7b7;
  `}

  ${(props) =>
    props.type === "error" &&
    `
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    border: 1px solid #fca5a5;
  `}

  svg {
    font-size: 1.25rem;
  }
`;

// Security Features
const SecurityGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const SecurityCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  background: white;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }
`;

const SecurityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SecurityTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }
`;

const SecurityStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;

  ${(props) =>
    props.enabled
      ? `
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
  `
      : `
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
  `}
`;

const SecurityDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

// Connected Accounts
const ConnectedAccount = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  svg {
    font-size: 2rem;
  }

  div {
    h4 {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.875rem;
      color: #6b7280;
    }
  }
`;

// Main Component
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    bio: "",
    photo: null,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [documents, setDocuments] = useState({
    passport: null,
    id: null,
    paymentCards: [],
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (session?.user) {
      setPersonalInfo((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        photo: session.user.image || null,
      }));
    }
  }, [session, status, router]);

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Clear message after 5 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current: "", new: "", confirm: "" });

      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (type, file) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockDocument = {
        id: Date.now().toString(),
        name: file.name,
        type,
        uploadedAt: new Date().toISOString(),
      };

      if (type === "paymentCard") {
        setDocuments((prev) => ({
          ...prev,
          paymentCards: [
            ...prev.paymentCards,
            { ...mockDocument, last4: "4242", brand: "Visa" },
          ],
        }));
      } else {
        setDocuments((prev) => ({
          ...prev,
          [type]: mockDocument,
        }));
      }

      setMessage({ type: "success", text: "Document uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDelete = async (type, documentId) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Simulate deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (type === "paymentCard") {
        setDocuments((prev) => ({
          ...prev,
          paymentCards: prev.paymentCards.filter(
            (card) => card.id !== documentId
          ),
        }));
      } else {
        setDocuments((prev) => ({
          ...prev,
          [type]: null,
        }));
      }

      setMessage({ type: "success", text: "Document deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (status === "loading") {
    return (
      <PageWrapper>
        <Container style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Loading...</div>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <>
      <Head>
        <title>Profile Settings – AI Travel Planner</title>
      </Head>

      <PageWrapper>
        <HeroSection>
          <Container>
            <ProfileHeader>
              <Title>Profile Settings</Title>
              <Subtitle>
                Manage your personal information and preferences
              </Subtitle>
            </ProfileHeader>
          </Container>
        </HeroSection>

        <Container>
          <ProfileGrid>
            <Sidebar>
              <UserProfile>
                <AvatarWrapper>
                  <Avatar>
                    {personalInfo.photo ? (
                      <img src={personalInfo.photo} alt="Profile" />
                    ) : (
                      <FiUser />
                    )}
                  </Avatar>
                  <ChangePhotoButton>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <FiCamera />
                  </ChangePhotoButton>
                </AvatarWrapper>
                <UserName>{personalInfo.name || "User"}</UserName>
                <UserEmail>{personalInfo.email}</UserEmail>
              </UserProfile>

              <SidebarNav>
                <SidebarItem
                  active={activeTab === "personal"}
                  onClick={() => setActiveTab("personal")}
                >
                  <FiUser />
                  Personal Information
                </SidebarItem>
                <SidebarItem
                  active={activeTab === "documents"}
                  onClick={() => setActiveTab("documents")}
                >
                  <FiFileText />
                  Documents
                </SidebarItem>
                <SidebarItem
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                >
                  <FiLock />
                  Security
                </SidebarItem>
              </SidebarNav>
            </Sidebar>

            <Content>
              {message.text && (
                <Alert type={message.type}>
                  {message.type === "success" ? <FiCheck /> : <FiAlertCircle />}
                  {message.text}
                </Alert>
              )}

              {activeTab === "personal" && (
                <Section delay="0s">
                  <SectionHeader>
                    <SectionTitle>
                      <FiUser />
                      Personal Information
                    </SectionTitle>
                  </SectionHeader>

                  <Form onSubmit={handlePersonalInfoSubmit}>
                    <FormRow>
                      <FormGroup>
                        <Label>
                          <FiUser />
                          Full Name
                        </Label>
                        <InputWrapper>
                          <Input
                            type="text"
                            value={personalInfo.name}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="John Doe"
                            required
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormGroup>
                        <Label>
                          <FiMail />
                          Email Address
                        </Label>
                        <InputWrapper>
                          <Input
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="john@example.com"
                            required
                          />
                        </InputWrapper>
                      </FormGroup>
                    </FormRow>

                    <FormRow>
                      <FormGroup>
                        <Label>
                          <FiPhone />
                          Phone Number
                        </Label>
                        <InputWrapper>
                          <Input
                            type="tel"
                            value={personalInfo.phone}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="+1 (555) 123-4567"
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormGroup>
                        <Label>
                          <FiCalendar />
                          Date of Birth
                        </Label>
                        <InputWrapper>
                          <Input
                            type="date"
                            value={personalInfo.dateOfBirth}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                dateOfBirth: e.target.value,
                              }))
                            }
                          />
                        </InputWrapper>
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label>
                        <FiMapPin />
                        Address
                      </Label>
                      <InputWrapper>
                        <Input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="123 Main Street"
                        />
                      </InputWrapper>
                    </FormGroup>

                    <FormRow>
                      <FormGroup>
                        <Label>
                          <FiMapPin />
                          City
                        </Label>
                        <InputWrapper>
                          <Input
                            type="text"
                            value={personalInfo.city}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            placeholder="San Francisco"
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormGroup>
                        <Label>
                          <FiGlobe />
                          Country
                        </Label>
                        <InputWrapper>
                          <Input
                            type="text"
                            value={personalInfo.country}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            placeholder="United States"
                          />
                        </InputWrapper>
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label>
                        <FiEdit3 />
                        Bio
                      </Label>
                      <TextArea
                        value={personalInfo.bio}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        placeholder="Tell us about yourself..."
                      />
                    </FormGroup>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Button type="submit" disabled={loading} animate>
                        {loading ? (
                          <>
                            <FiLoader
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Section>
              )}

              {activeTab === "documents" && (
                <>
                  <Section delay="0s">
                    <SectionHeader>
                      <SectionTitle>
                        <FaPassport />
                        Travel Documents
                      </SectionTitle>
                    </SectionHeader>

                    <DocumentGrid>
                      {/* Passport */}
                      {documents.passport ? (
                        <DocumentCard>
                          <DeleteButton
                            onClick={() =>
                              handleDocumentDelete(
                                "passport",
                                documents.passport.id
                              )
                            }
                          >
                            <FiTrash2 />
                          </DeleteButton>
                          <DocumentIcon>
                            <FaPassport />
                          </DocumentIcon>
                          <DocumentInfo>
                            <h4>Passport</h4>
                            <p>Uploaded • Valid</p>
                          </DocumentInfo>
                        </DocumentCard>
                      ) : (
                        <UploadArea>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleDocumentUpload("passport", file);
                            }}
                          />
                          <FiUpload />
                          <p>Upload Passport</p>
                          <span>PDF or Image (max 5MB)</span>
                        </UploadArea>
                      )}

                      {/* ID Card */}
                      {documents.id ? (
                        <DocumentCard>
                          <DeleteButton
                            onClick={() =>
                              handleDocumentDelete("id", documents.id.id)
                            }
                          >
                            <FiTrash2 />
                          </DeleteButton>
                          <DocumentIcon>
                            <FaIdCard />
                          </DocumentIcon>
                          <DocumentInfo>
                            <h4>ID Card</h4>
                            <p>Uploaded • Valid</p>
                          </DocumentInfo>
                        </DocumentCard>
                      ) : (
                        <UploadArea>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleDocumentUpload("id", file);
                            }}
                          />
                          <FiUpload />
                          <p>Upload ID Card</p>
                          <span>PDF or Image (max 5MB)</span>
                        </UploadArea>
                      )}
                    </DocumentGrid>
                  </Section>

                  <Section delay="0.1s">
                    <SectionHeader>
                      <SectionTitle>
                        <FaCreditCard />
                        Payment Methods
                      </SectionTitle>
                    </SectionHeader>

                    <DocumentGrid>
                      {documents.paymentCards.map((card) => (
                        <DocumentCard key={card.id}>
                          <DeleteButton
                            onClick={() =>
                              handleDocumentDelete("paymentCard", card.id)
                            }
                          >
                            <FiTrash2 />
                          </DeleteButton>
                          <DocumentIcon>
                            <FaCreditCard />
                          </DocumentIcon>
                          <DocumentInfo>
                            <h4>•••• {card.last4}</h4>
                            <p>{card.brand} • Expires 12/25</p>
                          </DocumentInfo>
                        </DocumentCard>
                      ))}

                      <UploadArea>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleDocumentUpload("paymentCard", file);
                          }}
                        />
                        <FiCreditCard />
                        <p>Add Payment Card</p>
                        <span>Secure upload</span>
                      </UploadArea>
                    </DocumentGrid>
                  </Section>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <Section delay="0s">
                    <SectionHeader>
                      <SectionTitle>
                        <FiLock />
                        Change Password
                      </SectionTitle>
                    </SectionHeader>

                    <Form onSubmit={handlePasswordChange}>
                      <FormGroup>
                        <Label>
                          <FiLock />
                          Current Password
                        </Label>
                        <InputWrapper>
                          <Input
                            type="password"
                            value={passwords.current}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                current: e.target.value,
                              }))
                            }
                            placeholder="Enter current password"
                            required
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormRow>
                        <FormGroup>
                          <Label>
                            <FiLock />
                            New Password
                          </Label>
                          <InputWrapper>
                            <Input
                              type="password"
                              value={passwords.new}
                              onChange={(e) =>
                                setPasswords((prev) => ({
                                  ...prev,
                                  new: e.target.value,
                                }))
                              }
                              placeholder="Enter new password"
                              required
                            />
                          </InputWrapper>
                        </FormGroup>

                        <FormGroup>
                          <Label>
                            <FiLock />
                            Confirm New Password
                          </Label>
                          <InputWrapper>
                            <Input
                              type="password"
                              value={passwords.confirm}
                              onChange={(e) =>
                                setPasswords((prev) => ({
                                  ...prev,
                                  confirm: e.target.value,
                                }))
                              }
                              placeholder="Confirm new password"
                              required
                            />
                          </InputWrapper>
                        </FormGroup>
                      </FormRow>

                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </Form>
                  </Section>

                  <Section delay="0.1s">
                    <SecurityGrid>
                      <SecurityCard>
                        <SecurityHeader>
                          <SecurityTitle>
                            <FaShieldAlt />
                            Two-Factor Authentication
                          </SecurityTitle>
                          <SecurityStatus enabled={twoFactorEnabled}>
                            {twoFactorEnabled ? "Enabled" : "Disabled"}
                          </SecurityStatus>
                        </SecurityHeader>
                        <SecurityDescription>
                          Add an extra layer of security to your account by
                          requiring a code from your authenticator app
                        </SecurityDescription>
                        <SecondaryButton
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        >
                          {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </SecondaryButton>
                      </SecurityCard>
                    </SecurityGrid>
                  </Section>

                  <Section delay="0.2s">
                    <SectionHeader>
                      <SectionTitle>
                        <FiGlobe />
                        Connected Accounts
                      </SectionTitle>
                    </SectionHeader>

                    <div>
                      <ConnectedAccount>
                        <AccountInfo>
                          <FaGoogle style={{ color: "#4285F4" }} />
                          <div>
                            <h4>Google</h4>
                            <p>Connected • {personalInfo.email}</p>
                          </div>
                        </AccountInfo>
                        <SecondaryButton style={{ padding: "0.5rem 1rem" }}>
                          Disconnect
                        </SecondaryButton>
                      </ConnectedAccount>

                      <ConnectedAccount>
                        <AccountInfo>
                          <FaFacebook style={{ color: "#1877F2" }} />
                          <div>
                            <h4>Facebook</h4>
                            <p>Not connected</p>
                          </div>
                        </AccountInfo>
                        <SecondaryButton style={{ padding: "0.5rem 1rem" }}>
                          Connect
                        </SecondaryButton>
                      </ConnectedAccount>
                    </div>
                  </Section>

                  <Section delay="0.3s">
                    <SectionHeader>
                      <SectionTitle style={{ color: "#dc2626" }}>
                        <FiAlertCircle />
                        Danger Zone
                      </SectionTitle>
                    </SectionHeader>

                    <SecurityCard style={{ borderColor: "#fee2e2" }}>
                      <SecurityDescription>
                        Once you delete your account, there is no going back.
                        All your data will be permanently removed.
                      </SecurityDescription>
                      <Button variant="danger">
                        <FiTrash2 />
                        Delete Account
                      </Button>
                    </SecurityCard>
                  </Section>
                </>
              )}
            </Content>
          </ProfileGrid>
        </Container>
      </PageWrapper>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

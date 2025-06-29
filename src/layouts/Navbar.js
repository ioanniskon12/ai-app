import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import AuthModal from "../pages/components/modals/AuthModal";
import {
  FiUser,
  FiLogOut,
  FiSettings,
  FiHeart,
  FiGrid,
  FiChevronDown,
} from "react-icons/fi";
import { FaPlane } from "react-icons/fa";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// Styled Components
const Nav = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
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

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 800;
  color: transparent;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    color: #667eea;
    font-size: 2rem;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #4b5563;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  transition: all 0.3s ease;
  padding: 0.5rem 0;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  &:hover {
    color: #667eea;

    &::after {
      width: 100%;
    }
  }

  &.active {
    color: #667eea;

    &::after {
      width: 100%;
    }
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DesktopAuth = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #1f2937;
  border: 2px solid transparent;
  background-clip: padding-box;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);

    svg {
      color: white;
    }
  }

  svg {
    transition: all 0.3s ease;
    color: #6b7280;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  opacity: ${(props) => (props.show ? "1" : "0")};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transform: ${(props) => (props.show ? "translateY(0)" : "translateY(-10px)")};
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: ${(props) => (props.show ? slideDown : "none")} 0.3s ease-out;
`;

const DropdownHeader = styled.div`
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
`;

const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;

  svg {
    color: #9ca3af;
    transition: all 0.2s ease;
  }

  &:hover {
    background: #f9fafb;
    color: #667eea;
    padding-left: 1.5rem;

    svg {
      color: #667eea;
    }
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  color: #dc2626;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 1rem;

  svg {
    color: #dc2626;
  }

  &:hover {
    background: #fee2e2;
    padding-left: 1.5rem;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    svg {
      color: white;
    }
  }

  svg {
    color: #4b5563;
    transition: all 0.3s ease;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.show ? "block" : "none")};
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    padding: 1.5rem;
    overflow-y: auto;
    z-index: 999;
    animation: ${slideDown} 0.3s ease-out;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: #4b5563;
  text-decoration: none;
  font-weight: 600;
  border-radius: 16px;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  background: #f9fafb;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateX(5px);
  }
`;

const MobileUserSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MobileEmail = styled.div`
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 600;
`;

const MobileLogoutBtn = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
  }
`;

const AdminBadge = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 600;
  margin-left: auto;
`;

// Component
export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const isActive = (path) => (router.pathname === path ? "active" : "");

  const handleMouseEnter = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setShowUserDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setShowUserDropdown(false), 300);
    setDropdownTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
    };
  }, [dropdownTimeout]);

  useEffect(() => {
    const handleScroll = () => {
      if (showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showMobileMenu]);

  return (
    <>
      <Nav>
        <NavContainer>
          <Logo href="/">
            <FaPlane />
            AI Travel
          </Logo>

          <NavLinks>
            <NavLink href="/deals" className={isActive("/deals")}>
              Hot Deals
            </NavLink>
            <NavLink href="/blog" className={isActive("/blog")}>
              Travel Blog
            </NavLink>
            <NavLink href="/faq" className={isActive("/faq")}>
              FAQ
            </NavLink>
            <NavLink href="/privacy" className={isActive("/privacy")}>
              Privacy
            </NavLink>
          </NavLinks>

          <AuthSection>
            <DesktopAuth>
              {status === "loading" ? (
                <div style={{ color: "#9ca3af" }}>Loading…</div>
              ) : session ? (
                <UserMenu
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <UserButton>
                    <UserAvatar>
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name} />
                      ) : (
                        session.user.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </UserAvatar>
                    {session.user.name || "My Account"}
                    <FiChevronDown size={16} />
                  </UserButton>
                  <UserDropdown
                    show={showUserDropdown}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <DropdownHeader>
                      <UserEmail>{session.user.email}</UserEmail>
                    </DropdownHeader>

                    <DropdownLink href="/dashboard">
                      <FiGrid size={18} />
                      Dashboard
                    </DropdownLink>
                    <DropdownLink href="/profile">
                      <FiSettings size={18} />
                      Profile Settings
                    </DropdownLink>
                    <DropdownLink href="/wishlist">
                      <FiHeart size={18} />
                      My Wishlist
                    </DropdownLink>

                    {session.user.role === "admin" && (
                      <>
                        <DropdownDivider />
                        <DropdownLink href="/admin">
                          <FiSettings size={18} />
                          Admin Dashboard
                          <AdminBadge>Admin</AdminBadge>
                        </DropdownLink>
                      </>
                    )}

                    <DropdownDivider />
                    <DropdownButton onClick={handleSignOut}>
                      <FiLogOut size={18} />
                      Sign Out
                    </DropdownButton>
                  </UserDropdown>
                </UserMenu>
              ) : (
                <LoginButton onClick={() => setShowAuthModal(true)}>
                  Login / Sign Up
                </LoginButton>
              )}
            </DesktopAuth>

            <MobileMenuButton
              onClick={() => setShowMobileMenu((prev) => !prev)}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </MobileMenuButton>
          </AuthSection>
        </NavContainer>

        <MobileMenu show={showMobileMenu}>
          {session && (
            <MobileUserSection>
              <MobileUserInfo>
                <UserAvatar>
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} />
                  ) : (
                    session.user.name?.charAt(0).toUpperCase() || "U"
                  )}
                </UserAvatar>
                <div>
                  <MobileEmail>
                    {session.user.name || session.user.email}
                  </MobileEmail>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    {session.user.email}
                  </div>
                </div>
              </MobileUserInfo>
              <MobileLogoutBtn onClick={handleSignOut}>
                <FiLogOut size={18} />
                Sign Out
              </MobileLogoutBtn>
            </MobileUserSection>
          )}

          <MobileNavLink href="/deals">🔥 Hot Deals</MobileNavLink>
          <MobileNavLink href="/blog">📝 Travel Blog</MobileNavLink>
          <MobileNavLink href="/faq">❓ FAQ</MobileNavLink>
          <MobileNavLink href="/privacy">🔒 Privacy</MobileNavLink>

          {!session && (
            <LoginButton
              onClick={() => {
                setShowAuthModal(true);
                setShowMobileMenu(false);
              }}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Login / Sign Up
            </LoginButton>
          )}

          {session && (
            <>
              <DropdownDivider style={{ margin: "1rem 0" }} />
              <MobileNavLink href="/dashboard">
                <FiGrid size={18} style={{ marginRight: "0.5rem" }} />
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/profile">
                <FiSettings size={18} style={{ marginRight: "0.5rem" }} />
                Profile Settings
              </MobileNavLink>
              <MobileNavLink href="/wishlist">
                <FiHeart size={18} style={{ marginRight: "0.5rem" }} />
                My Wishlist
              </MobileNavLink>
              {session.user.role === "admin" && (
                <MobileNavLink href="/admin">
                  <FiSettings size={18} style={{ marginRight: "0.5rem" }} />
                  Admin Dashboard
                  <AdminBadge>Admin</AdminBadge>
                </MobileNavLink>
              )}
            </>
          )}
        </MobileMenu>
      </Nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

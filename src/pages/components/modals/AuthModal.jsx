// components/modals/AuthModal.js - This replaces all auth modal files
import { useState } from "react";
import { signIn } from "next-auth/react";
import styled from "styled-components";

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
  z-index: 2000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const ModalHeader = styled.div`
  padding: 2rem 2rem 1rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const ModalBody = styled.div`
  padding: 0 2rem 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${(props) => (props.active ? "#3b82f6" : "#f3f4f6")};
  color: ${(props) => (props.active ? "white" : "#6b7280")};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#2563eb" : "#e5e7eb")};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: #3b82f6;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  span {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #d1fae5;
  color: #059669;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const ForgotPasswordLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
  align-self: flex-start;

  &:hover {
    color: #2563eb;
  }
`;

const StandaloneLink = styled.a`
  color: #3b82f6;
  text-decoration: underline;
  font-size: 0.875rem;
  text-align: center;
  display: block;
  margin-top: 1rem;

  &:hover {
    color: #2563eb;
  }
`;

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login"); // login, signup, forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        // Create account
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        let data;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || "Signup failed");
        }

        if (!res.ok) {
          throw new Error(data.error || "Signup failed");
        }

        setSuccess("Account created! Logging you in...");

        // Auto login after signup
        setTimeout(async () => {
          await handleCredentialsLogin();
        }, 1000);
      } else if (mode === "login") {
        await handleCredentialsLogin();
      } else if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          throw new Error("Failed to send reset email");
        }

        setSuccess("Password reset link sent to your email!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Invalid email or password");
    }

    onClose();
    window.location.reload();
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (err) {
      setError("OAuth login failed. Please try again.");
    }
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <CloseButton onClick={onClose}>
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </CloseButton>

        <ModalHeader>
          <Title>
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
          </Title>
          <Subtitle>
            {mode === "login" && "Log in to access your trips"}
            {mode === "signup" && "Start planning your dream vacation"}
            {mode === "forgot" && "We'll send you a reset link"}
          </Subtitle>
        </ModalHeader>

        <ModalBody>
          {mode !== "forgot" && (
            <TabContainer>
              <Tab active={mode === "login"} onClick={() => setMode("login")}>
                Log In
              </Tab>
              <Tab active={mode === "signup"} onClick={() => setMode("signup")}>
                Sign Up
              </Tab>
            </TabContainer>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <Form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <InputGroup>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </InputGroup>
            )}

            <InputGroup>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </InputGroup>

            {mode !== "forgot" && (
              <InputGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </InputGroup>
            )}

            {mode === "signup" && (
              <InputGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </InputGroup>
            )}

            {mode === "login" && (
              <ForgotPasswordLink
                type="button"
                onClick={() => setMode("forgot")}
              >
                Forgot your password?
              </ForgotPasswordLink>
            )}

            <SubmitButton type="submit" disabled={loading}>
              {loading
                ? "Loading..."
                : mode === "login"
                  ? "Log In"
                  : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
            </SubmitButton>
          </Form>

          {mode === "forgot" && (
            <ForgotPasswordLink type="button" onClick={() => setMode("login")}>
              Back to login
            </ForgotPasswordLink>
          )}

          {mode !== "forgot" && (
            <>
              <Divider>
                <span>Or continue with</span>
              </Divider>

              <SocialButtons>
                <SocialButton
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </SocialButton>

                <SocialButton
                  type="button"
                  onClick={() => handleOAuthLogin("facebook")}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </SocialButton>
              </SocialButtons>

              <StandaloneLink
                href={mode === "login" ? "/auth/login" : "/auth/signup"}
              >
                Open as standalone page →
              </StandaloneLink>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}

// You can delete these files:
// - LoginForm.jsx
// - SignupForm.jsx
// - Modal.jsx (if it's just a generic modal wrapper)

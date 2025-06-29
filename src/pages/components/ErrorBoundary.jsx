// components/ErrorBoundary.jsx - Enhanced error boundary with better UX
import React from "react";
import styled, { keyframes } from "styled-components";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiHome,
  FiMessageCircle,
  FiCopy,
} from "react-icons/fi";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
  border-radius: 20px;
  margin: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(239, 68, 68, 0.1) 0%,
      transparent 70%
    );
    animation: ${pulse} 3s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
    min-height: 50vh;
  }
`;

const IconContainer = styled.div`
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1.5rem;
  animation: ${shake} 0.8s ease-in-out;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const ErrorTitle = styled.h2`
  color: #dc2626;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
`;

const ErrorMessage = styled.p`
  color: #991b1b;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  &.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
    }
  }

  &.secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;

    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ErrorDetails = styled.details`
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  text-align: left;
  max-width: 800px;
  width: 100%;
  position: relative;
  z-index: 1;

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  pre {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #fecaca;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ErrorInfo = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #f3f4f6;
  position: relative;
  z-index: 1;

  h4 {
    color: #374151;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 0.5rem 0;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: "•";
      color: #ef4444;
      font-weight: bold;
    }
  }
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }

  &:active {
    background: #d1d5db;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      // Example: LogRocket.captureException(error);
    }

    // Send error report to your API
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportError) {
      console.error("Failed to report error:", reportError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard
      .writeText(errorDetails)
      .then(() => {
        alert("Error details copied to clipboard");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = errorDetails;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Error details copied to clipboard");
      });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <ErrorContainer>
          <IconContainer>
            <FiAlertTriangle />
          </IconContainer>

          <ErrorTitle>Oops! Something went wrong</ErrorTitle>

          <ErrorMessage>
            We're sorry, but something unexpected happened. Our team has been
            notified and is working to fix this issue. Please try refreshing the
            page or come back later.
          </ErrorMessage>

          <ButtonGroup>
            <ActionButton className="primary" onClick={this.handleRetry}>
              <FiRefreshCw />
              Try Again
            </ActionButton>

            <ActionButton className="secondary" onClick={this.handleReload}>
              <FiRefreshCw />
              Refresh Page
            </ActionButton>

            <ActionButton className="secondary" onClick={this.handleGoHome}>
              <FiHome />
              Go Home
            </ActionButton>
          </ButtonGroup>

          <ErrorInfo>
            <h4>What can you do?</h4>
            <ul>
              <li>Try refreshing the page</li>
              <li>Check your internet connection</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try again in a few minutes</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </ErrorInfo>

          {isDevelopment && this.state.error && (
            <ErrorDetails>
              <summary>
                Error Details (Development Mode)
                <CopyButton
                  onClick={this.copyErrorDetails}
                  style={{ marginLeft: "1rem" }}
                >
                  <FiCopy />
                  Copy Details
                </CopyButton>
              </summary>

              <div>
                <strong>Error ID:</strong> {this.state.errorId}
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <strong>Error Message:</strong>
              </div>
              <pre>{this.state.error.message}</pre>

              <div style={{ marginTop: "0.5rem" }}>
                <strong>Stack Trace:</strong>
              </div>
              <pre>{this.state.error.stack}</pre>

              {this.state.errorInfo?.componentStack && (
                <>
                  <div style={{ marginTop: "0.5rem" }}>
                    <strong>Component Stack:</strong>
                  </div>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

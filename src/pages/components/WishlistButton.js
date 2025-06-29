// components/WishlistButton.js
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";

// Animation for heart
const heartPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Toast Animation
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const Button = styled.button`
  background: ${(props) =>
    props.isInWishlist
      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      : "rgba(255, 255, 255, 0.95)"};
  color: ${(props) => (props.isInWishlist ? "white" : "#ef4444")};
  border: 2px solid
    ${(props) => (props.isInWishlist ? "transparent" : "#ef4444")};
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${(props) =>
      props.isInWishlist
        ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
        : "rgba(254, 226, 226, 0.95)"};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: ${(props) => !props.disabled && "translateY(0)"};
  }
`;

const HeartIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: ${(props) => (props.filled ? "currentColor" : "none")};
  stroke: currentColor;
  stroke-width: 2;
  transition: all 0.3s ease;
  animation: ${(props) => (props.animate ? heartPulse : "none")} 0.6s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid
    ${(props) =>
      props.isInWishlist ? "rgba(255,255,255,0.3)" : "rgba(239,68,68,0.3)"};
  border-top: 2px solid ${(props) => (props.isInWishlist ? "white" : "#ef4444")};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Toast Component (inline to avoid import issues)
const ToastContainer = styled.div`
  position: fixed;
  top: 100px;
  left: 20px;
  background: ${(props) =>
    props.type === "success"
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 9999;
  animation: ${(props) => (props.isClosing ? slideOut : slideIn)} 0.3s ease-out;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

const ToastIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToastMessage = styled.div`
  flex: 1;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Toast component
function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <ToastContainer type={type} isClosing={isClosing}>
      <ToastIcon>
        {type === "success" ? (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </ToastIcon>
      <ToastMessage>{message}</ToastMessage>
      <CloseButton onClick={handleClose}>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </CloseButton>
    </ToastContainer>
  );
}

export default function WishlistButton({
  trip,
  onUpdate,
  variant = "default",
}) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [animate, setAnimate] = useState(false);

  // Whenever user logs in or trip changes, re-check
  useEffect(() => {
    if (session && trip) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
      setWishlistItemId(null);
    }
  }, [session, trip]);

  async function checkWishlistStatus() {
    if (!trip) return;

    try {
      const res = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error(`GET /api/wishlist failed with status ${res.status}`);
        return;
      }

      const data = await res.json();
      const items = data.items || [];

      const wishlistItem = items.find((item) => {
        // More robust comparison - handle different property names
        const itemDestination =
          item.tripData?.destination || item.tripData?.Destination;
        const itemStartDate =
          item.tripData?.startDate || item.tripData?.StartDate;
        const tripDestination = trip.destination || trip.Destination;
        const tripStartDate = trip.startDate || trip.StartDate;

        return (
          itemDestination === tripDestination && itemStartDate === tripStartDate
        );
      });

      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistItemId(wishlistItem._id);
      } else {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } catch (err) {
      console.error("Error in checkWishlistStatus:", err);
    }
  }

  async function handleWishlistToggle() {
    if (!session) {
      setToast({ message: "Please login to use wishlist", type: "error" });
      return;
    }

    if (!trip) {
      setToast({ message: "Trip data is missing", type: "error" });
      return;
    }

    setLoading(true);
    setAnimate(true);

    try {
      if (isInWishlist && wishlistItemId) {
        // ===== REMOVE FROM WISHLIST =====
        const deleteRes = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!deleteRes.ok) {
          const errorText = await deleteRes.text();
          console.error(
            `DELETE /api/wishlist/${wishlistItemId} returned ${deleteRes.status}:`,
            errorText
          );
          throw new Error("Failed to remove from wishlist");
        }

        setIsInWishlist(false);
        setWishlistItemId(null);
        setToast({ message: "Removed from wishlist", type: "success" });
      } else {
        // ===== ADD TO WISHLIST =====
        const postRes = await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripData: trip }),
        });

        if (!postRes.ok) {
          const errorText = await postRes.text();
          console.error(
            `POST /api/wishlist failed with status ${postRes.status}:`,
            errorText
          );
          throw new Error("Failed to add to wishlist");
        }

        const responseData = await postRes.json();
        setIsInWishlist(true);
        if (responseData.item && responseData.item._id) {
          setWishlistItemId(responseData.item._id);
        }
        setToast({ message: "Added to wishlist! ❤️", type: "success" });
      }

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      setToast({
        message: err.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimate(false), 600);
    }
  }

  return (
    <>
      <Button
        onClick={handleWishlistToggle}
        isInWishlist={isInWishlist}
        disabled={loading}
        variant={variant}
      >
        {loading ? (
          <LoadingSpinner isInWishlist={isInWishlist} />
        ) : (
          <HeartIcon
            filled={isInWishlist}
            viewBox="0 0 24 24"
            animate={animate}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </HeartIcon>
        )}
        {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
      </Button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

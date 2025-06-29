// components/admin/TripEditModal.js
import { useState } from "react";
import styled from "styled-components";

const Modal = styled.div`
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;

  &:hover {
    background: #f3f4f6;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "primary"
      ? `
    background: #3b82f6;
    color: white;
    border: none;
    
    &:hover {
      background: #2563eb;
    }
  `
      : `
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f3f4f6;
    }
  `}
`;

export default function TripEditModal({ trip, onClose, onSave }) {
  const [formData, setFormData] = useState({
    destination: trip.destination || "",
    startDate: trip.startDate?.split("T")[0] || "",
    endDate: trip.endDate?.split("T")[0] || "",
    hotel: trip.hotel || "",
    price: trip.price || "",
    flightOutbound: trip.flight?.outbound || "",
    flightReturn: trip.flight?.return || "",
    activities: trip.activities?.join(", ") || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedTrip = {
      ...trip,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      hotel: formData.hotel,
      price: formData.price,
      flight: {
        outbound: formData.flightOutbound,
        return: formData.flightReturn,
      },
      activities: formData.activities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    onSave(updatedTrip);
  };

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Trip</ModalTitle>
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
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label>Destination</Label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Hotel</Label>
              <Input
                name="hotel"
                value={formData.hotel}
                onChange={handleChange}
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Outbound Flight</Label>
                <Input
                  name="flightOutbound"
                  value={formData.flightOutbound}
                  onChange={handleChange}
                  placeholder="LHR → CDG, 9:00 AM - 11:30 AM"
                />
              </FormGroup>
              <FormGroup>
                <Label>Return Flight</Label>
                <Input
                  name="flightReturn"
                  value={formData.flightReturn}
                  onChange={handleChange}
                  placeholder="CDG → LHR, 6:00 PM - 8:30 PM"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Activities (comma-separated)</Label>
              <TextArea
                name="activities"
                value={formData.activities}
                onChange={handleChange}
                placeholder="Eiffel Tower Tour, Louvre Museum, Seine River Cruise"
              />
            </FormGroup>

            <FormGroup>
              <Label>Total Price</Label>
              <Input
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="$2500"
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}

// utils/generateItineraryPDF.js
import jsPDF from "jspdf";

export const generateItineraryPDF = (trip) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(102, 126, 234);
  doc.text("Trip Itinerary", 20, 20);

  // Booking reference if available
  if (trip._id) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Booking Reference: ${trip._id}`, 20, 30);
  }

  // Destination
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.text(trip.Destination || trip.destination, 20, 45);

  // Trip details
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  let y = 60;

  // Format dates
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const startDate = trip.StartDate || trip.startDate;
  const endDate = trip.EndDate || trip.endDate;
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  doc.text(`Dates: ${start} - ${end}`, 20, y);
  y += 8;
  doc.text(`Duration: ${trip.Duration || trip.duration}`, 20, y);
  y += 12;

  // Passengers if available
  if (trip.passengers) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Travelers:", 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    if (trip.passengers.adults) {
      doc.text(`Adults: ${trip.passengers.adults}`, 25, y);
      y += 8;
    }
    if (trip.passengers.children) {
      doc.text(`Children: ${trip.passengers.children}`, 25, y);
      y += 8;
    }
    if (trip.passengers.infants) {
      doc.text(`Infants: ${trip.passengers.infants}`, 25, y);
      y += 8;
    }
    y += 4;
  }

  // Reason for visiting
  if (trip.Reason || trip.reason) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Why Visit:", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const reason = trip.Reason || trip.reason;
    const reasonLines = doc.splitTextToSize(reason, 170);
    doc.text(reasonLines, 20, y);
    y += reasonLines.length * 6 + 10;
  }

  // Check if we need a new page
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Flight Information
  const flight = trip.Flight || trip.flight;
  if (flight) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Flight Information:", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    if (flight.Outbound || flight.outbound) {
      doc.text(`Outbound: ${flight.Outbound || flight.outbound}`, 25, y);
      y += 6;
    }
    if (flight.Return || flight.return) {
      doc.text(`Return: ${flight.Return || flight.return}`, 25, y);
      y += 6;
    }
    y += 6;
  }

  // Check if we need a new page
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Accommodation
  const hotel = trip.Hotel || trip.hotel;
  if (hotel) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Accommodation:", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text(hotel, 25, y);
    y += 12;
  }

  // Check if we need a new page
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // Activities
  const activities = trip.selectedActivities || trip.activities;
  if (activities?.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("Selected Activities:", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);

    activities.forEach((act) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const activityName = act.name || act;
      const activityPrice = act.price ? ` - $${act.price}` : "";
      doc.text(`• ${activityName}${activityPrice}`, 25, y);
      y += 6;
    });
    y += 10;
  }

  // Check if we need a new page for price
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Total Price
  const price = trip.Price || trip.price;
  if (price) {
    doc.setFontSize(16);
    doc.setTextColor(102, 126, 234);
    doc.text(`Total Price: ${price}`, 20, y);
    y += 15;
  }

  // Travel Tips Section
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Travel Tips:", 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  const tips = [
    "• Check passport validity (6+ months from travel date)",
    "• Consider travel insurance",
    "• Download offline maps",
    "• Keep digital copies of documents",
  ];

  // Add child-specific tips if traveling with children
  const hasChildren =
    trip.passengers &&
    (trip.passengers.children > 0 || trip.passengers.infants > 0);

  if (hasChildren) {
    tips.push("• Pack extra supplies for children");
    tips.push("• Check airline policies for minors");
    tips.push("• Book child-friendly restaurants");
  }

  tips.forEach((tip) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(tip, 20, y);
    y += 6;
  });

  // Footer
  y += 10;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text("Generated by AI Travel Planner", 20, y);
  doc.text(new Date().toLocaleDateString(), 20, y + 5);

  // Save the PDF
  const destination = (trip.Destination || trip.destination || "Trip")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();
  doc.save(`${destination}-itinerary.pdf`);
};

// Export individual sections for custom PDF generation
export const addHeaderToPDF = (doc, trip, startY = 20) => {
  doc.setFontSize(24);
  doc.setTextColor(102, 126, 234);
  doc.text("Trip Itinerary", 20, startY);

  if (trip._id) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Booking Reference: ${trip._id}`, 20, startY + 10);
  }

  return startY + (trip._id ? 25 : 15);
};

export const addDestinationToPDF = (doc, trip, startY) => {
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.text(trip.Destination || trip.destination, 20, startY);
  return startY + 15;
};

export const addDatesToPDF = (doc, trip, startY) => {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const startDate = trip.StartDate || trip.startDate;
  const endDate = trip.EndDate || trip.endDate;
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text(`Dates: ${start} - ${end}`, 20, startY);
  doc.text(`Duration: ${trip.Duration || trip.duration}`, 20, startY + 8);

  return startY + 20;
};

export const addPassengersToPDF = (doc, trip, startY) => {
  if (!trip.passengers) return startY;

  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Travelers:", 20, startY);

  let y = startY + 8;
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);

  if (trip.passengers.adults) {
    doc.text(`Adults: ${trip.passengers.adults}`, 25, y);
    y += 8;
  }
  if (trip.passengers.children) {
    doc.text(`Children: ${trip.passengers.children}`, 25, y);
    y += 8;
  }
  if (trip.passengers.infants) {
    doc.text(`Infants: ${trip.passengers.infants}`, 25, y);
    y += 8;
  }

  return y + 4;
};

// Check if new page is needed
export const checkNewPage = (doc, currentY, threshold = 240) => {
  if (currentY > threshold) {
    doc.addPage();
    return 20;
  }
  return currentY;
};

// utils/generateItineraryPDF.js - Complete PDF Generation Implementation
import jsPDF from "jspdf";

export function generateItineraryPDF(tripData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margins = { top: 20, bottom: 20, left: 20, right: 20 };
  const contentWidth = pageWidth - margins.left - margins.right;

  let yPosition = margins.top;

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - margins.bottom) {
      doc.addPage();
      yPosition = margins.top;
      return true;
    }
    return false;
  };

  const drawDivider = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 10;
  };

  // Header with gradient effect
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text("AI Travel Planner", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text("Your Personalized Trip Itinerary", pageWidth / 2, 28, {
    align: "center",
  });

  yPosition = 55;

  // Trip Overview Section
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Trip Overview", margins.left, yPosition);
  yPosition += 15;

  // Destination Header
  doc.setFillColor(245, 247, 250);
  doc.rect(margins.left, yPosition - 5, contentWidth, 25, "F");

  doc.setFontSize(16);
  doc.setTextColor(102, 126, 234);
  doc.text(
    tripData.Destination || tripData.destination,
    pageWidth / 2,
    yPosition + 8,
    { align: "center" }
  );
  yPosition += 30;

  // Trip Details Grid
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);

  const details = [
    { label: "Duration:", value: tripData.Duration || tripData.duration },
    {
      label: "Dates:",
      value: `${formatDate(tripData.StartDate || tripData.startDate)} - ${formatDate(tripData.EndDate || tripData.endDate)}`,
    },
    { label: "Month:", value: tripData.Month || tripData.month },
    { label: "Total Price:", value: `$${tripData.Price || tripData.price}` },
  ];

  const detailsPerRow = 2;
  const columnWidth = contentWidth / detailsPerRow;

  details.forEach((detail, index) => {
    const col = index % detailsPerRow;
    const row = Math.floor(index / detailsPerRow);
    const xPos = margins.left + col * columnWidth;
    const yPos = yPosition + row * 15;

    doc.setFont(undefined, "bold");
    doc.text(detail.label, xPos, yPos);
    doc.setFont(undefined, "normal");
    doc.text(detail.value, xPos + 30, yPos);
  });

  yPosition += Math.ceil(details.length / detailsPerRow) * 15 + 10;
  drawDivider();

  // Passengers Section (if available)
  if (tripData.passengers) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Travelers", margins.left, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(107, 114, 128);

    const passengerInfo = [];
    if (tripData.passengers.adults)
      passengerInfo.push(
        `${tripData.passengers.adults} Adult${tripData.passengers.adults > 1 ? "s" : ""}`
      );
    if (tripData.passengers.children)
      passengerInfo.push(
        `${tripData.passengers.children} Child${tripData.passengers.children > 1 ? "ren" : ""}`
      );
    if (tripData.passengers.infants)
      passengerInfo.push(
        `${tripData.passengers.infants} Infant${tripData.passengers.infants > 1 ? "s" : ""}`
      );

    doc.text(passengerInfo.join(", "), margins.left, yPosition);
    yPosition += 15;
    drawDivider();
  }

  // Flight Information
  addNewPageIfNeeded(80);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Flight Information", margins.left, yPosition);
  yPosition += 10;

  // Outbound Flight
  if (tripData.Flight?.Outbound) {
    drawFlightCard(
      doc,
      tripData.Flight.Outbound,
      "Outbound Flight",
      margins,
      yPosition,
      contentWidth
    );
    yPosition += 50;
  }

  // Return Flight
  if (tripData.Flight?.Return) {
    addNewPageIfNeeded(60);
    drawFlightCard(
      doc,
      tripData.Flight.Return,
      "Return Flight",
      margins,
      yPosition,
      contentWidth
    );
    yPosition += 50;
  }

  drawDivider();

  // Hotel Information
  addNewPageIfNeeded(80);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Accommodation", margins.left, yPosition);
  yPosition += 10;

  if (tripData.Hotel) {
    const hotel = tripData.Hotel;

    // Hotel name and rating
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(hotel.name, margins.left, yPosition);

    // Draw star rating
    if (hotel.rating) {
      const stars =
        "★".repeat(Math.floor(hotel.rating)) +
        "☆".repeat(5 - Math.floor(hotel.rating));
      doc.setTextColor(251, 191, 36);
      doc.text(
        stars,
        margins.left + doc.getTextWidth(hotel.name) + 5,
        yPosition
      );
    }
    yPosition += 8;

    // Hotel details
    doc.setFont(undefined, "normal");
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);

    if (hotel.address) {
      doc.text(`📍 ${hotel.address}`, margins.left, yPosition);
      yPosition += 6;
    }

    if (hotel.description) {
      const lines = doc.splitTextToSize(hotel.description, contentWidth);
      doc.text(lines, margins.left, yPosition);
      yPosition += lines.length * 5 + 5;
    }

    // Amenities
    if (hotel.amenities && hotel.amenities.length > 0) {
      doc.setFont(undefined, "bold");
      doc.text("Amenities:", margins.left, yPosition);
      yPosition += 6;

      doc.setFont(undefined, "normal");
      const amenitiesText = hotel.amenities.join(" • ");
      const amenitiesLines = doc.splitTextToSize(amenitiesText, contentWidth);
      doc.text(amenitiesLines, margins.left, yPosition);
      yPosition += amenitiesLines.length * 5 + 10;
    }
  }

  drawDivider();

  // Activities Section
  addNewPageIfNeeded(60);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Planned Activities", margins.left, yPosition);
  yPosition += 10;

  if (tripData.Activities && tripData.Activities.length > 0) {
    tripData.Activities.forEach((activity, index) => {
      addNewPageIfNeeded(25);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(107, 114, 128);

      // Activity name
      const activityText =
        typeof activity === "object" ? activity.name : activity;
      doc.text(`${index + 1}. ${activityText}`, margins.left, yPosition);
      yPosition += 6;

      // Activity details if available
      if (typeof activity === "object") {
        if (activity.duration) {
          doc.setFontSize(9);
          doc.text(
            `   Duration: ${activity.duration}`,
            margins.left + 5,
            yPosition
          );
          yPosition += 5;
        }
        if (activity.price) {
          doc.text(`   Price: $${activity.price}`, margins.left + 5, yPosition);
          yPosition += 5;
        }
        if (activity.childFriendly) {
          doc.setTextColor(16, 185, 129);
          doc.text(`   ✓ Family Friendly`, margins.left + 5, yPosition);
          doc.setTextColor(107, 114, 128);
          yPosition += 5;
        }
      }
      yPosition += 3;
    });
  }

  // Weather Forecast
  if (tripData.Weather && tripData.Weather.length > 0) {
    addNewPageIfNeeded(80);
    drawDivider();

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Weather Forecast", margins.left, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    tripData.Weather.forEach((day) => {
      addNewPageIfNeeded(20);

      // Day header
      doc.setFont(undefined, "bold");
      doc.text(day.day, margins.left, yPosition);

      // Weather info
      doc.setFont(undefined, "normal");
      const weatherInfo = `${day.condition} • High: ${day.high}°C • Low: ${day.low}°C`;
      doc.text(weatherInfo, margins.left + 30, yPosition);
      yPosition += 6;
    });
  }

  // Footer
  addNewPageIfNeeded(40);
  yPosition = pageHeight - 30;
  drawDivider();

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("Generated by AI Travel Planner", pageWidth / 2, yPosition, {
    align: "center",
  });
  doc.text(
    `Document created on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    yPosition + 5,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `AI-Travel-${tripData.Destination?.replace(/\s+/g, "-") || "Trip"}-Itinerary.pdf`;
  doc.save(fileName);
}

// Helper function to draw flight cards
function drawFlightCard(doc, flight, title, margins, yPos, contentWidth) {
  const cardHeight = 40;

  // Card background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margins.left, yPos, contentWidth, cardHeight, 3, 3, "F");

  // Flight title
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(title, margins.left + 5, yPos + 8);

  // Flight details
  doc.setFont(undefined, "normal");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);

  // Route
  doc.text(`Route: ${flight.route}`, margins.left + 5, yPos + 16);

  // Times
  doc.text(`Departure: ${flight.departure}`, margins.left + 5, yPos + 23);
  doc.text(`Arrival: ${flight.arrival}`, margins.left + 80, yPos + 23);

  // Duration and airline
  doc.text(`Duration: ${flight.duration}`, margins.left + 5, yPos + 30);
  doc.text(
    `${flight.airline} - ${flight.flightNumber}`,
    margins.left + 80,
    yPos + 30
  );

  // Aircraft
  if (flight.aircraft) {
    doc.text(`Aircraft: ${flight.aircraft}`, margins.left + 5, yPos + 37);
  }
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// API endpoint for PDF generation
// pages/api/generate-pdf.js
import { generateItineraryPDF } from "../../utils/generateItineraryPDF";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tripData } = req.body;

    if (!tripData) {
      return res.status(400).json({ error: "Trip data is required" });
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(tripData);

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="trip-itinerary.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

// Helper function to generate PDF as buffer (for API response)
async function generatePDFBuffer(tripData) {
  const doc = new jsPDF();
  // ... same PDF generation logic as above ...

  // Instead of saving, return as buffer
  return doc.output("arraybuffer");
}
